import { Resolver, Query, Mutation, Subscription, Arg, Ctx, Root, ResolverFilterData, FieldResolver, Authorized } from 'type-graphql'
import { Context } from 'src/types'

import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'

import { User } from '../user/User'
import { Room } from '../room/Room'
import { RoomModuleState } from './RoomModuleState'

import { roomModules } from 'src/room-modules/modules'
import { RoomModuleType } from 'room-module-types'

import { JSONObject } from 'src/types'
import {
  RoomModuleStateDiff,
  RoomModuleStateUpdateWithContextPayload,
  RoomModuleStateUpdate,
  RoomModuleStateUpdatePayload,
  STATE_UPDATE_TOPIC,
  STATE_W_CONTEXT_UPDATE_TOPIC,
} from './types'

import { pubSub } from 'src/pubSub'

import { diff } from 'src/diff'

const getStateTransformer = (moduleType: RoomModuleType) => {
  const { transformState } = roomModules[moduleType]
  return transformState || (state => state)
}

@Resolver(RoomModuleState)
class RoomModuleStateResolver {
  constructor(
    @InjectRepository(User) readonly userRepository: Repository<User>,
    @InjectRepository(Room) readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomModuleState) readonly roomModuleStateRepository: Repository<RoomModuleState>,
  ) {
    pubSub.subscribe(STATE_UPDATE_TOPIC, this.handleStateUpdate)
  }

  @Authorized()
  @Query(returns => [RoomModuleState])
  async roomModuleStates(@Ctx() { user: currentUser }: Context) {
    const user = await this.userRepository.findOneOrFail(currentUser.id)
    if(!user.roomId) {
      return []
    }
    return await this.getRoomModuleStates(user.roomId)
  }

  async getRoomModuleStates(roomId: number) {
    const room = await this.roomRepository.findOneOrFail(roomId)
    const roomModuleStates = await this.roomModuleStateRepository.find({
      where: { room },
    })
    return roomModuleStates
  }

  @Authorized()
  @Query(returns => RoomModuleState, { nullable: true })
  async roomModuleState(
    @Ctx() { user: currentUser }: Context,
    @Arg('moduleType', types => RoomModuleType) moduleType: RoomModuleType,
  ) {
    const user = await this.userRepository.findOneOrFail(currentUser.id)
    if(!user.roomId) {
      return {}
    }
    return await this.getRoomModuleState(user.roomId, moduleType)
  }

  async getRoomModuleState(roomId: number, moduleType: RoomModuleType) {
    const room = await this.roomRepository.findOneOrFail(roomId)
    const roomModuleState = await this.roomModuleStateRepository.findOne({
      where: { room, moduleType },
    })
    return roomModuleState || null
  }

  @FieldResolver()
  async state(
    @Root() roomModuleState: RoomModuleState,
    @Ctx() { user: { id: userId } }: Context,
  ) {
    const room = await this.roomRepository.findOneOrFail(roomModuleState.roomId)
    const transformState = getStateTransformer(roomModuleState.moduleType)
    const roomContext = await this.composeRoomStatesContext(roomModuleState.roomId)
    return transformState(roomModuleState.state, {
      userId,
      ownerId: room.ownerId,
      context: roomContext,
    })
  }


  @Authorized()
  @Mutation(returns => RoomModuleState)
  async updateRoomModuleState(
    @Ctx() { user: currentUser }: Context,
    @Arg('moduleType', types => RoomModuleType) moduleType: RoomModuleType,
    @Arg('action', types => JSONObject) action: any,
  ) {
    const user = await this.userRepository.findOneOrFail(currentUser.id)
    const roomId = user.roomId
    if(!roomId) {
      throw new Error('user is not in any room')
    }
    const room = await this.roomRepository.findOneOrFail(roomId)
    const roomModuleState = await this.roomModuleStateRepository.findOneOrFail({
      where: {
        room,
        moduleType,
      },
    })
    const moduleContext = {
      userId: user.id,
      ownerId: room.ownerId,
      context: await this.composeRoomStatesContext(room.id),
    }
    const { reducer, validate = ((...args) => null) } = roomModules[moduleType]
    const { state } = roomModuleState
    const err = validate(state, action, moduleContext)
    if(err) {
      throw err
    }
    const nextState = reducer(state, action, moduleContext)
    const delta = diff(state, nextState)
    if(!delta) {
      console.warn('user action makes no difference')
      return roomModuleState
    }
    roomModuleState.state = nextState
    await this.roomModuleStateRepository.save(roomModuleState)

    return roomModuleState
  }

  @Subscription({
    topics: STATE_W_CONTEXT_UPDATE_TOPIC,
    description: 'When state updated, get the updated state',
    filter: ({ args, payload, context }: ResolverFilterData<RoomModuleStateUpdateWithContextPayload>) => {
      const { roomId } = payload.context
      if(!args.moduleType) {
        return args.roomId === roomId
      }
      return args.roomId === roomId && args.moduleType === payload.moduleType
    },
  })
  roomModuleStateSubscription(
    @Ctx() { user: currentUser }: Context,
    @Root() { state: rawState, ownerId, rev, moduleType: payloadType, context }: RoomModuleStateUpdateWithContextPayload,
    @Arg('roomId') roomId: number,
    @Arg('moduleType', types => RoomModuleType, { nullable: true }) moduleType?: RoomModuleType,
  ): RoomModuleStateUpdate {
    const transformState = getStateTransformer(payloadType)
    const state = transformState(rawState, {
      ownerId,
      userId: currentUser.id,
      context: context.context,
    })
    return { state, rev, moduleType: payloadType }
  }

  @Subscription({
    topics: STATE_W_CONTEXT_UPDATE_TOPIC,
    description: 'When state updated, get the state diff between current and previous states',
    filter: ({ args, payload }: ResolverFilterData<RoomModuleStateUpdateWithContextPayload>) => {
      const { roomId } = payload.context
      if(!args.moduleType) {
        return args.roomId === roomId
      }
      return args.roomId === roomId && args.moduleType === payload.moduleType
    },
  })
  roomModuleStateDiffSubscription(
    @Ctx() { user: currentUser }: Context,
    @Root() {
      state,
      prevState,
      rev,
      ownerId,
      moduleType: payloadType,
      context,
    }: RoomModuleStateUpdateWithContextPayload,
    @Arg('roomId') roomId: number,
    @Arg('moduleType', types => RoomModuleType, { nullable: true }) moduleType?: RoomModuleType,
  ): RoomModuleStateDiff {
    const transformState = getStateTransformer(payloadType)
    const moduleContext = {
      ownerId,
      userId: currentUser.id,
      context: context.context,
    }
    const oldState = transformState(prevState, moduleContext)
    const newState = transformState(state, moduleContext)
    const delta = diff(oldState, newState)
    return { diff: delta, rev, moduleType: payloadType }
  }


  private handleStateUpdate = async ({
    moduleType, state, prevState, rev, roomId,
  }: RoomModuleStateUpdatePayload) => {
    const room = await this.roomRepository.findOneOrFail(roomId)
    const context = {
      roomId,
      context: await this.composeRoomStatesContext(roomId),
    }
    const payload: RoomModuleStateUpdateWithContextPayload = {
      moduleType,
      prevState,
      state,
      rev,
      ownerId: room.ownerId,
      context,
    }
    pubSub.publish(STATE_W_CONTEXT_UPDATE_TOPIC, payload)
  }

  private composeRoomStatesContext = async (roomId: number) => {
    return  (await this.roomModuleStateRepository.find({
      where: {
        roomId,
      },
    })).reduce((acc, r) => {
      acc[r.moduleType] = r.state
      return acc
    }, {})
  }
}

export default RoomModuleStateResolver

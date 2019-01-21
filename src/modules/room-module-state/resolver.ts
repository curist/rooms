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
import { RoomModuleStateDiff, RoomModuleStateDiffPayload, RoomModuleStateUpdate, STATE_UPDATE_TOPIC } from './types'

import { diff } from 'jsondiffpatch'

@Resolver(RoomModuleState)
class RoomModuleStateResolver {
  constructor(
    @InjectRepository(User) readonly userRepository: Repository<User>,
    @InjectRepository(Room) readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomModuleState) readonly roomModuleStateRepository: Repository<RoomModuleState>,
  ) {}

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
    return await this.transformState(roomModuleState.state, {
      userId,
      moduleType: roomModuleState.moduleType,
      ownerId: roomModuleState.ownerId,
    })
  }

  transformState(state, { userId, moduleType, ownerId }) {
    const { transformState } = roomModules[moduleType]
    if(!transformState) {
      return state
    }
    const moduleContext = {
      userId,
      ownerId,
    }
    return transformState(state, moduleContext)
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
    const roomModuleStates = (await this.roomModuleStateRepository.find({
      where: {
        room,
      },
    })).reduce((acc, r) => {
      acc[r.moduleType] = r.state
      return acc
    }, {})
    const moduleContext = {
      userId: user.id,
      ownerId: room.ownerId,
      context: roomModuleStates,
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
    roomModuleState.state = await this.transformState(roomModuleState.state, {
      userId: user.id,
      ownerId: roomModuleState.ownerId,
      moduleType: roomModuleState.moduleType,
    })
    return roomModuleState
  }

  @Subscription({
    topics: STATE_UPDATE_TOPIC,
    description: 'When state updated, get the updated state',
    filter: ({ args, payload, context }: ResolverFilterData<RoomModuleStateDiffPayload>) => {
      if(!args.moduleType) {
        return args.roomId === payload.roomId
      }
      return args.roomId === payload.roomId && args.moduleType === payload.moduleType
    },
  })
  roomModuleStateSubscription(
    @Ctx() { user: currentUser }: Context,
    @Root() { state: rawState, moduleType: payloadType, ownerId }: RoomModuleStateDiffPayload,
    @Arg('roomId') roomId: number,
    @Arg('moduleType', types => RoomModuleType, { nullable: true }) moduleType?: RoomModuleType,
  ): RoomModuleStateUpdate {
    const state = this.transformState(rawState, {
      userId: currentUser.id,
      moduleType: payloadType,
      ownerId,
    })
    return { state, moduleType: payloadType }
  }

  @Subscription({
    topics: STATE_UPDATE_TOPIC,
    description: 'When state updated, get the state diff between current and previous states',
    filter: ({ args, payload }: ResolverFilterData<RoomModuleStateDiffPayload>) => {
      if(!args.moduleType) {
        return args.roomId === payload.roomId
      }
      return args.roomId === payload.roomId && args.moduleType === payload.moduleType
    },
  })
  roomModuleStateDiffSubscription(
    @Ctx() { user: currentUser }: Context,
    @Root() { diff, rev, moduleType: payloadType }: RoomModuleStateDiffPayload,
    @Arg('roomId') roomId: number,
    @Arg('moduleType', types => RoomModuleType, { nullable: true }) moduleType?: RoomModuleType,
  ): RoomModuleStateDiff {
    return { diff, rev, moduleType: payloadType }
  }
}

export default RoomModuleStateResolver

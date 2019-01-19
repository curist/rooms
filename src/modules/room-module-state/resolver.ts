import { Resolver, Query, Mutation, Subscription, Arg, Ctx, Root, ResolverFilterData, PubSub, Publisher, FieldResolver } from 'type-graphql'
import { Context } from 'src/types'

import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'

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
    @InjectRepository(Room) readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomModuleState) readonly roomModuleStateRepository: Repository<RoomModuleState>,
  ) {}

  @Query(returns => [RoomModuleState])
  async roomModuleStates(@Arg('roomId') roomId: number) {
    const room = await this.roomRepository.findOneOrFail(roomId)
    const roomModuleStates = await this.roomModuleStateRepository.find({
      where: { room },
    })
    return roomModuleStates
  }

  @Query(returns => RoomModuleState, { nullable: true })
  async roomModuleState(
    @Arg('roomId') roomId: number,
    @Arg('moduleType', types => RoomModuleType) moduleType: RoomModuleType,
  ) {
    const room = await this.roomRepository.findOneOrFail(roomId)
    const roomModuleState = await this.roomModuleStateRepository.findOne({
      where: { room, moduleType },
    })
    return roomModuleState
  }

  @FieldResolver()
  async state(
    @Root() roomModuleState: RoomModuleState,
    @Ctx() { user: { id: userId } }: Context,
  ) {
    const { state, moduleType } = roomModuleState
    const { transformState } = roomModules[moduleType]
    if(!transformState) {
      return state
    }
    const room = await this.roomRepository.findOneOrFail(roomModuleState.roomId)
    const roomModuleStates = (await this.roomModuleStateRepository.find({
      where: {
        roomId: roomModuleState.roomId,
      },
    })).reduce((acc, r) => {
      acc[r.moduleType] = r.state
      return acc
    }, {})
    const moduleContext = {
      userId,
      ownerId: room.ownerId,
      context: roomModuleStates,
    }
    return transformState(state, moduleContext)
  }

  @Mutation(returns => RoomModuleState)
  async updateRoomModuleState(
    @PubSub(STATE_UPDATE_TOPIC) publish: Publisher<RoomModuleStateDiffPayload>,
    @Ctx() { user }: Context,
    @Arg('roomId') roomId: number,
    @Arg('moduleType', types => RoomModuleType) moduleType: RoomModuleType,
    @Arg('action', types => JSONObject) action: any,
  ) {
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
    const { reducer } = roomModules[moduleType]
    const { state } = roomModuleState
    const nextState = reducer(state, action, moduleContext)
    const delta = diff(state, nextState)
    if(!delta) {
      console.warn('user action makes no difference')
      return roomModuleState
    }
    roomModuleState.state = nextState
    await this.roomModuleStateRepository.save(roomModuleState)
    await publish({
      roomId,
      moduleType,
      diff: delta,
      state: nextState,
      rev: roomModuleState.rev
    })
    return roomModuleState
  }

  @Subscription({
    topics: STATE_UPDATE_TOPIC,
    description: 'When state updated, get the updated state',
    filter: ({ args, payload }: ResolverFilterData<RoomModuleStateDiffPayload>) => {
      if(!args.moduleType) {
        return args.roomId === payload.roomId
      }
      return args.roomId === payload.roomId && args.moduleType === payload.moduleType
    },
  })
  roomModuleStateSubscription(
    @Root() { state, moduleType: payloadType }: RoomModuleStateDiffPayload,
    @Arg('roomId') roomId: number,
    @Arg('moduleType', types => RoomModuleType, { nullable: true }) moduleType?: RoomModuleType,
  ): RoomModuleStateUpdate {
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
    @Root() { diff, rev, moduleType: payloadType }: RoomModuleStateDiffPayload,
    @Arg('roomId') roomId: number,
    @Arg('moduleType', types => RoomModuleType, { nullable: true }) moduleType?: RoomModuleType,
  ): RoomModuleStateDiff {
    return { diff, rev, moduleType: payloadType }
  }
}

export default RoomModuleStateResolver

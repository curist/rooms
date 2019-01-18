import { Resolver, Query, Mutation, Subscription, Arg, Ctx, Root, ResolverFilterData, PubSub, Publisher } from 'type-graphql'
import { Context } from 'src/types'

import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'

import { Room } from '../room/Room'
import { RoomModuleState } from './RoomModuleState'

import { roomModules } from 'src/room-modules/modules'
import { RoomModuleType } from 'src/room-modules/types'

import { JSONObject } from 'src/types'
import { RoomModuleStateDiff, RoomModuleStateDiffPayload, STATE_UPDATE_TOPIC } from './types'

import { diff } from 'jsondiffpatch'

@Resolver(RoomModuleState)
class RoomModuleStateResolver {
  constructor(
    @InjectRepository(Room) readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomModuleState) readonly roomModuleStateRepository: Repository<RoomModuleState>,
  ) {}

  // XXX for debug use only
  @Query(returns => [RoomModuleState])
  _roomModuleStates() {
    return this.roomModuleStateRepository.find()
  }

  @Query(returns => [RoomModuleState])
  async roomModuleStates(@Arg('roomId') roomId: number) {
    const room = await this.roomRepository.findOneOrFail(roomId)
    const roomModuleStates = await this.roomModuleStateRepository.find({
      where: { room },
    })
    return roomModuleStates
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
      rev: roomModuleState.rev
    })
    return roomModuleState
  }

  @Subscription({
    topics: STATE_UPDATE_TOPIC,
    filter: ({ args, payload }: ResolverFilterData<RoomModuleStateDiffPayload>) => {
      return args.roomId === payload.roomId && args.moduleType === payload.moduleType
    },
  })
  roomModuleStateDiff(
    @Root() { diff, rev }: RoomModuleStateDiffPayload,
    @Arg('roomId') roomId: number,
    @Arg('moduleType', types => RoomModuleType) moduleType: RoomModuleType,
  ): RoomModuleStateDiff {
    return { diff, rev }
  }
}

export default RoomModuleStateResolver

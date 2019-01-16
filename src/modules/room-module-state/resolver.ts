import { Resolver, Query, Mutation, Arg, Ctx, Authorized } from 'type-graphql'

import { Context } from '../../types'

import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'

import { Room } from '../room/Room'
import { RoomModuleState } from './RoomModuleState'
import { RoomModuleType, roomModules } from '../room/room-modules'

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
    @Arg('roomId') roomId: number,
    @Arg('moduleType') moduleType: RoomModuleType,
    @Arg('action') action: Object,
  ) {
    const room = await this.roomRepository.findOneOrFail(roomId)
    const roomModuleState = await this.roomModuleStateRepository.findOneOrFail({
      where: {
        room,
        moduleType,
      },
    })
    const { reducer } = roomModules[moduleType]
    const { state } = roomModuleState
    roomModuleState.state = reducer(state, action)
    await this.roomModuleStateRepository.save(roomModuleState)
    return roomModuleState
  }
}

export default RoomModuleStateResolver

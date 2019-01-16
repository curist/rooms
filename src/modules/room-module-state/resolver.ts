import { Resolver, Query, Mutation, Arg } from 'type-graphql'

import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'

import { Room } from '../room/Room'
import { RoomModuleState } from './RoomModuleState'

import { roomModules } from '../../room-modules/modules'
import { RoomModuleType } from '../../room-modules/types'

import { JSONObject } from '../../types'

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
    const { reducer } = roomModules[moduleType]
    const { state } = roomModuleState
    roomModuleState.state = reducer(state, action)
    await this.roomModuleStateRepository.save(roomModuleState)
    return roomModuleState
  }

}

export default RoomModuleStateResolver

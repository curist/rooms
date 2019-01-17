import { Resolver, Query, Mutation, Arg, Ctx } from 'type-graphql'
import { Context } from 'src/types'

import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'

import { Room } from '../room/Room'
import { RoomModuleState } from './RoomModuleState'

import { roomModules } from 'src/room-modules/modules'
import { RoomModuleType } from 'src/room-modules/types'

import { JSONObject } from 'src/types'

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
      context: roomModuleStates,
    }
    const { reducer } = roomModules[moduleType]
    const { state } = roomModuleState
    roomModuleState.state = reducer(state, action, moduleContext)
    await this.roomModuleStateRepository.save(roomModuleState)
    return roomModuleState
  }

}

export default RoomModuleStateResolver

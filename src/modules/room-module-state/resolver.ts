import { Resolver, Query, Mutation, Arg, Ctx, Authorized } from 'type-graphql'

import { Context } from '../../types'

import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'

import { Room } from '../room/Room'
import { RoomModuleState } from './RoomModuleState'

import { roomModules } from '../../room-modules/modules'
import { RoomModuleType, RoomModuleTypeScalar } from '../../room-modules/types'

import GraphQLJSON from 'graphql-type-json'
import { JSONObject } from './RoomModuleState'

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
    @Arg('moduleType', types => RoomModuleTypeScalar ) moduleType: RoomModuleType,
    @Arg('action', types => GraphQLJSON) action: GraphQLJSON,
  ) {
    console.log(action)
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

  @Mutation(returns => RoomModuleState)
  async chatroom_appendMessage(
    @Arg('roomId') roomId: number,
    @Arg('message') message: string,
  ) {
    const room = await this.roomRepository.findOneOrFail(roomId)
    const roomModuleState = await this.roomModuleStateRepository.findOneOrFail({
      where: {
        room,
        moduleType: 'chat',
      },
    })
    const { reducer } = roomModules.chat
    const { state } = roomModuleState
    roomModuleState.state = reducer(state, {
      type: 'appendMessage',
      message,
    })
    await this.roomModuleStateRepository.save(roomModuleState)
    return roomModuleState
  }
}

export default RoomModuleStateResolver

import { Resolver, Query, Mutation, Arg, Ctx, Authorized } from 'type-graphql'

import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'

import { Room } from '../../modules/room/Room'
import { RoomModuleState } from '../../modules/room-module-state/RoomModuleState'

import roomModule from './module'
import { RoomModuleType, RoomModuleTypeScalar } from '../../room-modules/types'

const { reducer } = roomModule

@Resolver()
export class ChatResolver {
  constructor(
    @InjectRepository(Room) readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomModuleState) readonly roomModuleStateRepository: Repository<RoomModuleState>,
  ) {}

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
    const { state } = roomModuleState
    roomModuleState.state = reducer(state, {
      type: 'appendMessage',
      message,
    })
    await this.roomModuleStateRepository.save(roomModuleState)
    return roomModuleState
  }
}


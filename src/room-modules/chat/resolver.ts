import { Resolver, Mutation, Arg, Ctx } from 'type-graphql'
import { Context } from 'src/types'

import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'

import { Room } from 'src/modules/room/Room'
import { RoomModuleState } from 'src/modules/room-module-state/RoomModuleState'

import roomModule from './module'

const { reducer } = roomModule

@Resolver()
export class ChatResolver {
  constructor(
    @InjectRepository(Room) readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomModuleState) readonly roomModuleStateRepository: Repository<RoomModuleState>,
  ) {}

  @Mutation(returns => RoomModuleState)
  async chatroom_appendMessage(
    @Ctx() { user }: Context,
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
    }, {
      userId: user.id,
      ownerId: room.ownerId,
    })
    await this.roomModuleStateRepository.save(roomModuleState)
    return roomModuleState
  }
}


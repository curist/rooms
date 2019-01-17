import { Resolver, Mutation, Arg, Ctx } from 'type-graphql'
import { Context } from 'src/types'

import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'

import { Room } from 'src/modules/room/Room'
import { RoomModuleState } from 'src/modules/room-module-state/RoomModuleState'

import { PlayerRoomModuleActionType } from './types'

import roomModule from './module'

const { reducer } = roomModule

@Resolver()
export class PlayersResolver {
  constructor(
    @InjectRepository(Room) readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomModuleState) readonly roomModuleStateRepository: Repository<RoomModuleState>,
  ) {}

  @Mutation(returns => RoomModuleState)
  async RM_players_dispatch(
    @Ctx() { user }: Context,
    @Arg('roomId') roomId: number,
    @Arg('action', types => PlayerRoomModuleActionType) action,
  ) {
    const room = await this.roomRepository.findOneOrFail(roomId)
    const roomModuleState = await this.roomModuleStateRepository.findOneOrFail({
      where: {
        room,
        moduleType: 'players',
      },
    })
    const { state } = roomModuleState
    roomModuleState.state = reducer(state, {
      type: action,
    }, {
      userId: user.id,
      ownerId: room.ownerId,
    })
    await this.roomModuleStateRepository.save(roomModuleState)
    return roomModuleState
  }
}


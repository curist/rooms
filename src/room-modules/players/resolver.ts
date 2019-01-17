import { PubSubEngine } from 'graphql-subscriptions'
import { Resolver, Mutation, Subscription, Arg, Root, Ctx, PubSub, ResolverFilterData } from 'type-graphql'
import { Context } from 'src/types'

import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'

import { Room } from 'src/modules/room/Room'
import { RoomModuleState } from 'src/modules/room-module-state/RoomModuleState'

import { PlayerRoomModuleActionType } from './types'

import roomModule from './module'

const { reducer } = roomModule

import { PlayerNotification, PlayerNotificationPayload } from './types'


@Resolver()
export class PlayersResolver {
  constructor(
    @InjectRepository(Room) readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomModuleState) readonly roomModuleStateRepository: Repository<RoomModuleState>,
  ) {}

  @Mutation(returns => RoomModuleState)
  async RM_players_dispatch(
    @PubSub() pubSub: PubSubEngine,
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
    if(action == PlayerRoomModuleActionType.Join) {
      await pubSub.publish('PLAYER_JOIN', {
        roomId,
        userId: user.id,
        action: 'join',
      })
    } else {
      await pubSub.publish('PLAYER_LEFT', {
        roomId,
        userId: user.id,
        action: 'left',
      })
    }
    return roomModuleState
  }

  @Subscription({
    topics: ['PLAYER_JOIN', 'PLAYER_LEFT'],
    filter: ({ args, payload }: ResolverFilterData<PlayerNotificationPayload>) => {
      return args.roomId === payload.roomId
    },
  })
  playersComeAndGo(
    @Root() { userId, action }: PlayerNotificationPayload,
    @Arg('roomId') roomId: number,
  ): PlayerNotification {
    const playerNoty: PlayerNotification = {
      userId,
      action,
      timestamp: new Date,
    }
    return playerNoty
  }
}


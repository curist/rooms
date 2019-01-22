import { Resolver, Query, Ctx, Authorized } from 'type-graphql'
import { Context } from 'src/types'

import { Repository, In } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'

import { RoomModuleType } from 'room-module-types'

import { User } from 'src/modules/user/User'
import { Room } from 'src/modules/room/Room'
import { RoomModuleState } from 'src/modules/room-module-state/RoomModuleState'

@Resolver()
export class PlayersResolver {
  constructor(
    @InjectRepository(User) readonly userRepository: Repository<User>,
    @InjectRepository(Room) readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomModuleState) readonly roomModuleStateRepository: Repository<RoomModuleState>,
  ) {}

  @Authorized()
  @Query(returns => [User])
  async players(
    @Ctx() { user: { id: userId } }: Context,
  ) {
    const user = await this.userRepository.findOneOrFail(userId)
    if(!user.roomId) {
      throw new Error('user is not in any room')
    }
    const moduleState = await this.roomModuleStateRepository.findOneOrFail({
      where: {
        roomId: user.roomId,
        moduleType: RoomModuleType.Players,
      }
    })
    const users = await this.userRepository.find({
      where: {
        id: In((moduleState.state as any).players)
      }
    })
    return users
  }

}


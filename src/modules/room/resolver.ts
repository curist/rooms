import { Resolver, Query, Mutation, Arg, Ctx, Authorized } from 'type-graphql'

import { Context } from 'src/types'

import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'

import { User } from '../user/User'
import { Room } from './Room'
import { RoomModuleState } from '../room-module-state/RoomModuleState'

import { roomModules } from  'src/room-modules/modules'
import { RoomModuleType } from 'src/room-modules/types'


@Resolver(Room)
export default class RoomResolver {
  constructor(
    @InjectRepository(Room) readonly roomRepository: Repository<Room>,
    @InjectRepository(User) readonly userRepository: Repository<User>,
    @InjectRepository(RoomModuleState) readonly roomModuleStateRepository: Repository<RoomModuleState>,
  ) {}

  @Authorized()
  @Query(returns => Room, { nullable: true })
  async room(@Ctx() { user: currentUser }: Context) {
    const user = await this.userRepository.findOneOrFail(currentUser)
    const room = await this.roomRepository.findOne(user.room)
    return room
  }

  @Query(returns => [Room])
  rooms() {
    return this.roomRepository.find()
  }

  @Authorized()
  @Mutation(returns => Room)
  async createRoom(
    @Ctx() { user: currentUser }: Context,
    @Arg('name') name: string,
    @Arg('modules', type => [RoomModuleType], {
      nullable: true,
      defaultValue: [],
    }) modules?: RoomModuleType[],
  ) {
    const user = await this.userRepository.findOneOrFail(currentUser)
    const room = new Room()
    room.name = name
    room.roomModules = modules
    room.owner = user
    await this.roomRepository.save(room)
    user.room = room
    await this.userRepository.save(user)
    for(let m of modules) {
      const { defaultState } = roomModules[m]
      const moduleState = new RoomModuleState()
      moduleState.moduleType = m
      moduleState.room = room
      moduleState.state = defaultState
      await this.roomModuleStateRepository.save(moduleState)
    }
    return room
  }

  @Authorized()
  @Mutation(returns => Room)
  async setRoomModules(
    @Ctx() { user }: Context,
    @Arg('roomId') roomId: number,
    @Arg('modules', type => [RoomModuleType]) modules: RoomModuleType[],
  ) {
    // TODO how do we type check RoomModuleType
    // maybe use class-validator?
    const room = await this.roomRepository.findOneOrFail(roomId)

    if(room.owner.id !== user.id) {
      throw new Error('access denied')
    }
    room.roomModules = modules
    await this.roomRepository.save(room)
    return room
  }
}


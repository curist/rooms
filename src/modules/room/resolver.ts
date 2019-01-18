import { Resolver, Query, Mutation, Arg, Ctx, Authorized, Root, FieldResolver } from 'type-graphql'

import { Context } from 'src/types'

import { Repository, In } from 'typeorm'
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
    const room = await this.roomRepository.findOne(user.roomId)
    return room
  }

  @Authorized()
  @Query(returns => [Room])
  rooms() {
    return this.roomRepository.find()
  }

  @FieldResolver()
  async roomModuleStates(@Root() room: Room) {
    const states = await this.roomModuleStateRepository.find({
      where: {
        room,
        moduleType: In(room.roomModules),
      },
    })

    return states
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
    type ModuleToggle = {
      [k in RoomModuleType]?: boolean;
    }
    let allModules: ModuleToggle = {}
    for(let m of modules) {
      allModules[m] = true
      const { dependencies = [] } = roomModules[m]
      for(let dep of dependencies) {
        allModules[dep] = true
      }
    }
    for(let m in allModules) {
      const { defaultState } = roomModules[m]
      const moduleState = new RoomModuleState()
      moduleState.moduleType = m as RoomModuleType
      moduleState.room = room
      moduleState.state = defaultState
      await this.roomModuleStateRepository.save(moduleState)
    }
    return room
  }

}


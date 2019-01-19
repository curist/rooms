import { Resolver, Query, Mutation, Arg, Ctx, Authorized, Root, FieldResolver } from 'type-graphql'

import { Context } from 'src/types'

import { Repository, In } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'

import { User } from '../user/User'
import { Room } from './Room'
import { RoomModuleState } from '../room-module-state/RoomModuleState'

import { roomModules } from  'src/room-modules/modules'
import { RoomModuleType, RoomEventType } from 'room-module-types'


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
    if(!user.roomId) {
      return null
    }
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
        moduleType: In(room.roomModules.concat(room.roomModuleDeps)),
      },
    })

    return states
  }

  @Authorized()
  @Mutation(returns => Room)
  async createRoom(
    @Ctx() { user: currentUser }: Context,
    @Arg('name') name: string,
    @Arg('modules', types => [RoomModuleType], {
      nullable: true,
      defaultValue: [],
    }) modules?: RoomModuleType[],
  ) {
    enum ModuleOrDep {
      Module,
      Dep,
    }
    type ModuleToggle = {
      [k in RoomModuleType]?: ModuleOrDep;
    }
    const allModules: ModuleToggle = {}

    for(let m of modules) {
      allModules[m] = ModuleOrDep.Module
      const { dependencies = [] } = roomModules[m]
      for(let dep of dependencies) {
        if(!allModules[dep]) {
          allModules[dep] = ModuleOrDep.Dep
        }
      }
    }
    const roomModuleNames = []
    const roomModuleDeps = []

    for(let m in allModules) {
      if(allModules[m] === ModuleOrDep.Module) {
        roomModuleNames.push(m)
      } else {
        roomModuleDeps.push(m)
      }
    }

    const user = await this.userRepository.findOneOrFail(currentUser)
    const room = new Room()
    room.name = name
    room.roomModules = roomModuleNames
    room.roomModuleDeps = roomModuleDeps
    room.owner = user
    await this.roomRepository.save(room)
    for(let m in allModules) {
      const { defaultState } = roomModules[m]
      const moduleState = new RoomModuleState()
      moduleState.moduleType = m as RoomModuleType
      moduleState.room = room
      moduleState.state = defaultState
      await this.roomModuleStateRepository.save(moduleState)
    }

    await this.userJoinRoom(room.id, currentUser.id)
    return room
  }

  @Authorized()
  @Mutation(returns => Boolean)
  async joinRoom(
    @Ctx() { user: currentUser }: Context,
    @Arg('roomId') roomId: number,
  ) {
    // TODO some kind of authorization to determine if user can join or not
    return await this.userJoinRoom(roomId, currentUser.id)
  }

  @Authorized()
  @Mutation(returns => Boolean)
  async leaveRoom(
    @Ctx() { user: currentUser }: Context,
    @Arg('roomId') roomId: number,
  ) {
    return await this.userLeaveRoom(roomId, currentUser.id)
  }

  // XXX maybe we should handle the logic whether a user can join a room here
  async userJoinRoom(roomId, userId): Promise<boolean> {
    const user = await this.userRepository.findOneOrFail(userId)
    if(user.roomId === roomId) {
      // already in the room, do nothing
      return false
    } else if(user.roomId !== null && user.roomId !== roomId) {
      await this.userLeaveRoom(roomId, userId)
    }
    const room = await this.roomRepository.findOneOrFail(roomId)
    const states = await this.roomModuleStateRepository.find({
      where: {
        room,
        moduleType: In(room.roomModules.concat(room.roomModuleDeps)),
      },
    })
    const roomModuleStates = states.reduce((acc, r) => {
      acc[r.moduleType] = r.state
      return acc
    }, {})
    const moduleContext = {
      userId,
      ownerId: room.ownerId,
      context: roomModuleStates,
    }
    // let room module states to react
    for(let state of states) {
      const roomModule = roomModules[state.moduleType]
      if(roomModule.hooks && roomModule.hooks[RoomEventType.UserJoinRoom]) {
        const reducer = roomModule.hooks[RoomEventType.UserJoinRoom]
        state.state = reducer(state.state, moduleContext)
        await this.roomModuleStateRepository.save(state)
      }
    }
    user.roomId = roomId
    await this.userRepository.save(user)
    return true
  }

  async userLeaveRoom(roomId, userId): Promise<boolean> {
    const user = await this.userRepository.findOneOrFail(userId)
    if(user.roomId !== roomId) {
      // XXX should not happen
      return false
    }
    const room = await this.roomRepository.findOneOrFail(roomId)
    const states = await this.roomModuleStateRepository.find({
      where: {
        room,
        moduleType: In(room.roomModules.concat(room.roomModuleDeps)),
      },
    })
    const roomModuleStates = states.reduce((acc, r) => {
      acc[r.moduleType] = r.state
      return acc
    }, {})
    const moduleContext = {
      userId,
      ownerId: room.ownerId,
      context: roomModuleStates,
    }
    // let room module states to react
    for(let state of states) {
      const roomModule = roomModules[state.moduleType]
      if(roomModule.hooks && roomModule.hooks[RoomEventType.UserLeaveRoom]) {
        const reducer = roomModule.hooks[RoomEventType.UserLeaveRoom]
        state.state = reducer(state.state, moduleContext)
        await this.roomModuleStateRepository.save(state)
      }
    }
    user.roomId = null
    await this.userRepository.save(user)
    return true
  }

}


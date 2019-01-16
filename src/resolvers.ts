import UserResolver from './modules/user/resolver'
import RoomResolver from './modules/room/resolver'
import RoomModuleStateResolver from './modules/room-module-state/resolver'

import roomModuleResolvers from './room-modules/resolvers'

export default [
  UserResolver,
  RoomResolver,
  RoomModuleStateResolver,

  ...roomModuleResolvers,
]

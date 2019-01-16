import UserResolver from 'src/modules/user/resolver'
import RoomResolver from 'src/modules/room/resolver'
import RoomModuleStateResolver from 'src/modules/room-module-state/resolver'

import roomModuleResolvers from 'src/room-modules/resolvers'

export default [
  UserResolver,
  RoomResolver,
  RoomModuleStateResolver,

  ...roomModuleResolvers,
]

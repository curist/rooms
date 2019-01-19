import { registerEnumType } from 'type-graphql'
import { RoomModuleType } from 'room-module-types'

registerEnumType(RoomModuleType, {
  name: 'RoomModuleType',
  description: 'Room module type enums',
})


import { registerEnumType } from 'type-graphql'

// TODO future action type
// shuffle
export enum PlayerRoomModuleActionType {
  Join = 'join',
  Leave = 'leave',
}

registerEnumType(PlayerRoomModuleActionType, {
  name: 'PlayerRoomModuleActionType',
})


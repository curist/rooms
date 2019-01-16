import { registerEnumType } from 'type-graphql'

// XXX add new room module type here XXX
export enum RoomModuleType {
  Chat = 'chat',
  Avalon = 'avalon',
}

export interface RoomReducerModule {
  defaultState: object;
  reducer: (state: object, action: object, userId?: number) => object;
  validate?: (state: object, action: object) => null | Error;
}

export type RoomModules = {
  [key in RoomModuleType]: RoomReducerModule;
}

registerEnumType(RoomModuleType, {
  name: 'RoomModuleType',
  description: 'Room module type enums',
})


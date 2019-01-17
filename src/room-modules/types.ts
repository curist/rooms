import { registerEnumType } from 'type-graphql'

// XXX add new room module type here XXX
export enum RoomModuleType {
  Chat = 'chat',
  Avalon = 'avalon',
}

export interface RoomModuleContext {
  userId: number;
  context?: {
    [key in RoomModuleType]: any;
  }
}

export interface RoomReducerModule {
  defaultState: object;
  reducer: (state: object, action: object, context: RoomModuleContext) => object;
  validate?: (state: object, action: object) => null | Error;
}

export type RoomModules = {
  [key in RoomModuleType]: RoomReducerModule;
}

registerEnumType(RoomModuleType, {
  name: 'RoomModuleType',
  description: 'Room module type enums',
})


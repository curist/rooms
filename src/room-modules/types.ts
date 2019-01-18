import { registerEnumType } from 'type-graphql'

// XXX add new room module type here XXX
export enum RoomModuleType {
  Players = 'players',
  Chat = 'chat',
  Avalon = 'avalon',
}

export interface RoomReducerModule {
  defaultState: object;
  reducer: (state: object, action: object, context: RoomModuleContext) => object;
  dependencies?: RoomModuleType[];
  validate?: (state: object, action: object) => null | Error;
  transformState?: (state: object, context: RoomModuleContext) => object;
}

export type RoomModules = {
  [key in RoomModuleType]: RoomReducerModule;
}

export interface RoomModuleContext {
  userId: number;
  ownerId: number;
  context?: {
    [key in RoomModuleType]?: any;
  }
}

registerEnumType(RoomModuleType, {
  name: 'RoomModuleType',
  description: 'Room module type enums',
})


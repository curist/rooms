export enum RoomModuleType {
  Players = 'players',
  Chat = 'chat',
  Avalon = 'avalon',
  Splendor = 'splendor',
}

export enum RoomEventType {
  UserJoinRoom,
  UserLeaveRoom,
}

export interface RoomReducerModule {
  defaultState: object;
  reducer: (state: object, action: object, context: RoomModuleContext) => object;
  dependencies?: RoomModuleType[];
  validate?: (state: object, action: object, context: RoomModuleContext) => null | Error;
  transformState?: (state: object, context: RoomModuleContext) => object;
  hooks?: {
    [k in RoomEventType]?: (state: object, context: RoomModuleContext) => object;
  };
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

export interface RoomModuleReducer<State, Action> {
  (state: State, action: Action, ctx: RoomModuleContext): State;
}

export interface RoomModuleValidator<State, Action> {
  (state: State, action: Action, ctx: RoomModuleContext): null | Error;
}

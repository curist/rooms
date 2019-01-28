import { ObjectType, Field } from 'type-graphql'
import { JSONObject } from 'src/types'

import { RoomModuleType } from 'room-module-types'

@ObjectType()
export class RoomModuleStateDiff {
  @Field(types => JSONObject)
  diff: object

  @Field()
  rev: number;

  @Field(types => RoomModuleType)
  moduleType: RoomModuleType;
}

@ObjectType()
export class RoomModuleStateUpdate {
  @Field(types => JSONObject)
  state: object

  @Field()
  rev: number;

  @Field(types => RoomModuleType)
  moduleType: RoomModuleType;
}

export interface RoomModuleStateUpdateWithContextPayload  {
  moduleType: RoomModuleType;
  prevState: object;
  state: object;
  rev: number;
  ownerId: number;
  context: {
    roomId: number;
    context: object;
  };
}

export interface RoomModuleStateUpdatePayload  {
  moduleType: RoomModuleType;
  roomId: number;
  prevState: object;
  state: object;
  rev: number;
}

export const STATE_UPDATE_TOPIC = 'ROOM_MODULE_STATE_UPDATED'
export const STATE_W_CONTEXT_UPDATE_TOPIC = 'ROOM_MODULE_STATE_WITH_CONTEXT_UPDATED'

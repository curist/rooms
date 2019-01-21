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

  @Field(types => RoomModuleType)
  moduleType: RoomModuleType;
}

export interface RoomModuleStateDiffPayload  {
  roomId: number;
  ownerId: number;
  moduleType: RoomModuleType;
  diff: object;
  state: object;
  rev: number;
}

export const STATE_UPDATE_TOPIC = 'ROOM_MODULE_STATE_UPDATED'

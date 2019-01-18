import { ObjectType, Field } from 'type-graphql'
import { JSONObject } from 'src/types'

import { RoomModuleType } from 'src/room-modules/types'

@ObjectType()
export class RoomModuleStateDiff {
  @Field(types => JSONObject)
  diff: object

  @Field()
  rev: number;

  @Field(types => RoomModuleType)
  moduleType: RoomModuleType;
}

export interface RoomModuleStateDiffPayload  {
  roomId: number;
  moduleType: RoomModuleType;
  diff: object;
  rev: number;
}

export const STATE_UPDATE_TOPIC = 'ROOM_MODULE_STATE_UPDATED'

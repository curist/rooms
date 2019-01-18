import { ObjectType, Field } from 'type-graphql'
import { JSONObject } from 'src/types'

@ObjectType()
export class RoomModuleStateDiff {
  @Field(types => JSONObject)
  diff: object

  @Field()
  rev: number;
}

export interface RoomModuleStateDiffPayload  {
  roomId: number;
  diff: object;
  rev: number;
}

export const STATE_UPDATE_TOPIC = 'ROOM_MODULE_STATE_UPDATED'
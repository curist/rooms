import { ObjectType, Field, registerEnumType } from 'type-graphql'

// TODO future action type
// shuffle
export enum PlayerRoomModuleActionType {
  Join = 'join',
  Leave = 'leave',
}

registerEnumType(PlayerRoomModuleActionType, {
  name: 'PlayerRoomModuleActionType',
})


@ObjectType()
export class PlayerNotification {
  @Field()
  userId: number;

  @Field()
  action: string;

  @Field(types => Date)
  timestamp: Date;
}

export interface PlayerNotificationPayload {
  roomId: number;
  userId: number;
  action: string;
}

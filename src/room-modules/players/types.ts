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
}

export interface PlayerNotificationPayload {
  userId: number;
}

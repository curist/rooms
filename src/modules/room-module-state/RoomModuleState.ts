import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm'
import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent } from 'typeorm'
import { ObjectType, Field } from 'type-graphql'

import { Room } from '../room/Room'
import { RoomModuleType } from 'src/room-modules/types'

import { JSONObject } from 'src/types'

@ObjectType({ description: 'RoomModuleState Type' })
@Entity()
@Unique(['room', 'moduleType'])
export class RoomModuleState {
  @Field()
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(type => Room)
  room: Room

  @Field(types => RoomModuleType)
  @Column({ type: String })
  moduleType: RoomModuleType

  @Column('simple-json')
  prevState: object

  @Field(types => JSONObject)
  @Column('simple-json')
  state: object

}

@EventSubscriber()
export class RoomModuleStateSubscriber implements EntitySubscriberInterface<RoomModuleState> {
  listenTo() {
    return RoomModuleState
  }

  beforeInsert(event: InsertEvent<RoomModuleState>) {
    event.entity.prevState = {}
  }

  beforeUpdate(event: UpdateEvent<RoomModuleState>) {
    event.entity.prevState = event.databaseEntity.state
  }
}

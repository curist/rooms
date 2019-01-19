import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm'
import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent } from 'typeorm'
import { ObjectType, Field } from 'type-graphql'

import { Room } from '../room/Room'
import { RoomModuleType } from 'room-module-types'

import { JSONObject } from 'src/types'

import { diff } from 'jsondiffpatch'

@ObjectType({ description: 'RoomModuleState Type' })
@Entity()
@Unique(['room', 'moduleType'])
export class RoomModuleState {
  @Field()
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(type => Room)
  room: Room
  @Column({ nullable: true })
  roomId: number

  @Field(types => RoomModuleType)
  @Column({ type: String })
  moduleType: RoomModuleType

  @Column('simple-json')
  prevState: object

  @Field(types => JSONObject)
  @Column('simple-json')
  state: object

  @Field()
  @Column({ default: 0 })
  rev: number
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
    const delta = diff(event.entity.state, event.databaseEntity.state)
    if(!delta) {
      return
    }

    event.entity.prevState = event.databaseEntity.state
    event.entity.rev = event.databaseEntity.rev + 1
  }
}

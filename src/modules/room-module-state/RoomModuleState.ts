import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm'
import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent } from 'typeorm'
import { ObjectType, Field } from 'type-graphql'
import {
  RoomModuleStateUpdatePayload,
  STATE_UPDATE_TOPIC,
} from './types'

import { pubSub } from 'src/pubSub'

import { Room } from '../room/Room'
import { RoomModuleType } from 'room-module-types'

import { JSONObject } from 'src/types'

import { diff } from 'src/diff'

@ObjectType({ description: 'RoomModuleState Type' })
@Entity()
@Unique(['room', 'moduleType'])
export class RoomModuleState {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(type => Room)
  room: Room
  @Column({ nullable: true })
  roomId: number

  @Column()
  ownerId: number

  @Field(types => RoomModuleType)
  @Column({ type: String })
  moduleType: RoomModuleType

  @Field(types => JSONObject)
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
    const delta = diff(event.databaseEntity.state, event.entity.state)
    if(!delta) {
      return
    }
    const { state: prevState } = event.databaseEntity
    const { roomId, state, moduleType, ownerId } = event.entity
    const rev = event.databaseEntity.rev + 1

    const payload: RoomModuleStateUpdatePayload = {
      moduleType,
      roomId,
      ownerId,
      state,
      prevState,
      rev,
    }
    pubSub.publish(STATE_UPDATE_TOPIC, payload)

    event.entity.prevState = prevState
    event.entity.rev = rev
  }
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm'
import { ObjectType, Field } from 'type-graphql'

import { Room } from '../room/Room'
import { RoomModuleType } from '../../room-modules/types'

import { JSONObject } from '../../types'

@ObjectType({ description: 'RoomModuleState Type' })
@Entity()
@Unique(['room', 'moduleType'])
export class RoomModuleState {
  @Field()
  @PrimaryGeneratedColumn()
  id: number

  @Field(type => Room)
  @ManyToOne(type => Room, { eager: true })
  room: Room

  @Field(types => RoomModuleType)
  @Column({ type: String })
  moduleType: RoomModuleType

  @Field(types => JSONObject)
  @Column('simple-json')
  state: object
}


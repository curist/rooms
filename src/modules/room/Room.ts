import { Entity, PrimaryGeneratedColumn, Column, ValueTransformer, ManyToOne } from 'typeorm'
import { ObjectType, Field } from 'type-graphql'

import { User } from '../user/User'
import { RoomModuleType, RoomModuleTypeScalar } from '../../room-modules/types'

@ObjectType({ description: 'Room Type' })
@Entity()
export class Room {

  @Field()
  @PrimaryGeneratedColumn()
  id: number

  @Field()
  @Column()
  name: string

  @Field(type => User)
  @ManyToOne(type => User, { eager: true })
  owner: User

  @Field(types => [RoomModuleTypeScalar])
  @Column('simple-array')
  roomModules: RoomModuleType[]
}


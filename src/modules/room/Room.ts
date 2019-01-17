import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { ObjectType, Field } from 'type-graphql'

import { User } from '../user/User'
import { RoomModuleType } from 'src/room-modules/types'

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
  @Column({ nullable: true })
  ownerId: number

  @Field(types => [RoomModuleType])
  @Column('simple-array')
  roomModules: RoomModuleType[]

}


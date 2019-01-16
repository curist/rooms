import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { ObjectType, Field } from 'type-graphql'

import { Room } from '../room/Room'

@ObjectType({ description: 'User Type' })
@Entity()
export class User {

  @Field()
  @PrimaryGeneratedColumn()
  id: number

  @Field()
  @Column({ unique: true })
  email: string

  @Field()
  @Column()
  displayName: string

  @Column()
  password: string

  @Field(type => Room, { nullable: true })
  @ManyToOne(type => Room)
  room: Room
}


import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne } from 'typeorm'
import { ObjectType, Field } from 'type-graphql'

import { Room } from '../room/Room'

@ObjectType({ description: 'User Type' })
@Entity()
@Unique(['email'])
export class User {

  @Field()
  @PrimaryGeneratedColumn()
  id: number

  @Field()
  @Column()
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


import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { ObjectType, Field } from 'type-graphql'

import { User } from './User'

@ObjectType({ description: 'Book Type' })
@Entity()
export class Book {

  @Field()
  @PrimaryGeneratedColumn()
  id: number

  @Field()
  @Column()
  title: string

  @Field(type => User)
  @ManyToOne(type => User, { eager: true })
  author: User

  @Field(type => Number)
  someNumber: number
}


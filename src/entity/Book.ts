import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { ObjectType, Field } from 'type-graphql'

import { ColumnOptions } from 'typeorm'
function RelationColumn(options?: ColumnOptions) {
  return Column({ nullable: true, ...options });
}

import { User } from './User'

@Entity()
@ObjectType({ description: 'Book Type' })
export class Book {

  @PrimaryGeneratedColumn()
  @Field()
  id: number

  @Column()
  @Field()
  title: string

  @Field(type => User)
  @ManyToOne(type => User)
  author: User
  @RelationColumn()
  authorId: number
}


import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { ObjectType, Field } from 'type-graphql'

import { Book } from './book'

@ObjectType({ description: 'User Type' })
@Entity()
export class User {

  @Field()
  @PrimaryGeneratedColumn()
  id: number

  @Field()
  @Column()
  firstName: string

  @Field()
  @Column()
  lastName: string

  @Field()
  @Column()
  age: number

  // @Field(type => [Book])
  // @OneToMany(type => Book, book => book.author)
  // books: Book[]

}


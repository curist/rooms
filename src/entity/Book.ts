import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm'
import { ObjectType, Field } from 'type-graphql'

@Entity()
@ObjectType({ description: 'Book Type' })
export class Book {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  @Field()
  title: string;

  @Column()
  @Field()
  author: string;
}


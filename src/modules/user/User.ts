import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm'
import { ObjectType, Field } from 'type-graphql'

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
}


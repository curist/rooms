import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { ObjectType, Field } from 'type-graphql'

@ObjectType({ description: 'User Type' })
@Entity()
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


import { ObjectType, Field } from 'type-graphql'

@ObjectType({ description: 'Book Type' })
export class Book {
  @Field()
  title: string;

  @Field()
  author: string;
}


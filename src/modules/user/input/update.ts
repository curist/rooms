import { InputType, Field } from 'type-graphql';
import { MaxLength, Length } from 'class-validator';


@InputType()
export class UpdateInput {
  @Field({ nullable: true })
  @MaxLength(60)
  displayName?: string

  @Field({ nullable: true })
  @MaxLength(100)
  password?: string
}

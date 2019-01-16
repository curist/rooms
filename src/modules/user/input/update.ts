import { InputType, Field } from 'type-graphql';
import { MaxLength } from 'class-validator';

@InputType()
export class UpdateInput {
  @Field({ nullable: true })
  @MaxLength(60)
  displayName?: string

  @Field({ nullable: true })
  @MaxLength(100)
  password?: string
}

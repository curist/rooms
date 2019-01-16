import { InputType, Field } from 'type-graphql';
import { MaxLength } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @MaxLength(60)
  email: string

  @Field()
  @MaxLength(100)
  password: string
}

import { InputType, Field } from 'type-graphql';
import { MaxLength, IsEmail } from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  @MaxLength(60)
  email: string

  @Field()
  @MaxLength(60)
  displayName: string

  @Field()
  @MaxLength(100)
  password: string
}

import { Resolver, Query, Mutation, Arg, Ctx } from 'type-graphql'
import { plainToClass } from 'class-transformer'
import bcrypt from 'bcrypt'

import { Context } from '../../types'

import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'

import { User } from './User'
import { RegisterInput } from './input/register'
import { LoginInput } from './input/login'

@Resolver(User)
class UserResolver {
  constructor(
    @InjectRepository(User) readonly userRepository: Repository<User>,
  ) {}

  @Query(returns => User, { nullable: true })
  async author(@Arg('authorName') authorName: string) {
    const author = await this.userRepository.createQueryBuilder('user')
      .where('LOWER(printf("%s %s", user.firstName, user.lastName)) LIKE LOWER(:author)', {
        author: `%${authorName}%` 
      })
      .getOne()
    return author
  }

  @Query(returns => [User])
  users() {
    return this.userRepository.find()
  }

  @Mutation(returns => User)
  async register(@Arg('data') data: RegisterInput) {
    if(data.password !== data.passwordConfirmation) {
      throw new Error('password and confirmation mismatched')
    }
    data.password = await bcrypt.hash(data.password, 10)
    const newUser = plainToClass(User, data)
    await this.userRepository.save(newUser)
    return newUser
  }

  @Mutation(returns => User)
  async login(
    @Arg('data') { email, password }: LoginInput,
    @Ctx() { req, res }: Context,
  ) {
    console.log(req.cookies)
    const user = await this.userRepository.findOne({ where: { email } })
    if(!user) {
      throw new Error('user not found')
    }
    const match = await bcrypt.compare(password, user.password)
    if(!match) {
      throw new Error('wrong password')
    }
    res.cookie('jwt', 'jjjjjwt')
    return user
  }
}

export default UserResolver

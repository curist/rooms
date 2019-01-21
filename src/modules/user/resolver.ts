import { Resolver, Query, Mutation, Arg, Ctx, Authorized } from 'type-graphql'
import { plainToClass } from 'class-transformer'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { Context } from 'src/types'

import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'

import { User } from './User'
import { RegisterInput } from './input/register'
import { LoginInput } from './input/login'
import { UpdateInput } from './input/update'

import { JWT_SECRET } from 'src/config'

@Resolver(User)
class UserResolver {
  constructor(
    @InjectRepository(User) readonly userRepository: Repository<User>,
  ) {}

  @Query(returns => [User])
  users() {
    return this.userRepository.find()
  }

  @Authorized()
  @Query(returns => User)
  me(@Ctx() { user }: Context) {
    return this.userRepository.findOneOrFail(user.id)
  }

  @Mutation(returns => User)
  async register(
    @Ctx() { res }: Context,
    @Arg('data') data: RegisterInput,
  ) {
    if(data.password !== data.passwordConfirmation) {
      throw new Error('password and confirmation mismatched')
    }
    data.password = await bcrypt.hash(data.password, 10)
    const newUser = plainToClass(User, data)
    await this.userRepository.save(newUser)
    this.handleLogin(res, newUser)
    return newUser
  }

  @Authorized()
  @Mutation(returns => User)
  async updateUser(
    @Arg('data') data: UpdateInput,
    @Ctx() { user: currentUser }: Context,
  ) {
    const user = await this.userRepository.findOne(currentUser.id)
    if(data.displayName) {
      user.displayName = data.displayName
    }
    if(data.password) {
      user.password = await bcrypt.hash(data.password, 10)
    }
    await this.userRepository.save(user)
    return user
  }

  @Mutation(returns => User)
  async login(
    @Arg('data') { email, password }: LoginInput,
    @Ctx() { res }: Context,
  ) {
    const user = await this.userRepository.findOneOrFail({ where: { email } })
    const match = await bcrypt.compare(password, user.password)
    if(!match) {
      throw new Error('wrong password')
    }
    this.handleLogin(res, user)
    return user
  }

  handleLogin(res, user) {
    const token = jwt.sign({
      id: user.id,
      email: user.email,
    }, JWT_SECRET, {
      expiresIn: '1h',
    })
    res.cookie('jwt', token, { httpOnly: true })
  }

  @Mutation(returns => Boolean)
  logout(@Ctx() { res }: Context) {
    res.clearCookie('jwt')
    return true
  }
}

export default UserResolver

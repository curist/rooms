import { Resolver, Query, Arg } from 'type-graphql'
import { User } from '../entity/User'

import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'

@Resolver(User)
class UserResolver {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  @Query(returns => [User])
  users() {
    return this.userRepository.find()
  }

}

export default UserResolver

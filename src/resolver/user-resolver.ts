import { Resolver, Query, Arg } from 'type-graphql'
import { User } from '../entity/User'

import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'

@Resolver(User)
class UserResolver {
  constructor(
    @InjectRepository(User) readonly userRepository: Repository<User>,
  ) {}

  @Query(returns => User)
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

}

export default UserResolver

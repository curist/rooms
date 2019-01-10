import { Resolver, Query, Arg, FieldResolver, Root } from 'type-graphql'
import { User } from '../entity/User'
import { Book } from '../entity/Book'

import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'

@Resolver(Book)
class BookResolver {
  constructor(
    @InjectRepository(User) readonly userRepository: Repository<User>,
    @InjectRepository(Book) readonly bookRepository: Repository<Book>,
  ) {}

  @Query(returns => [Book])
  books() {
    return this.bookRepository.find()
  }

  // XXX or maybe we should use 404?
  @Query(returns => [Book], {
    description: 'get books by author',
  })
  async authorBook(@Arg('authorName') authorName: string) {
    const author = await this.userRepository.createQueryBuilder('user')
      .where('LOWER(printf("%s %s", user.firstName, user.lastName)) LIKE LOWER(:author)', {
        author: `%${authorName}%` 
      })
      .getOne()
    if(!author) {
      return []
    }
    const books = await this.bookRepository.find({ where: { author } })
    return books
  }

  @FieldResolver()
  someNumber() {
    return +new Date
  }
}

export default BookResolver

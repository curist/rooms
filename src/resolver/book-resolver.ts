import { Resolver, Query, Arg, FieldResolver, Root } from 'type-graphql'
import { User } from '../entity/User'
import { Book } from '../entity/Book'

import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'

@Resolver(Book)
class BookResolver {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Book) private readonly bookRepository: Repository<Book>,
  ) {}

  @Query(returns => [Book])
  books() {
    return this.bookRepository.find()
  }

  // XXX or maybe we should use 404?
  // @Query(returns => Book, {
  //   nullable: true,
  //   description: 'get a specific book, can be null',
  // })
  // async book(@Arg('author') author: string) {
  //   const book = await this.bookRepository.createQueryBuilder('book')
  //     .where('LOWER(book.author) LIKE LOWER(:author)', { author: `%${author}%` })
  //     .getOne()
  //   return book
  // }

  @FieldResolver()
  author(@Root() book: Book) {
    return this.userRepository.findOne(book.authorId, { cache: 1000 });
  }
}

export default BookResolver

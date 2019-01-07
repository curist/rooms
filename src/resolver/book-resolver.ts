import { Resolver, Query, Arg } from 'type-graphql'
import { Book } from '../entity/Book'

import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'

@Resolver(Book)
class BookResolver {
  constructor(
    @InjectRepository(Book) private readonly bookRepository: Repository<Book>,
  ) {}

  @Query(returns => [Book])
  books() {
    return this.bookRepository.find()
  }

  // XXX or maybe we should use 404?
  @Query(returns => Book, {
    nullable: true,
    description: 'get a specific book, can be null',
  })
  async book(@Arg('author') author: string) {
    const book = await this.bookRepository.createQueryBuilder('book')
      .where('LOWER(book.author) LIKE LOWER(:author)', { author: `%${author}%` })
      .getOne()
    return book
  }
}

export default BookResolver

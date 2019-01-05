import { Resolver, Query, Arg } from 'type-graphql'
import { Book } from '../entity/Book'

const books: Array<Book> = [
  {
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
]

@Resolver(Book)
class BookResolver {
  @Query(returns => [Book])
  books() {
    return books
  }

  // XXX or maybe we should use 404?
  @Query(returns => Book, { nullable: true })
  book(@Arg('name') name: string) {
    const regexp = new RegExp(name, 'i')
    const book = books.find(b => regexp.test(b.author))
    return book
  }
}

export default BookResolver

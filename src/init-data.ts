import { createConnection } from 'typeorm'
import { User } from './entity/User'
import { Book } from './entity/Book'

export default async function init() {
  const connection = await createConnection()
  console.log('Inserting a new user into the database...')
  const rowling = new User()
  rowling.firstName = 'J.K.'
  rowling.lastName = 'Rowling'
  rowling.age = 42
  await connection.manager.save(rowling)

  console.log('Inserting a new book into the database...')
  const book1 = new Book()
  book1.title = 'Harry Potter and the Chamber of Secrets'
  book1.author = rowling

  const crichton = new User()
  crichton.firstName = 'Michael'
  crichton.lastName = 'Crichton'
  crichton.age = 42
  await connection.manager.save(crichton)

  const book2 = new Book()
  book2.title = 'Jurassic Park'
  book2.author = crichton

  await connection.manager.save(book1)
  await connection.manager.save(book2)
  console.log('Saved a new book with id: ' + book1.id)

  console.log('Loading books from the database...')
  const books = await connection.manager.find(Book)
  console.log('Loaded books: ', books)

  console.log('Here you can setup and run express/koa/any other framework.')
}


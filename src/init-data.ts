import { createConnection } from 'typeorm'
import { User } from './entity/User'
import { Book } from './entity/Book'

createConnection().then(async connection => {
  console.log('Inserting a new user into the database...');
  const user = new User();
  user.firstName = 'Timber';
  user.lastName = 'Saw';
  user.age = 25;

  await connection.manager.save(user);

  console.log('Inserting a new book into the database...');
  const book1 = new Book();
  book1.title = 'Harry Potter and the Chamber of Secrets'
  book1.author = 'J.K. Rowling'

  const book2 = new Book();
  book2.title = 'Jurassic Park'
  book2.author = 'Michael Crichton'

  await connection.manager.save(book1);
  await connection.manager.save(book2);
  console.log('Saved a new book with id: ' + book1.id);

  console.log('Loading books from the database...');
  const books = await connection.manager.find(Book);
  console.log('Loaded books: ', books);

  console.log('Here you can setup and run express/koa/any other framework.');

}).catch(error => console.log(error));


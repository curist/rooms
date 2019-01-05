import "reflect-metadata";
import {createConnection} from "typeorm";
import {User} from "./entity/User";

createConnection().then(async connection => {

  console.log("Inserting a new user into the database...");
  const user = new User();
  user.firstName = "Timber";
  user.lastName = "Saw";
  user.age = 25;
  return
  await connection.manager.save(user);
  console.log("Saved a new user with id: " + user.id);

  console.log("Loading users from the database...");
  const users = await connection.manager.find(User);
  console.log("Loaded users: ", users);

  console.log("Here you can setup and run express/koa/any other framework.");

}).catch(error => console.log(error));

import { ApolloServer, gql } from 'apollo-server';

import { ObjectType, Field, Resolver, Query, FieldResolver, Arg, buildSchema } from 'type-graphql'

@ObjectType()
class Book {
  @Field()
  title: string;

  @Field()
  author: string;
}

// This is a (sample) collection of books we'll be able to query
// the GraphQL server for.  A more complete example might fetch
// from an existing data source like a REST API or database.
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

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.

  # This "Book" type can be used in other type declarations.
  type Book {
    title: String
    author: String
  }

  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    books: [Book]
    book(name: String): Book
  }
`;

const delay = ms => new Promise(r => setTimeout(r, ms))
// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Query: {
    books: () => books,
    book: async (_, { name }) => {
      await delay(1000)
      const regexp = new RegExp(name, 'i')
      const book = books.find(b => regexp.test(b.author))
      return book
    }
  },
};

async function start() {
  const schema = await buildSchema({ resolvers: [BookResolver] })

  const server = new ApolloServer({ schema })
  const { url } = await server.listen()
  console.log(`🚀  Server ready at ${url}`)
}

start()

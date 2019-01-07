import 'reflect-metadata'
import { createConnection } from 'typeorm'
import { User } from './entity/User'

createConnection().then(async connection => {

  console.log('Inserting a new user into the database...');
  const user = new User();
  user.firstName = 'Timber';
  user.lastName = 'Saw';
  user.age = 25;

  await connection.manager.save(user);
  console.log('Saved a new user with id: ' + user.id);

  console.log('Loading users from the database...');
  const users = await connection.manager.find(User);
  console.log('Loaded users: ', users);

  console.log('Here you can setup and run express/koa/any other framework.');

}).catch(error => console.log(error));


import { ApolloServer, gql } from 'apollo-server';
import { buildSchema } from 'type-graphql'
import resolvers from './resolver/resolvers'

async function start() {
  // TODO build user query resolver
  const schema = await buildSchema({ resolvers })

  const server = new ApolloServer({ schema })
  const { url } = await server.listen()
  console.log(`🚀  Server ready at ${url}`)
}

start()

import 'reflect-metadata'

import { Container } from 'typedi'
import * as TypeORM from 'typeorm'
import * as TypeGraphQL from 'type-graphql'

TypeORM.useContainer(Container)
TypeGraphQL.useContainer(Container)

// only uncomment if we want to do that data initialization
// import 'init-data'

import * as express from 'express'
import { ApolloServer, gql } from 'apollo-server-express';
import { buildSchema } from 'type-graphql'
import resolvers from './resolver/resolvers'

async function start() {
  await TypeORM.createConnection()

  // TODO build user query resolver
  const schema = await buildSchema({ resolvers })

  const app = express()

  const server = new ApolloServer({ schema })
  server.applyMiddleware({ app })
  const port = process.env.PORT || 4000
  const url = await app.listen({ port })
  console.log(`🚀  Server started @ localhost:${port}`)
}

start()

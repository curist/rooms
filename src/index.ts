import 'reflect-metadata'

// only uncomment if we want to do that data initialization
// import 'init-data'

import express from 'express'
import { ApolloServer, gql } from 'apollo-server-express';
import { buildSchema } from 'type-graphql'
import resolvers from './resolver/resolvers'

async function start() {
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

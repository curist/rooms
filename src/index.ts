import 'reflect-metadata'

import { Container } from 'typedi'
import * as TypeORM from 'typeorm'
import * as TypeGraphQL from 'type-graphql'

TypeORM.useContainer(Container)
TypeGraphQL.useContainer(Container)

const { formatArgumentValidationError } = TypeGraphQL

import express from 'express'
import { ApolloServer, gql } from 'apollo-server-express';
import { buildSchema } from 'type-graphql'
import resolvers from './resolvers'
import entities from './entities'

async function start() {
  await TypeORM.createConnection({
    type: 'sqljs',
    location: 'database.sqlite',
    autoSave: true,
    synchronize: true,
    logging: true,
    entities,
  })

  // TODO build user query resolver
  const schema = await buildSchema({ resolvers })

  const app = express()

  const server = new ApolloServer({
    schema,
    context: ({ req, res }) => ({ req, res }),
    formatError: formatArgumentValidationError,
  })
  server.applyMiddleware({ app })
  const port = process.env.PORT || 4000
  const url = await app.listen({ port })
  console.log(`🚀  Server started @ localhost:${port}`)
}

start()

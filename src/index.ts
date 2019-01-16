import 'reflect-metadata'

import { Container } from 'typedi'
import * as TypeORM from 'typeorm'
import * as TypeGraphQL from 'type-graphql'

TypeORM.useContainer(Container)
TypeGraphQL.useContainer(Container)

const { formatArgumentValidationError } = TypeGraphQL

import express from 'express'
import cookieParser from 'cookie-parser'
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql'

import jwt from 'src/middlewares/jwt'
import resolvers from 'src/resolvers'
import entities from 'src/entities'
import { authChecker } from 'src/auth-checker'

async function start() {
  await TypeORM.createConnection({
    type: 'sqljs',
    location: 'database.sqlite',
    autoSave: true,
    synchronize: true,
    logging: false,
    entities,
  })

  const schema = await buildSchema({
    resolvers,
    authChecker,
  })

  const app = express()

  app.use(cookieParser())
  app.use(jwt)

  const server = new ApolloServer({
    schema,
    context: ({ req, res }) => ({ req, res, user: req.user }),
    formatError: formatArgumentValidationError,
  })
  server.applyMiddleware({ app })
  const port = process.env.PORT || 4000
  await app.listen({ port })
  console.log(`🚀  Server started @ localhost:${port}`)
}

start()

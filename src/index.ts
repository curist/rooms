import 'reflect-metadata'

import { Container } from 'typedi'
import * as TypeORM from 'typeorm'
import * as TypeGraphQL from 'type-graphql'

TypeORM.useContainer(Container)
TypeGraphQL.useContainer(Container)

const { formatArgumentValidationError } = TypeGraphQL

import { createServer } from 'http'
import express from 'express'
import cookieParser from 'cookie-parser'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'

import { SubscriptionServer } from 'subscriptions-transport-ws'
import { execute, subscribe } from 'graphql'

import jwt from 'src/middlewares/jwt'
import resolvers from 'src/resolvers'
import entities from 'src/entities'
import subscribers from 'src/subscribers'
import { authChecker } from 'src/auth-checker'

async function start() {
  await TypeORM.createConnection({
    type: 'sqljs',
    location: 'database.sqlite',
    autoSave: true,
    synchronize: true,
    logging: false,
    entities,
    subscribers,
  })

  const schema = await buildSchema({
    resolvers,
    authChecker,
  })

  const app = express()

  app.use(cookieParser())
  app.use(jwt)

  const apollo = new ApolloServer({
    schema,
    context: ({ req, res }) => ({ req, res, user: req.user }),
    formatError: formatArgumentValidationError,
  })
  apollo.applyMiddleware({ app })

  const server = createServer(app)

  const port = process.env.PORT || 4000

  server.listen(port, () => {
    new SubscriptionServer({
      execute,
      subscribe,
      schema,
    }, {
      server, path: '/graphql'
    })

    console.log(`🚀  Server started @ localhost:${port}`)
  })
}

start()

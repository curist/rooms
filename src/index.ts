import 'reflect-metadata'

import { Container } from 'typedi'
import * as TypeORM from 'typeorm'

TypeORM.useContainer(Container)

import { createServer } from 'http'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { pubSub } from 'src/pubSub'

import { SubscriptionServer } from 'subscriptions-transport-ws'
import { execute, subscribe } from 'graphql'

import cookie from 'cookie'
import jwt, { verify as verifyJWT } from 'src/middlewares/jwt'
import resolvers from 'src/resolvers'
import entities from 'src/entities'
import subscribers from 'src/subscribers'
import { authChecker } from 'src/auth-checker'

import './room-modules/register-types'

async function start() {
  await TypeORM.createConnection({
    type: 'sqlite',
    database: 'database.sqlite',
    synchronize: true,
    logging: false,
    entities,
    subscribers,
  })

  const schema = await buildSchema({
    resolvers,
    authChecker,
    pubSub,
    container: Container,
  })

  const app = express()

  if(process.env.NODE_ENV === 'development') {
    app.use(cors({
      origin: true,
      credentials: true,
    }))
  }
  app.use(cookieParser())
  app.use(jwt)

  const apollo = new ApolloServer({
    schema,
    context: ({ req, res }: any) => ({ req, res, user: req.user }),
    debug: false,
  })
  apollo.applyMiddleware({ app, cors: false })

  const server = createServer(app)

  const port = process.env.PORT || 4000

  server.listen(port, () => {
    new SubscriptionServer({
      execute,
      subscribe,
      schema,
      onConnect: (params, ws) => {
        const cookies = cookie.parse(ws.upgradeReq.headers.cookie)
        try {
          return { user: verifyJWT(cookies.jwt) }
        } catch {
          return {}
        }
      }
    }, {
      server, path: '/graphql'
    })

    console.log(`🚀  Server started @ localhost:${port}`)
  })
}

start()

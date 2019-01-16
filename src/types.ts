import { Request, Response } from 'express'
import { User } from './modules/user/User'

export interface Context {
  req: Request;
  res: Response;
  user?: User;
}

import { GraphQLScalarType, Kind } from 'graphql'

function parseLiteral(ast, variables) {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT: {
      return ast.fields.reduce((value, field) => {
        value[field.name.value] = parseLiteral(field.value, variables);
        return value
      }, {})
    }
    case Kind.LIST:
      return ast.values.map(n => parseLiteral(n, variables))
    case Kind.NULL:
      return null
    case Kind.VARIABLE: {
      const name = ast.name.value
      return variables ? variables[name] : undefined
    }
    default:
      return undefined
  }
}

export const JSONObject = new GraphQLScalarType({
  name: 'JSONObject',
  description: 'Generic JSON object',
  parseValue(value: string) {
    try {
      return JSON.parse(value)
    } catch {
      return {}
    }
  },
  serialize(value: any) {
    return value
  },
  parseLiteral,
})

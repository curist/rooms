import { GraphQLScalarType, Kind } from 'graphql'

// TODO
// we can import real room modules here

export const roomModules = {
  chat: {
    // XXX things
  },
  avalon: {
    // XXX things
  },
}

export type RoomModuleType = keyof typeof roomModules

export const RoomModuleTypeScalar = new GraphQLScalarType({
  name: 'RoomModuleType',
  description: 'Room module scalar type',
  parseValue(value: string) {
    return value as RoomModuleType
  },
  serialize(value: RoomModuleType) {
    return value as string
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return ast.value as RoomModuleType
    }
    return ''
  },
})

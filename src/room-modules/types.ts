import { roomModules } from './modules'
import { GraphQLScalarType, Kind } from 'graphql'

// TODO
// we can import real room modules here

export interface RoomFluxModule {
  defaultState: object;
  reducer: (state: object, action: object) => object;
  validate?: (state: object, action: object) => boolean;
}

export interface RoomModules {
  [key: string]: RoomFluxModule;
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

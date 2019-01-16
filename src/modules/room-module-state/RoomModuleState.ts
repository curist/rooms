import { Entity, PrimaryGeneratedColumn, Column, ValueTransformer, ManyToOne, Unique } from 'typeorm'
import { ObjectType, Field } from 'type-graphql'

import { Room } from '../room/Room'
import { RoomModuleType, RoomModuleTypeScalar } from '../../room-modules/types'

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

@ObjectType({ description: 'RoomModuleState Type' })
@Entity()
@Unique(['room', 'moduleType'])
export class RoomModuleState {
  @Field()
  @PrimaryGeneratedColumn()
  id: number

  @Field(type => Room)
  @ManyToOne(type => Room, { eager: true })
  room: Room

  @Field(types => RoomModuleTypeScalar)
  @Column({ type: String })
  moduleType: RoomModuleType

  @Field(types => JSONObject)
  @Column('simple-json')
  state: Object
}


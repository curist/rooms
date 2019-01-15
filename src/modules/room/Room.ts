import { Entity, PrimaryGeneratedColumn, Column, ValueTransformer, ManyToOne } from 'typeorm'
import { ObjectType, Field } from 'type-graphql'

import { User } from '../user/User'
import { RoomModuleType, RoomModuleTypeScalar } from './room-modules'

class RoomModuleTransformer implements ValueTransformer {
  to (value: RoomModuleType[]): string {
    if(!value) {
      return ''
    }
    return value.join(', ')
  }
  from (value: string): RoomModuleType[] {
    if(!value) {
      return []
    }
    return value.split(', ') as Array<RoomModuleType>
  }
}

@ObjectType({ description: 'Room Type' })
@Entity()
export class Room {

  @Field()
  @PrimaryGeneratedColumn()
  id: number

  @Field()
  @Column()
  name: string

  @Field(type => User)
  @ManyToOne(type => User, { eager: true })
  owner: User

  @Field(types => [RoomModuleTypeScalar])
  @Column({ type: String, transformer: new RoomModuleTransformer() })
  roomModules: RoomModuleType[]
  // TODO
  // room may have
  // state
  // modules that alter state
  // we can have a roomType set that can group some modules
  //
  // one way to model is to have
  // ModuleState table
  // which uses roomId and moduleId as composite key
}


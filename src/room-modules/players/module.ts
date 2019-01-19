import { RoomModuleReducer as Reducer } from 'room-module-types'
import { RoomReducerModule, RoomEventType } from 'room-module-types'
import { PlayerRoomModuleActionType } from './types'

// TODO we may extend this functionality of this to support things like 
// roles, tags, etc.

type UserId = number
type PlayerIndex = number

interface Action {
  type: PlayerRoomModuleActionType;
  [k: string]: any;
}

export interface State {
  players: UserId[];
  playerIdMapping: {
    [userId: number]: PlayerIndex;
  };
}

const { Join, Leave } = PlayerRoomModuleActionType

const defaultState: State = {
  players: [],
  playerIdMapping: {},
}

const reducer: Reducer<State, Action> = (state, action, { userId }) => {
  const { players, playerIdMapping } = state
  switch(action.type) {
    case Join: {
      if(userId in playerIdMapping) {
        return state
      }
      const playerIndex = players.length
      return {
        players: players.concat(userId),
        playerIdMapping: {
          ...playerIdMapping,
          [userId]: playerIndex,
        },
      }
    }
    case Leave: {
      if(!(userId in playerIdMapping)) {
        return state
      }
      const index = playerIdMapping[userId]
      let newPlayers = players.slice(0)
      newPlayers.splice(index, 1)
      const newPlayerIdMapping = newPlayers.reduce((acc, id, i) => {
        acc[id] = i
        return acc
      }, {})
      return {
        players: newPlayers,
        playerIdMapping: newPlayerIdMapping,
      }
    }
  }
  return state
}

const handleUserJoinRoom = (state: State, context) => {
  const action = { type: Join }
  return reducer(state, action, context)
}

const handleUserLeaveRoom = (state: State, context) => {
  const action = { type: Leave }
  return reducer(state, action, context)
}

const roomModule: RoomReducerModule = {
  defaultState,
  reducer,
  hooks: {
    [RoomEventType.UserJoinRoom]: handleUserJoinRoom,
    [RoomEventType.UserLeaveRoom]: handleUserLeaveRoom,
  },
}
export default roomModule

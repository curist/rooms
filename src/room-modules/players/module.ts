import { RoomReducerModule, RoomModuleContext } from '../types'
import { PlayerRoomModuleActionType } from './types'

// TODO we may extend this functionality of this to support things like 
// roles, tags, etc.

type UserId = number
type PlayerIndex = number

interface Action {
  type: PlayerRoomModuleActionType;
  [k: string]: any;
}

interface State {
  players: UserId[];
  playerIdMapping: {
    [userId: number]: PlayerIndex;
  };
}

interface PlayersModule {
  defaultState: State;
  reducer: (state: State, action: Action, ctx: RoomModuleContext) => State;
}

const { Join, Leave } = PlayerRoomModuleActionType

const roomModule: PlayersModule = {
  defaultState: {
    players: [],
    playerIdMapping: {},
  },
  reducer: (state, action, { userId }) => {
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
        console.log(Leave)
        console.log(state)
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
        console.log(newPlayers, newPlayerIdMapping)
        return {
          players: newPlayers,
          playerIdMapping: newPlayerIdMapping,
        }
      }
    }
    return state
  }
}

export default roomModule as RoomReducerModule

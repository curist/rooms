import { Reducer } from 'src/types'
import { RoomReducerModule, RoomModuleType } from '../types'

const dependencies = [ RoomModuleType.Players ]

interface Message {
  userId: number;
  content: string;
  timestamp: number;
}

interface State {
  history: Message[];
}

type Action = any

const defaultState: State = { history: [] }

const reducer: Reducer<State, Action> = (state, action, { userId }) => {
  switch(action.type) {
    case 'appendMessage': {
      return {
        history: state.history.concat({
          userId,
          content: action.message,
          timestamp: + new Date(),
        }),
      }
    }
  }
  return state
}


const roomModule: RoomReducerModule = {
  defaultState,
  dependencies,
  reducer,
}
export default roomModule

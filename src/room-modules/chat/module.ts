import { RoomReducerModule, RoomModuleContext, RoomModuleType } from '../types'

const dependencies = [ RoomModuleType.Players ]

interface Message {
  userId: number;
  content: string;
  timestamp: number;
}

interface State {
  history: Message[];
}

interface Reducer {
  (state: State, action, ctx: RoomModuleContext): State;
}

const defaultState: State = { history: [] }

const reducer: Reducer = (state, action, { userId }) => {
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

import { RoomReducerModule, RoomModuleContext, RoomModuleType } from '../types'

interface Message {
  userId: number;
  content: string;
  timestamp: number;
}

interface State {
  history: Message[];
}

interface ChatRoomModule {
  defaultState: State;
  dependencies: RoomModuleType[];
  reducer: (state: State, action, ctx: RoomModuleContext) => State;
}

const roomModule: ChatRoomModule = {
  defaultState: {
    history: [],
  },
  dependencies: [ RoomModuleType.Players ],
  reducer: (state, action, { userId }) => {
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
}

export default roomModule as RoomReducerModule

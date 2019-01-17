import { RoomReducerModule, RoomModuleContext } from '../types'

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
  reducer: (state: State, action, ctx: RoomModuleContext) => State;
}

const roomModule: ChatRoomModule = {
  defaultState: {
    history: [],
  },
  reducer: (state, action, ctx) => {
    const { userId, context } = ctx
    console.log(context)
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

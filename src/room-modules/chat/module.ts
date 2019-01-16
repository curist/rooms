import { RoomFluxModule } from '../types'

interface State {
  history: string[];
}

interface ChatRoomModule {
  defaultState: State;
  reducer: (state: State, action) => State;
}

const roomModule: ChatRoomModule = {
  defaultState: {
    history: [],
  },
  reducer: (state, action) => {
    switch(action.type) {
      case 'appendMessage': {
        return {
          history: state.history.concat(action.message),
        }
      }
    }
    return state
  }
}

export default roomModule as RoomFluxModule

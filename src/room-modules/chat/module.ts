import { RoomFluxModule } from '../../modules/room/room-modules'
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
    return state
  }
}

export default roomModule as RoomFluxModule

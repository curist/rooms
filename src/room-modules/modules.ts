import { RoomModules } from './types'

import playersModule from './players/module'
import chatModule from './chat/module'

export const roomModules: RoomModules = {
  players: playersModule,
  chat: chatModule,
  avalon: {
    defaultState: {},
    reducer: () => ({}),
  },
}


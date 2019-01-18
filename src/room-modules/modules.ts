import { RoomModules } from './types'

import playersModule from './players/module'
import chatModule from './chat/module'
import splendorModule from './splendor/module'

export const roomModules: RoomModules = {
  players: playersModule,
  chat: chatModule,
  splendor: splendorModule,
  avalon: {
    defaultState: {},
    reducer: () => ({}),
  },
}


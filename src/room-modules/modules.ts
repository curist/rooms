import { RoomModules } from 'room-module-types'

import playersModule from './players/module'
import chatModule from './chat/module'
import splendorModule from 'splendor-room-module'

export const roomModules: RoomModules = {
  players: playersModule,
  chat: chatModule,
  splendor: splendorModule,
  avalon: {
    defaultState: {},
    reducer: () => ({}),
  },
}


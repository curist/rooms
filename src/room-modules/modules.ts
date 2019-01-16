import { RoomModules } from './types'

import chatModule from './chat/module'

export const roomModules: RoomModules = {
  chat: chatModule,
  avalon: {
    defaultState: {},
    reducer: () => ({}),
  },
}


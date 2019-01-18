import Boabab from 'baobab'
import B from './broker'
import './actions/index'
console.log(B.getActionNames())
import { Reducer } from 'src/types'
import { RoomReducerModule, RoomModuleType } from '../types'

const dependencies = [ RoomModuleType.Players ]

type State = any

interface Action {
  type: string;
  [k: string]: any;
}

const defaultState: State = {}

const reducer: Reducer<State, Action> = (state, action, { userId }) => {
  const db = new Boabab(state, { immutable: false })
  B.transit(db, action.type, action)
  db.set('game-states', [])
  return db.get()
}

const transformState = (state: State, { userId }) => {
  state.game.deck1 = state.game.deck1.length
  state.game.deck2 = state.game.deck2.length
  state.game.deck3 = state.game.deck3.length
  delete state.game['game-states']
  return state
}

const roomModule: RoomReducerModule = {
  defaultState,
  dependencies,
  reducer,
  transformState,
}
export default roomModule

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
  const db = new Boabab(state)
  B.transit(db, action.type, action)
  return db.get()
}


const roomModule: RoomReducerModule = {
  defaultState,
  dependencies,
  reducer,
}
export default roomModule

function combineActionHandlers() {
  const actionHandlers = {}

  // register action handler
  function on(eventName, handler) {
    actionHandlers[eventName] = handler
  }

  function transit(db, eventName: string, action?: object);
  function transit(db, eventName, action = {}) {
    const handler = actionHandlers[eventName]
    if(!handler) {
      console.warn(`Unsupported event name: ${eventName}`)
      return
    }
    actionHandlers[eventName](db, action)
  }

  function exec(db, action) {
    const { action: eventName } = action
    transit(db, eventName, action)
  }

  function getActionNames() {
    return Object.keys(actionHandlers)
  }

  return { on, transit, exec, getActionNames }
}

const B = combineActionHandlers()

export default B

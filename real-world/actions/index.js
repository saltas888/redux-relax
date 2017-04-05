export const UPDATE_ROUTER_STATE = 'UPDATE_ROUTER_STATE'
export const NAVIGATE =  'NAVIGATE'
export const RESET_ERROR_MESSAGE = 'RESET_ERROR_MESSAGE'


function action(type, payload = {}) {
  return {type, ...payload}
}


export const updateRouterState = state => action(UPDATE_ROUTER_STATE, {state})
export const navigate = pathname => action(NAVIGATE, {pathname})

export const resetErrorMessage = () => action(RESET_ERROR_MESSAGE)

import * as ActionTypes from '../actions'
import { combineReducers } from 'redux'


// Updates error message to notify about the failed fetches.
function errorMessage(state = null, action) {
  const { type, error } = action

  if (type === ActionTypes.RESET_ERROR_MESSAGE) {
    return null
  } else if (error) {
    return action.error
  }

  return state
}

function router(state = { pathname: '/' }, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_ROUTER_STATE:
      return action.state
    default:
      return state
  }
}

const rootReducer = combineReducers({
  errorMessage,
  router
})

export default rootReducer

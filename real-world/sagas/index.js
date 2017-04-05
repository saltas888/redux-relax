/* eslint-disable no-constant-condition */
import { take, put, call, fork, select } from 'redux-saga/effects'
import { api, history } from '../services'
import * as actions from '../actions'


/******************************************************************************/
/******************************* WATCHERS *************************************/
/******************************************************************************/

// trigger router navigation via history
function* watchNavigate() {
  while(true) {
    const {pathname} = yield take(actions.NAVIGATE)
    yield history.push(pathname)
  }
}

export default function* root() {
  yield [
    fork(watchNavigate),
  ]
}

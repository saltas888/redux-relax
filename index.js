import { combineReducers, compose, applyMiddleware, createStore } from 'redux'
import createSagaMiddleware, { END } from 'redux-saga'
import Data from './data'
import createReducers from './reducers'
import merge from 'lodash/merge'
import * as ReduxRelaxCore from './core'
import { fork } from 'redux-saga/effects'


export default function initialize(configs){
  configs && Data.reinitialize(configs)
  console.log(configs)
  // Data.configs.entities.forEach(entity=>{

  // })
}

function initializeReducers(rootReducer) {
  return combineReducers({...createReducers(Data.configs.entities), ...rootReducer})
}

export function myCreateStore(rootReducer,initialState, middlewares = [], tools = []){

  // const store = createStore(initializeReducers(rootReducer),...args)
  const sagaMiddleware = createSagaMiddleware()
  console.log(middlewares, tools)
  const store = createStore(
    initializeReducers(rootReducer),
    initialState,
    compose(
      applyMiddleware(
        sagaMiddleware,
        ...middlewares
      ),
      ...tools
    )
  )
  store.runSaga = sagaMiddleware.run
  store.close = () => store.dispatch(END)
  store.runSaga(rootSaga)
  return store
}

const rootSaga = function*() {
  yield ReduxRelaxCore.getWatchers().map(watcher=>fork(watcher))
}
import { combineReducers, compose, applyMiddleware, createStore } from 'redux'
import createSagaMiddleware, { END } from 'redux-saga'
import Data from './data'
import createReducers from './reducers'
import omit from 'lodash/omit'
import * as ReduxRelaxCore from './core'
import { fork } from 'redux-saga/effects'
import createLogger from 'redux-logger'

export default (configs, devTools) => {
  configs && Data.reinitialize(configs)
  return (next) => 
    (reducer, initialState) => {
      const sagaMiddleware = createSagaMiddleware()
      const middlewares = configs.dev ? [sagaMiddleware, createLogger()] : [sagaMiddleware]
      const enhancer = configs.dev ? compose(applyMiddleware(...middlewares), devTools) : applyMiddleware(...middlewares)
      const store = next(initializeReducers(reducer), initialState, compose(applyMiddleware(...middlewares), devTools));

      store.runSaga = sagaMiddleware.run
      store.close = () => store.dispatch(END)
      store.runSaga(rootSaga)

      return store;
   };
}



const rootSaga = function*() {
  yield ReduxRelaxCore.getWatchers().map(watcher=>fork(watcher))
}

function initializeReducers(reducer) {
  // Call the reducer with empty action to populate the initial state
  const relaxReducers = createReducers(Data.configs.entities)
  
  const initialState = {
    entities: relaxReducers.entities(undefined, {}),
    pagination: relaxReducers.pagination(undefined, {}),
    ...reducer(undefined, {}),
  }
  // Return a reducer that handles undo and redo
  return function (state = initialState, action) {
        // Delegate handling the action to the passed reducer
        const otherState = reducer(omit(state,['entities', 'pagination']), action)
        const entitiesState = relaxReducers.entities(state.entities, action)
        const paginationState = relaxReducers.pagination(state.pagination, action)
        return {
          ...otherState,
          entities:entitiesState,
          pagination: paginationState
        }
  }
}
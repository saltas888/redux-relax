import { combineReducers, compose, applyMiddleware, createStore } from 'redux'
import {createLogger} from 'redux-logger'
import thunk from 'redux-thunk';

import omit from 'lodash/omit'

import Data from '../shared/data'
import createReducers from '../shared/reducers'
import * as ReduxRelaxCore from './core.thunk'
import * as utils from '../shared/utils'


export const Core = ReduxRelaxCore;
export const Utils = utils;

export default (configs, devTools, propsMiddlewares = []) => {
  configs && Data.reinitialize(configs)
  return (next) => 
    (reducer, initialState) => {
      const middlewares = configs.dev ? [thunk, ...propsMiddlewares, createLogger()] : [thunk, ...propsMiddlewares]
      const enhancer = configs.dev ? compose(applyMiddleware(...middlewares), devTools) : applyMiddleware(...middlewares)
      const store = next(initializeReducers(reducer), initialState, compose(applyMiddleware(...middlewares), devTools));
      return store;
   };
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
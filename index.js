import { combineReducers } from 'redux'
import Data from './data'
import createReducers from './reducers'
import merge from 'lodash/merge'
import { createStore, applyMiddleware, compose } from 'redux'

export default function initialize(configs){
  configs && Data.reinitialize(configs)
  console.log(configs)
  // Data.configs.entities.forEach(entity=>{

  // })
}

function initializeReducers(rootReducer) {
  return combineReducers({...createReducers(Data.configs.entities), ...rootReducer})
}

export function myCreateStore(rootReducer, ...args){
  return createStore(initializeReducers(rootReducer),...args)
}
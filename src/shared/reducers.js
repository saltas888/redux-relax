import updeep from 'updeep'
import isFunction from 'lodash/isFunction'
import { combineReducers } from 'redux'
import paginate from './paginate'
import { getActionTypes } from './utils'
import Data from './data'

export default (entitiesData) =>{
  const entitiesState = entitiesData.reduce((prev,entity)=>{
    return {
      ...prev,
      [entity.name]:{}
    }
  },{})
  
  function entities(state = entitiesState, action) {
    if (action.response && action.response.entities) {
      return updeep(action.response.entities, state)
    }
    return state
  }

  const pagination = combineReducers({
    ...entitiesData.reduce((prev,entity)=>{
      const Action = getActionTypes()[entity.name.toUpperCase()]
      return {
        ...prev,
        [entity.name]: paginate({
          entity: entity.name,
          extraFields: entity.paginationExtraFields,
          itemsField: entity.itemsField,
          mapActionToKey: action => entity.paginationKey ? action[entity.paginationKey] : 'default',
          types: {
            requestTypes: [Action.REQUEST],
            successTypes: [Action.SUCCESS],
            failureTypes: [Action.FAILURE],
            resetTypes  : [Action.RESET]
          }
        })    
      }
    },{})
  })
  return {pagination, entities}
}


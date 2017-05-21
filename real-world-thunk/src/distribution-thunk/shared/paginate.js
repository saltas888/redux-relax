import union from 'lodash/union'
import isEmpty from 'lodash/isEmpty'
import includes from 'lodash/includes'
import updeep from 'updeep';
import Data from './data'

const {totalCountField, totalPageCountField, currentPageField, itemsField} = Data.configs.reducers.paginate

// Creates a reducer managing pagination, given the action types to handle,
// and a function telling how to extract the key from an action.
export default function paginate({ types, mapActionToKey, entity, extraFields, itemsField }) {
  if (typeof mapActionToKey !== 'function') {
    throw new Error('Expected mapActionToKey to be a function.')
  }

  const { requestTypes, successTypes, failureTypes, resetTypes } = types

  const initialPaginateState = {
    isFetching: false,
    totalPages: null,
    pageCount: 0,
    nextPageUrl: null,
    totalCount: 0,
    ids: []
  }

  function updatePagination(key, state = initialPaginateState, action) {
    if(includes(requestTypes, action.type)) {
      return updeep({
        isFetching: true
      },state)
    }
    else if(includes(failureTypes, action.type)){
      return updeep({
        isFetching: false
      },state) 
    }
    else if(includes(successTypes, action.type)) {
      const entityData = Data.configs.entities.find(e=>e.name === entity)
      
      const pageCount = currentPageField ? action.response.result[currentPageField] : state.pageCount + 1

      let newData = {
        isFetching: false,
        ids: union(state.ids, itemsField ? action.response.result[itemsField] : action.response.result),
        totalPages: action.response.result[totalPageCountField],
        totalCount: action.response.result[totalCountField],
        pageCount: pageCount,
        nextPageUrl: `${Data.configs.apiEndpoint}${entityData.apiUrl(key)}?page=${pageCount + 1}` 
      }
      if(!isEmpty(extraFields)){
        extraFields.forEach(f=>{
          newData[f] = action.response.result[f]
        })
      }
      return updeep(newData,state)
    }
    else{
      return state
    }
  }

  return function updatePaginationByKey(state = {}, action) {
    const key = mapActionToKey(action)
    if(includes([...requestTypes, ...failureTypes, ...successTypes], action.type)) {
      if (typeof key !== 'string') {
        throw new Error('Expected key to be a string.')
      }
      return updeep({
        [key]: updatePagination(key, state[key], action)
      }, state)
    }
    else if(includes(resetTypes, action.type)){
      return updeep({
        [key]:updeep.constant(initialPaginateState)
      }, state)
    }
    else{
        return state
    }
  }
}

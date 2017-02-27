import union from 'lodash/union'
import isEmpty from 'lodash/isEmpty'
import includes from 'lodash/includes'
import updeep from 'updeep';
import Data from './data'

const {totalCountField, totalPageCountField, currentPageField} = Data.configs.reducers.paginate

// Creates a reducer managing pagination, given the action types to handle,
// and a function telling how to extract the key from an action.
export default function paginate({ types, mapActionToKey, entity, extraFields }) {
  if (typeof mapActionToKey !== 'function') {
    throw new Error('Expected mapActionToKey to be a function.')
  }

  const { requestTypes, successTypes, failureTypes, resetTypes } = types

  let endpoint = entity;

  const initialPaginateState = {
    isFetching: false,
    totalPages: null,
    pageCount: 0,
    nextPageUrl: null,
    totalCount: 0,
    ids: []
  }

  function updatePagination(key, state = initialPaginateState, action) {
    if(includes([...requestTypes, ...failureTypes], action.type)) {
      return updeep({
        isFetching: true
      },state)
    }
    else if(includes(successTypes, action.type)) {
      
      const nextPage = currentPageField ? action.response.result[currentPageField] : state.pageCount + 1 

      let newData = {
        isFetching: false,
        ids: union(state.ids, action.response.result[entity]),
        totalPages: action.response.result[totalPageCountField],
        totalCount: action.response.result[totalCountField],
        pageCount: nextPage,
        nextPageUrl: `${Data.configs.apiEndpoint}?page=${nextPage}` 
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

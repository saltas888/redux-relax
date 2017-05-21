import get from 'lodash/get'

import Data from '../shared/data'
import * as Utils from '../shared/utils'

const inflect = require('i')();


function apiCallForEntity(entity, apiFn, url, data) {
  return (dispatch, getState) => {
    dispatch(entity.request(data))
    apiFn(url, data).then(({response, error}) => {
      if(response){
        dispatch(entity.success(response, data))
        return response
      } else {
        return dispatch(entity.failure(error, data))
      }
    })
  }
    
}
export const getApiFetchActions = (state)=>Data.configs.entities.reduce((prev,curr) => {
  let arraySchema = Utils.getSchemas()[curr.name]
  if(curr.itemsField){
    arraySchema = {
      [curr.itemsField]: arraySchema
    }
  }

  const getFullUrl = url => (url.indexOf('http') !== -1 ? 
                                  url : 
                                  Data.configs.apiEndpoint+url
                            )
  return {
    [curr.name]: queryUrl => Utils.callApi(
                              getFullUrl(curr.apiUrl(queryUrl)),
                              'GET', 
                              {schema:arraySchema, state } 
                            ),

    [inflect.singularize(curr.name)]: id => Utils.callApi(
                                              getFullUrl(curr.singleApiUrl(id)),
                                              'GET', 
                                              {schema:Utils.getSchemas()[inflect.singularize(curr.name)], state } 
                                            ),
    ...prev
  }
},{})

export const getFetchActions = (state)=>Data.configs.entities.reduce((prev, curr) => {
  return {
    ...prev,
    [curr.name]: apiCallForEntity.bind(null, Utils.getActions()[curr.name], getApiFetchActions(state)[curr.name]),
    [inflect.singularize(curr.name)]: apiCallForEntity.bind(null, Utils.getActions()[inflect.singularize(curr.name)], getApiFetchActions(state)[inflect.singularize(curr.name)])
  }
},{})

export const getLoadEntityFunctions = ()=> Data.configs.entities.reduce((prev, curr) => {
  const entityFunctionOffest = Utils.capitalize(curr.name)
  
  const loadEntityBaseFunc = function(query, loadMore){
    return (dispatch, getState) =>{
      const state = getState()

      const entityPaginationData = get(state,`pagination.${curr.name}.${query || 'default'}`)


      const hasToLoadMore =  entityPaginationData && 
                            (entityPaginationData.pageCount < entityPaginationData.totalPages)

      if (!entityPaginationData  || (loadMore && hasToLoadMore) ){
        if(!entityPaginationData){
          return dispatch(getFetchActions(state)[curr.name](query, query))
        }
        else {
          const pageCount = entityPaginationData.pageCount
          return dispatch(getFetchActions(state)[curr.name](`${query}&page=${pageCount + 1}`, query))
        }
      }
    }
  }
  function loadSingleEntityBaseFunc(uniqueIdAttribute = 'id') {
    return (dispatch, getState) =>{
      const state = getState()
      const entity = get(state,`entities.${curr.name}.${uniqueIdAttribute}`)

      if (!entity ) 
        return dispatch(getFetchActions(state)[inflect.singularize(curr.name)](uniqueIdAttribute, uniqueIdAttribute))
    }
  }

  return {
    ...prev,
    [curr.name]:{
      [`load${entityFunctionOffest}`]: loadEntityBaseFunc,
      [`load${inflect.singularize(entityFunctionOffest)}`]: loadSingleEntityBaseFunc,
    }
  }
},{})

export const getLoadEntitysAction = (entityName, single) => {
  const entity = single ? inflect.singularize(entityName) : entityName 
  const entityFunctionOffest = Utils.capitalize(entity)

  return getLoadEntityFunctions()[entityName][`load${entityFunctionOffest}`]
}


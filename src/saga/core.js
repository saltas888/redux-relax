import { schema as Schema } from 'normalizr'
import { takeEvery, takeLatest } from 'redux-saga'
import { take, put, call, fork, select } from 'redux-saga/effects'

import get from 'lodash/get'

import Data from '../shared/data'
import * as Utils from '../shared/utils'

const inflect = require('i')();

function* apiCallForEntity(entity, apiFn, url, data) {
  yield put( entity.request(data) )
  const {response, error} = yield call(apiFn, url, data)
  if(response){
    yield put( entity.success(response, data))
    return response
  }
  else
    yield put( entity.failure(error, data))
}

//TODO:: GET THE URL PARAMS IN ORDER TO HAVE DIFFERENT PAGINATION
export const getApiFetchActions = (state)=>Data.configs.entities.reduce((prev,curr) => {
  let arraySchema = Utils.getSchemas()[curr.name]
  if(curr.itemsField){
    arraySchema = {
      [curr.itemsField]: arraySchema
    }
  }
  return {
    [curr.name]: queryUrl => Utils.callApi(Data.configs.apiEndpoint+curr.apiUrl(queryUrl), 'GET', {schema:arraySchema, state } ),
    [inflect.singularize(curr.name)]: id => Utils.callApi(Data.configs.apiEndpoint+curr.singleApiUrl(id), 'GET', {schema:Utils.getSchemas()[inflect.singularize(curr.name)], state } ),
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
  
  const loadEntityBaseFunc = function*(query, loadMore){
    const state = yield select(state=>state)

    const entityPaginationData = yield select(state=>get(state,`pagination.${curr.name}.${query || 'default'}`))


    const hasToLoadMore =  entityPaginationData && 
                          (entityPaginationData.pageCount < entityPaginationData.totalPages)

    if (!entityPaginationData  || (loadMore && hasToLoadMore) ){
      if(!entityPaginationData){
        yield call(getFetchActions(state)[curr.name], query, query)  
      }
      else {
        const pageCount = entityPaginationData.pageCount
        yield call(getFetchActions(state)[curr.name], `${query}&page=${pageCount + 1}`, query)
      }
    }
  }
  function* loadSingleEntityBaseFunc(uniqueIdAttribute = 'id') {
    const state = yield select(state=>state)
    const entity = yield select(state=>get(state,`entities.${curr.name}.${uniqueIdAttribute}`))

    if (!entity ) yield call(getFetchActions(state)[inflect.singularize(curr.name)], uniqueIdAttribute, uniqueIdAttribute)
  }

  return {
    ...prev,
    [curr.name]:{
      [`watchLoad${entityFunctionOffest}`]:function*() {
        while(true) {
          const data =  yield take(`LOAD_${curr.name.toUpperCase()}`)
          yield fork(loadEntityBaseFunc, data[curr.paginationKey || 'query']);
        }
      },
      [`watchLoadMore${entityFunctionOffest}`]:function*() {
        while(true) {
          const data =  yield take(`LOAD_MORE_${curr.name.toUpperCase()}`)
          yield fork(loadEntityBaseFunc, data[curr.paginationKey || 'query'], true);
        }
      },
      [`load${entityFunctionOffest}`]: loadEntityBaseFunc,
      [`watchLoad${inflect.singularize(entityFunctionOffest)}`]: function*() {
        while(true) {
          const data =  yield take(`LOAD_${inflect.singularize(curr.name).toUpperCase()}`)
          yield fork(loadSingleEntityBaseFunc, data[curr.uniqueIdAttribute]);
        }
      },
      [`load${inflect.singularize(entityFunctionOffest)}`]: loadSingleEntityBaseFunc,
    }
  }
},{})

export const getWatchers = () => {
  return Data.configs.entities.reduce((prev,curr, index)=>{
    
    const entityFunctionOffest = Utils.capitalize(curr.name)
    const singeWatcher = []
    curr.singleApiUrl && singeWatcher.push(getLoadEntityFunctions()[curr.name][`watchLoad${inflect.singularize(entityFunctionOffest)}`])
      return [
        getLoadEntityFunctions()[curr.name][`watchLoad${entityFunctionOffest}`],
        getLoadEntityFunctions()[curr.name][`watchLoadMore${entityFunctionOffest}`],
        ...prev,
        ...singeWatcher,
    ]
  },[])
}


export const getLoadEntitysAction = entityName => {
  const entityFunctionOffest = Utils.capitalize(entityName)
  return getLoadEntityFunctions()[entityName][`load${entityFunctionOffest}`]
}


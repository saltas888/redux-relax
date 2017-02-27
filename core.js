import Data from './data'
import * as Utils from './utils'
import store from '../store'
import { Schema, arrayOf } from 'normalizr'
import get from 'lodash/get'
import { takeEvery, takeLatest } from 'redux-saga'
import {reset} from 'redux-form';
import { take, put, call, fork, select } from 'redux-saga/effects'
const inflect = require('i')();

// Fetches an API response and normalizes the result JSON according to schema.
// This makes every API response have the same shape, regardless of how nested it was.

//TODO GET HEADERS OR THE STATE

function getHeaders(contentType) {
  // const state = store.getState();
  return {
    'X-Spree-Token': '51f506a65fe2ceb2e99017968ab2d0b7991fe2e5e903e6fd',
    'Content-Type': 'application/json',
  };
}


function callApi(endpoint, requestType, { schema } ) {
  return fetch(endpoint,{
      method: requestType,
      headers: getHeaders('application/json')
    })
    .then(response =>
      response.json().then(json => ({ json, response }))
    ).then(({ json, response }) => {
      if (!response.ok) {
        return Promise.reject(json)
      }
      if(schema){
        return Utils.normalizeObject(json, schema);
      }
      return json
    })
    .then(
      response => ({response}),
      error => ({error: error.errors || error.message || error.error || error.exception || 'Something went wrong'})
    )
}


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


export const getActionTypes = ()=> Data.configs.entities.reduce((prev,curr, index)=>{
  return {
    ...prev,
    [curr.name.toUpperCase()]: Utils.createRequestTypes(curr.name.toUpperCase()),
    [inflect.singularize(curr.name).toUpperCase()]: Utils.createRequestTypes(inflect.singularize(curr.name).toUpperCase())
  }
},{})

//export const PRODUCTS = createRequestTypes('PRODUCTS')


export const getActions = ()=> Data.configs.entities.reduce((prev,curr, index)=>{
  const entityName = curr.name.toUpperCase()
  return {
    ...prev,
    [curr.name]: {
      request: query => Utils.action(getActionTypes()[entityName].REQUEST, {[curr.paginationKey || 'query']:query}),
      success:  (response, query) => Utils.action(getActionTypes()[entityName].SUCCESS, {response, [curr.paginationKey || 'query']:query}),
      failure:  (error, query) => Utils.action(getActionTypes()[entityName].FAILURE,  {error, [curr.paginationKey || 'query']:query}),
    },
    [inflect.singularize(curr.name)]:{
      request: id => Utils.action(getActionTypes()[inflect.singularize(curr.name).toUpperCase()].REQUEST, {[curr.uniqueIdAttribute || 'id']:id}),
      success:  (response, id) => Utils.action(getActionTypes()[inflect.singularize(curr.name).toUpperCase()].SUCCESS, {response, [curr.uniqueIdAttribute || 'id']:id}),
      failure:  (error, id) => Utils.action(getActionTypes()[inflect.singularize(curr.name).toUpperCase()].FAILURE,  {error, [curr.uniqueIdAttribute || 'id']:id}),
    }
  }
},{})



// export const products = {
//   request: query => action(PRODUCTS.REQUEST, {query}),
//   success:  (response, query) => action(PRODUCTS.SUCCESS, {response, query}),
//   failure:  (error, query) => action(PRODUCTS.FAILURE,  {error, query}),
// }



const getSchemas = ()=>Data.configs.entities.reduce((prev,curr, index)=>{
  const entitySchema = new Schema(curr.name, {idAttribute: curr.uniqueIdAttribute})
  return {
    ...prev,
    [curr.name]: {[curr.name]: arrayOf(entitySchema)},
    [inflect.singularize(curr.name)]: entitySchema
  }
},{})

// export const productSchema = new Schema('products', {idAttribute: 'slug'})

// export const productSchemaArray = { products:arrayOf(new Schema('products', {idAttribute: 'slug'}))}

//TODO:: GET THE URL PARAMS IN ORDER TO HAVE DIFFERENT PAGINATION
export const getApiFetchActions = ()=>Data.configs.entities.reduce((prev,curr, index)=>{
  return {
    ...prev,
    [curr.name]: queryUrl => callApi(Data.configs.apiEndpoint+curr.apiUrl(queryUrl), 'GET', {schema:getSchemas()[curr.name] } ),
    [inflect.singularize(curr.name)]: id => callApi(Data.configs.apiEndpoint+curr.singleApiUrl(id), 'GET', {schema:getSchemas()[inflect.singularize(curr.name)] } )
  }
},{})

// export const apiFetchProducts = url => callApi(url, 'GET', {schema:schemas.productSchemaArray } )


export const getFetchActions = ()=>Data.configs.entities.reduce((prev,curr, index)=>{
  return {
    ...prev,
    [curr.name]: apiCallForEntity.bind(null, getActions()[curr.name], getApiFetchActions()[curr.name]),
    [inflect.singularize(curr.name)]: apiCallForEntity.bind(null, getActions()[inflect.singularize(curr.name)], getApiFetchActions()[inflect.singularize(curr.name)])
  }
},{})

//export const fetchProducts = apiCallForEntity.bind(null, products, api.fetchProducts)



//TODO: get query & loadMore
export const getLoadEntityFunctions = ()=> Data.configs.entities.reduce((prev,curr, index)=>{
  const entityFunctionOffest = Utils.capitalize(curr.name)
  
  const loadEntityBaseFunc = function*(query, loadMore){
    const entityPaginationData = yield select(state=>get(state,`pagination.${curr.name}.${query || 'default'}`))

    const hasToLoadMore =  entityPaginationData && 
                          (entityPaginationData.pageCount < entityPaginationData.totalPages)

    if (!entityPaginationData  || (loadMore && hasToLoadMore) ){
      if(!entityPaginationData){
        yield call(getFetchActions()[curr.name], query, query)  
      }
      else {
        const pageCount = entityPaginationData.pageCount
        yield call(getFetchActions()[curr.name], `${query}&page=${pageCount + 1}`, query)
      }
    }
  }
  function* loadSingleEntityBaseFunc(uniqueIdAttribute = 'id') {

    const entity = yield select(state=>get(state,`entities.${curr.name}.${uniqueIdAttribute}`))

    if (!entity ) yield call(getFetchActions()[inflect.singularize(curr.name)], uniqueIdAttribute, uniqueIdAttribute)
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
        ...prev,
        ...singeWatcher,
        getLoadEntityFunctions()[curr.name][`watchLoad${entityFunctionOffest}`],
        getLoadEntityFunctions()[curr.name][`watchLoadMore${entityFunctionOffest}`]
    ]
  },[])
}


export const getLoadEntitysAction = entityName => {
  const entityFunctionOffest = Utils.capitalize(entityName)
  return getLoadEntityFunctions()[entityName][`load${entityFunctionOffest}`]
}


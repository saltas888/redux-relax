import { camelizeKeys } from 'humps'
import { normalize, schema as Schema } from 'normalizr'
import yup from 'yup'
import Data from './data'
const inflect = require('i')();


const schema = yup.object().shape({
  apiEndpoint: yup.string().required(),
  reducers:    yup.object().shape({
    paginate:{
      totalPageCountField: yup.string().default('pages').required(),
      totalCountField: yup.string().default('totalCount').required(),
      currentPageField: yup.string().default(undefined) //optional
    },
  }),
  entities:yup.array().of(yup.object().shape(
    {
      uniqueIdAttribute: yup.string().required().default('id'), //required
      name: yup.string().lowercase(), //required
      paginationExtraFields: yup.array().of(yup.string()),
      paginationKey: yup.string().required().default('id')
    },
  ))
})

// export async function validateConfigs(configs){
//   const valid = await schema.isValid(configs)
//   return valid
// }


export function throwError(message){
  throw new Error('Redux-Relax:: ' + message)
}

export function normalizeObject(json, schema){
  const camelizedJson = camelizeKeys(json)
  return Object.assign({},
    normalize(camelizedJson, schema),
  )
}
export function capitalize(str){
  return str.substring(0, 1).toUpperCase() + str.substring(1)
}


const REQUEST = 'REQUEST'
const SUCCESS = 'SUCCESS'
const FAILURE = 'FAILURE'
const RESET   = 'RESET'

export function createRequestTypes(base) {
  const res = {};
  [REQUEST, SUCCESS, FAILURE, RESET].forEach(type => res[type] = `${base}_${type}`)
  return res;
}

export function action(type, payload = {}) {
  return {type, ...payload}
}

export function callApi(endpoint, requestType, { schema, state } ) {
  return fetch(endpoint,{
      method: requestType,
      headers: Data.configs.getHeaders(state)
    })
    .then(response =>
      response.json().then(json => ({ json, response }))
    ).then(({ json, response }) => {
      if (!response.ok) {
        return Promise.reject(json)
      }
      if(schema){
        return normalizeObject(json, schema);
      }
      return json
    })
    .then(
      response => ({response}),
      error => ({error: error.errors || error.message || error.error || error.exception || 'Something went wrong'})
    )
}

export const getActionTypes = () => Data.configs.entities.reduce((prev,curr, index) => {
  return {
    [curr.name.toUpperCase()]: createRequestTypes(curr.name.toUpperCase()),
    [inflect.singularize(curr.name).toUpperCase()]: createRequestTypes(inflect.singularize(curr.name).toUpperCase()),
    ...prev
  }
},{})

export const getActions = ()=> Data.configs.entities.reduce((prev, curr) => {
  const entityName = curr.name.toUpperCase()
  return {
    [curr.name]: {
      request: query => action(getActionTypes()[entityName].REQUEST, {[curr.paginationKey || 'query']:query}),
      success:  (response, query) => action(getActionTypes()[entityName].SUCCESS, {response, [curr.paginationKey || 'query']:query}),
      failure:  (error, query) => action(getActionTypes()[entityName].FAILURE,  {error, [curr.paginationKey || 'query']:query}),
    },
    [inflect.singularize(curr.name)]:{
      request: id => action(getActionTypes()[inflect.singularize(curr.name).toUpperCase()].REQUEST, {[curr.uniqueIdAttribute || 'id']:id}),
      success:  (response, id) => action(getActionTypes()[inflect.singularize(curr.name).toUpperCase()].SUCCESS, {response, [curr.uniqueIdAttribute || 'id']:id}),
      failure:  (error, id) => action(getActionTypes()[inflect.singularize(curr.name).toUpperCase()].FAILURE,  {error, [curr.uniqueIdAttribute || 'id']:id}),
    },
    ...prev
  }
},{})


export const getSchemas = () => Data.configs.entities.reduce((prev,curr) => {
  const entitySchema = new Schema.Entity(curr.name, {}, {idAttribute: curr.uniqueIdAttribute})
  return {
    ...prev,
    [curr.name]: new Schema.Array(entitySchema),
    [inflect.singularize(curr.name)]: entitySchema
  }
},{})

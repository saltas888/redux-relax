import { camelizeKeys } from 'humps'
import { normalize } from 'normalizr'

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

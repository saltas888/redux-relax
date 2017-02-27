import { camelizeKeys } from 'humps'
import { normalize } from 'normalizr'
import yup from 'yup'

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

export async function validateConfigs(configs){
  const valid = await schema.isValid(configs)
  return valid
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


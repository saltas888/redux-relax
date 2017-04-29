import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { createLogger } from 'redux-logger'
import api from '../middleware/api'
import rootReducer from '../reducers'
import DevTools from '../containers/DevTools'
import ReduxRelaxEnchancer from '../../../distribution-thunk/thunk/index.thunk'

const configs = {
  dev: true,
  apiEndpoint: 'https://api.github.com/',//required
  getHeaders: ()=>({}),
  reducers:{
    paginate:{
      totalPageCountField: 'pages', //required
      totalCountField: 'totalCount', //required
      currentPageField: undefined //optional
    },
  },
  entities:[
    {
      uniqueIdAttribute: 'login', //required
      name: 'users', //required
      singleApiUrl: login => `users/${login.toString()}`,
      apiUrl: login => `repos/${login}/stargazers`, //required,
      paginationExtraFields: undefined,
      paginationKey: 'login',
      manual: undefined
    },
    {
      uniqueIdAttribute: 'fullName', //required
      name: 'repos', //required
      singleApiUrl: fullName=> `repos/${fullName}`,
      apiUrl: login => `users/${login}/starred`, //required,
      paginationExtraFields: undefined,
      paginationKey: 'fullName',
      manual: undefined
    },
  ]
}


export default s => createStore(
  rootReducer,
  s || {},
  ReduxRelaxEnchancer(configs, DevTools.instrument(), [api]),
)
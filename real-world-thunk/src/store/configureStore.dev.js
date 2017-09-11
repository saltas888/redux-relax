import { createStore } from 'redux'
import api from '../middleware/api'
import rootReducer from '../reducers'
import DevTools from '../containers/DevTools'
import ReduxRelaxEnchancer from '../../../distribution-thunk/thunk/index'

const configs = {
  dev: true,
  apiEndpoint: 'https://api.github.com/',//required
  getHeaders: (state) => ({ }),
  reducers: {
    paginate: {
      totalPageCountField: 'pages', //required
      totalCountField: 'totalCount', //required
      currentPageField: undefined //optional
    },
  },
  entities:[
    {
      uniqueIdAttribute: 'login', // The field that is used as unique id - Required
      //itemsField: 'items', // the field on response payload that includes our data
      name: 'users', // Name of the entities field in state- Required
      singleApiUrl: login => `users/${login.toString()}` // The route to base endpoint to fetch a single entity - Required,
      apiUrl: login => `repos/${login}/stargazers`, // The route to base endpoint to fetch multiple entities - Required,
      paginationKey: 'login',
    }, {
      uniqueIdAttribute: 'fullName',
      // itemsField: 'items', // the field on response payload that includes our data
      name: 'repos',
      singleApiUrl: fullName => `repos/${fullName}`,
      apiUrl: login => `users/${login}/starred`,
      paginationKey: 'fullName',
    },
  ]
}


export default initialState => createStore(
  rootReducer,
  initialState || {},
  ReduxRelaxEnchancer(configs, [DevTools.instrument()], [api]),
)
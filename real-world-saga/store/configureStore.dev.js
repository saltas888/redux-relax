import { createStore } from 'redux'
import DevTools from '../containers/DevTools'
import rootReducer from '../reducers'
import ReduxRelaxEnchancer from '../../distribution-saga/saga/index'

const configs = {
  dev: true,
  apiEndpoint: 'https://api.github.com/',//required
  reducers: {
    paginate: {
      totalPageCountField: 'pages', //required
      totalCountField: 'totalCount', //required
      currentPageField: undefined //optional
    },
  },
  getHeaders: (state) => ({ }),
  entities:[
    {
      uniqueIdAttribute: 'login', //required
      name: 'users', //required
      singleApiUrl: login => `users/${login.toString()}`,
      apiUrl: login => `repos/${login}/stargazers`, //required,
      paginationExtraFields: undefined,
      paginationKey: 'login',
    }, {
      uniqueIdAttribute: 'fullName', //required
      name: 'repos', //required
      singleApiUrl: fullName=> `repos/${fullName}`,
      apiUrl: login => `users/${login}/starred`, //required,
      paginationExtraFields: undefined,
      paginationKey: 'fullName',
    },
  ]
}


const store = createStore(
  rootReducer,
  {},
  ReduxRelaxEnchancer(configs, [DevTools.instrument()]),
)

if (module.hot) {
  // Enable Webpack hot module replacement for reducers
  module.hot.accept('../reducers', () => {
    const nextRootReducer = require('../reducers').default
    store.replaceReducer(nextRootReducer)
  })
}

export default store

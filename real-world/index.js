import 'babel-polyfill'
// React imports
import React from 'react'
import { render } from 'react-dom'

// app specific imports
import { history } from './services'
import store from './store/configureStore'
import routes from './routes'
import Root from './containers/Root'
import rootSaga from './sagas'

store.runSaga(rootSaga)

render(
  <Root
    store={store}
    history={history}
    routes={routes} />,
  document.getElementById('root')
)

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, compose } from 'redux';
import reducer from './reducers';
import App from './routes/App';
// para el ssr
import { createBrowserHistory } from 'history';
import { Router } from 'react-router'
import initialState from './initialState'
// para el ssr


// para el ssr
const history = createBrowserHistory();
// para el ssr


const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducer, initialState, composeEnhancers());

ReactDOM.render(
  <Provider store={store}>
    <Router history={history} >
      <App />
    </Router>
  </Provider>,
  document.getElementById('app')
);
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, compose } from 'redux';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router';
import reducer from './reducers';
import App from './routes/App';

// para el ssr
// import initialState from './initialState'
// nos traemos el initialState del servidor
const preloadedState = window.__PRELOADED_STATE__;
// para el ssr

// para el ssr
const history = createBrowserHistory();
// para el ssr

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducer, preloadedState, composeEnhancers());

// borramos el preloadedState
delete window.__PRELOADED_STATE__;
// borramos el preloadedState

ReactDOM.hydrate(
  <Provider store={store}>
    <Router history={history}>
      <App />
    </Router>
  </Provider>,
  document.getElementById('app'),
);

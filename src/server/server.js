/* eslint-disable eqeqeq */
/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable global-require */
/* eslint-disable import/order */
import express from 'express';
import dotenv from 'dotenv';
import webpack from 'webpack';
import helmet from 'helmet';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { renderRoutes } from 'react-router-config';
import { StaticRouter } from 'react-router-dom';
import serverRoutes from '../frontend/routes/serverRoutes';
import reducer from '../frontend/reducers';
// en ves de traerlo de otro lado lo vamos a generar, cunado rendericemos la app,react
// import initialState from '../frontend/initialState';
import getManifest from './getManifest';

// las dependencias para Passport
import cookieParser from 'cookie-parser';
import boom from '@hapi/boom';
import passport from 'passport';
import axios from 'axios';
// las dependencias para Passport

dotenv.config();

const { ENV, PORT } = process.env;
const app = express();

// el tiempo de vida de la atorisacion
// Agregamos las variables de timpo en milisegundos
const THIRTY_DAYS_IN_SEC = 2592000000;
const TWO_HOURS_IN_SEC = 7200000;

// la configuracion para Passport
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

// traigo las estrategia basic
require('./utils/auth/strategies/basic');

// la configuracion para Passport

if (ENV === 'development') {
  console.log('Development config');
  const webpackConfig = require('../../webpack.config');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const compiler = webpack(webpackConfig);
  const serverConfig = { port: PORT, hot: true };

  app.use(webpackDevMiddleware(compiler, serverConfig));
  app.use(webpackHotMiddleware(compiler));
} else {
  app.use((req, res, next) => {
    if (!req.hashManifest) req.hashManifest = getManifest();
    next();
  });
  app.use(express.static(`${__dirname}/public`));
  app.use(helmet());
  app.use(helmet.permittedCrossDomainPolicies());
  app.disable('x-powered-by');
}

const setResponse = (html, preloadedState, manifest) => {
  const mainStyles = manifest ? manifest['main.css'] : 'assets/app.css';
  const mainBuild = manifest ? manifest['main.js'] : 'assets/app.js';
  const vendorBuild = manifest ? manifest['vendors.js'] : 'assets/vendor.js';

  return (`
  <!DOCTYPE html>
  <html>
    <head>
      <link rel="stylesheet" href="${mainStyles}" type="text/css">
      <title>Platzi Video</title>
    </head>
    <body>
      <div id="app">${html}</div>
      <script>
        window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g, '\\u003c')}
      </script>
      <script src="${mainBuild}" type="text/javascript"></script>
      <script src="${vendorBuild}" type="text/javascript"></script>
    </body>
  </html>
  `);
};

const renderApp = async (req, res) => {

  let initialState;
  // nos traemos de las cookies
  const { token, email, name, id } = req.cookies;

  try {
    let movieList = await axios({
      url: `${process.env.API_URL}/api/movies`,
      headers: { Authorization: `Bearer ${token}` },
      method: 'get',
    });

    let userMovieRelations = await axios({
      url: `${process.env.API_URL}/api/user-movies/sign-in`,
      headers: { Authorization: `Bearer ${token}` },
      method: 'get',
    });

    // pasamos los datos que regresa axios
    movieList = movieList.data.data;
    // userMovieRelations = userMovieRelations.data.data;

    // const userMovieList = movieList.filter((movie) => {
    //   let isUserMovie = userMovieRelations.some(
    //     userHas => userHas.movieId == movie._id,
    //   );
    //   return isUserMovie;
    // });

    initialState = {
      user: {
        email, name, id,
      },
      myList: [],
      trends: movieList.filter(movie => movie.contentRating === 'PG' && movie._id),
      originals: movieList.filter(movie => movie.contentRating === 'G' && movie._id),
    };
  } catch (error) {
    initialState = {
      user: {},
      myList: [],
      trends: [],
      originals: [],
    };
  }

  const store = createStore(reducer, initialState);
  const preloadedState = store.getState();
  const isLogged = (initialState.user.id);
  const html = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.url} context={{}}>
        {renderRoutes(serverRoutes(isLogged))}
      </StaticRouter>
    </Provider>,
  );

  res.send(setResponse(html, preloadedState, req.hashManifest));
};

// ponemos las rutas de Passport

app.post('/auth/sign-in', async function (req, res, next) {
  // Obtenemos el atributo rememberMe desde el cuerpo del request
  const { rememberMe } = req.body;

  passport.authenticate('basic', function (error, data) {
    try {
      if (error || !data) {
        next(boom.unauthorized());
      }

      req.login(data, { session: false }, async function (err) {
        if (err) {
          next(err);
        }

        const { token, ...user } = data;

        res.cookie('token', token, {
          httpOnly: !(ENV === 'development'),
          secure: !(ENV === 'development'),
          maxAge: rememberMe ? THIRTY_DAYS_IN_SEC : TWO_HOURS_IN_SEC,
        });

        res.status(200).json(user);
      });
    } catch (err) {
      next(err);
    }
  })(req, res, next);
});

app.post('/auth/sign-up', async function (req, res, next) {
  const { body: user } = req;

  try {
    const userData = await axios({
      url: `${process.env.API_URL}/api/auth/sign-up`,
      method: 'post',
      data: {
        'email': user.email,
        'name': user.name,
        'password': user.password,
      },
    });

    res.status(201).json({
      name: req.body.name,
      email: req.body.email,
      id: userData.data.id,
    });
  } catch (error) {
    next(error);
  }
});

// ponemos las rutas de Passport

// le podemos las rutas para la seccion de videos favoritos
app.post('/user-movies/:userMovieId', async function (req, res, next) {
  const { userMovieId } = req.params;
  const { token } = req.cookies;

  try {
    const response = await axios({
      url: `${process.env.API_URL}/api/user-movies/${userMovieId}`,
      method: 'post',
      headers: { Authorization: `Bearer-Token ${token}` },
      data: { userMovieId },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Fetch to API (user-movies/:userMovieId) failed.');
    next(error);
  }
});

app.get('*', renderApp);

app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log(`Server running on port ${PORT}`);
});

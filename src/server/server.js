import express from "express";
import dotenv from "dotenv";
import webpack from "webpack";

// busca un archivo env
dotenv.config();

const { ENV, PORT } = process.env;

const app = express();

if (ENV === 'development') {
  console.log('development config');
  const webpackConfig = require('../../webpack.config');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const compiler = webpack(webpackConfig);
  const serverConfig = { port: PORT, hot: true };
  
  app.use(webpackDevMiddleware(compiler,serverConfig));
  app.use(webpackHotMiddleware(compiler));
}

// toda la informaciondel usuario , req
// respuest a nuestro usuario, res
app.get("*", (req, res) => {
  // enviamos un
  res.send({ hello: "express" });
});

app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log(`esta corriendo en el puesto ${PORT}`);
});

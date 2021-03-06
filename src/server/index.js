
// Para el SSR
require('ignore-styles'); //le dice que ignore las clases de ccs del lado del servidor
// Para el SSR

require('@babel/register')({
  presets: ['@babel/preset-env', '@babel/preset-react'],
});

// para el el asset-require-hook
require('asset-require-hook')({
  extensions: ['jpg','png','gif'], // los formatos estaticos, que va a soportar node
  name: '/assets/[hash].[ext]'
});
// para el el asset-require-hook

require('./server');
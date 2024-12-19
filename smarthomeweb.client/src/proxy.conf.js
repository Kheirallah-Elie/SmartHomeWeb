const { env } = require('process');

const target = 'https://web-app-t5-dev-aca2dahff0bkb5g9.westeurope-01.azurewebsites.net';

const PROXY_CONFIG = [
  {
    context: ["/api"], // Redirige toutes les requêtes commençant par /api vers le backend
    target: target,
    secure: false,
    changeOrigin: true
  }
];

module.exports = PROXY_CONFIG;

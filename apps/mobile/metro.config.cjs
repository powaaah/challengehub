/* global __dirname */
const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');
const guestDuels = require('./preview/guest-duels.cjs');
const proxyCatalog = require('./preview/catalog-proxy.cjs');
const config = getDefaultConfig(__dirname);
// Reuse the framework-free v1 client and domain validator without copying them.
config.watchFolders = ['clients', 'domain'].map(folder => path.resolve(__dirname, '../..', folder));
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];
config.server.enhanceMiddleware = middleware => (request, response, next) => {
  guestDuels(request, response).then(handled => handled || proxyCatalog(request, response)).then(handled => {
    if (!handled) middleware(request, response, next);
  }).catch(next);
};
module.exports = config;

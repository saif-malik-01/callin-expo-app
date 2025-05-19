const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  'event-target-shim/index': require.resolve('event-target-shim/dist/event-target-shim.js'),
};

module.exports = config;
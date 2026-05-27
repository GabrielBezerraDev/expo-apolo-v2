const { getDefaultConfig } = require('expo/metro-config');
const { withTamagui } = require('@tamagui/metro-plugin');

const config = withTamagui(getDefaultConfig(__dirname), {
  config: './src/config/tamagui.config.ts',
  components: ['tamagui'],
});

module.exports = config;

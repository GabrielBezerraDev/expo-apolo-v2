const { getDefaultConfig } = require('expo/metro-config');
const { withTamagui } = require('@tamagui/metro-plugin');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

const config = withTamagui(defaultConfig, {
  config: './src/config/tamagui.config.ts',
  components: ['tamagui'],
});

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
};

config.resolver = {
  ...config.resolver,
  assetExts: assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...sourceExts, 'svg'],
};

module.exports = config;

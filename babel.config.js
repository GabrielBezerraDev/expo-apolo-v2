module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-transform-export-namespace-from',
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui'],
          config: './src/config/tamagui.config.ts',
        },
      ],
    ],
  };
};

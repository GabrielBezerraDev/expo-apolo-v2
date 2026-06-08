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
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@application': './src/application',
            '@assets': './src/assets',
            '@config': './src/config',
            '@features': './src/features',
            '@navigation': './src/navigation',
            '@shared': './src/shared',
            '@styles': './src/styles',
          },
        },
      ],
    ],
  };
};

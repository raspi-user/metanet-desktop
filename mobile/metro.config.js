const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname, {
  isCSSEnabled: true,
});

module.exports = {
  ...defaultConfig,
  transformer: {
    ...defaultConfig.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    minifierConfig: {
      keep_classnames: false,
      keep_fnames: false,
      mangle: true,
      compress: {
        dead_code: true,
        drop_console: true,
        drop_debugger: true,
        keep_fargs: false,
        keep_fnames: false,
        keep_infinity: true,
        passes: 3,
      },
    },
  },
  resolver: {
    ...defaultConfig.resolver,
    sourceExts: [
      ...defaultConfig.resolver.sourceExts,
      'tsx',
      'ts',
      'cjs',
      'mjs',
    ],
    assetExts: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'woff', 'woff2', 'ttf', 'eot'],
    extraNodeModules: {
      'react-native-reanimated': require.resolve('./src/shims/reanimated.js'),
      '@babel/runtime': path.resolve(__dirname, 'node_modules/@babel/runtime'),
      '@mui/material': path.resolve(__dirname, 'node_modules/@mui/material'),
      'libphonenumber-js': path.resolve(__dirname, 'node_modules/libphonenumber-js'),
      'iso-3166-ts': path.resolve(__dirname, 'node_modules/iso-3166-ts'),
      shared: path.resolve(__dirname, '../shared'),
      'shared/contexts': path.resolve(__dirname, '../shared/contexts'),
      'shared/components': path.resolve(__dirname, '../shared/components'),
      'shared/pages': path.resolve(__dirname, '../shared/pages'),
      react: path.resolve(__dirname, 'node_modules/react'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
      events: require.resolve('events'),
    },
    resolveRequest: (context, moduleName, platform) => {
      const resolutions = {
        '@mui/material': 'node_modules/@mui/material/index.js',
        'libphonenumber-js/min': 'node_modules/libphonenumber-js/min/index.js',
        'iso-3166-ts': 'node_modules/iso-3166-ts/dist/index.js',
      };
      if (resolutions[moduleName]) {
        return {
          filePath: path.resolve(__dirname, resolutions[moduleName]),
          type: 'sourceFile',
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
    platforms: ['ios', 'android', 'web'],
    resolverMainFields: ['browser', 'module', 'main'],
    unstable_enableSymlinks: true,
    unstable_enablePackageExports: true,
  },
  watchFolders: [
    path.resolve(__dirname, '../shared'),
    path.resolve(__dirname, 'node_modules'),
  ],
};
module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxRuntime: 'automatic',
          unstable_transformProfile: 'esmodules',
          unstable_disableHelperInlining: true,
          unstable_disableModuleWrapping: true
        }
      ]
    ],
    plugins: [
      [
        '@babel/plugin-transform-runtime',
        {
          helpers: true,
          regenerator: true,
          useESModules: true,
          version: '7.27.0',
          absoluteRuntime: true
        }
      ],
      [
        'babel-plugin-module-resolver',
        {
          alias: {
            shared: '../shared',
            'shared/contexts': '../shared/contexts',
            'shared/components': '../shared/components',
            'shared/pages': '../shared/pages',
            'shared/config': '../shared/config',
            'shared/utils': '../shared/utils'
          }
        }
      ]
    ],
    sourceType: 'module'
  }
}

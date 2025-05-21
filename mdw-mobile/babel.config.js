module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript' // Add this preset for TypeScript support
  ],
  plugins: [
    '@babel/plugin-syntax-jsx' // Optional if you need the syntax plugin
  ]
}

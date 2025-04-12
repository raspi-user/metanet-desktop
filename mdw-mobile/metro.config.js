const path = require('path')

module.exports = {
  resolver: {
    alias: {
      shared: path.resolve(__dirname, 'shared')
    }
  }
}

import { useContext } from 'react'
import UIContext from '../UIContext'

// exports a function returning the Registry Operator for current ENV.
// Currently, the registry is operated by Ty Everett.
export default () => {
  const { env } = useContext(UIContext)
  return env === 'dev' || env === 'staging'
    ? '0294c479f762f6baa97fbcd4393564c1d7bd8336ebd15928135bbcf575cd1a71a1'
    : '022a70d2862aeb01ecf3014395cec93a2390e3e9d80aecc9bbbbde5ddbd2a3d283'
}

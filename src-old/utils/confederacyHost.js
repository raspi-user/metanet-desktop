import { useContext } from 'react'
import UIContext from '../UIContext'

// exports a function returning the Confederacy host for current ENV.
// The host is undefined in prod.
export default () => {
  const { env } = useContext(UIContext)
  return env === 'dev'
    ? 'http://localhost:3103'
    : env === 'staging'
      ? 'https://staging-confederacy.babbage.systems'
      : 'https://confederacy.babbage.systems'
}

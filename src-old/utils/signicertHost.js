import { useContext } from 'react'
import UIContext from '../UIContext'

// exports a function returning the SigniCert host for current ENV.
// The host is undefined in prod.
export default () => {
  const { env } = useContext(UIContext)
  const certifierUrl = env === 'dev'
    ? 'http://localhost:3002'
    : env === 'staging'
      ? 'https://staging-signicert.babbage.systems'
      : 'https://signicert.babbage.systems'

  const certifierPublicKey = env === 'dev' || env === 'staging'
    ? '036dc48522aba1705afbb43df3c04dbd1da373b6154341a875bceaa2a3e7f21528'
    : '0295bf1c7842d14babf60daf2c733956c331f9dcb2c79e41f85fd1dda6a3fa4549'

  const certificateType = 'z40BOInXkI8m7f/wBrv4MJ09bZfzZbTj2fJqCtONqCY='

  return {
    certifierUrl,
    certifierPublicKey,
    certificateType
  }
}

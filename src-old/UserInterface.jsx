/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { BreakpointProvider } from './utils/useBreakpoints.jsx'
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom'
import Greeter from './pages/Greeter/index.jsx'
import Recovery from './pages/Recovery/index.jsx'
import LostPhone from './pages/Recovery/LostPhone.jsx'
import LostPassword from './pages/Recovery/LostPassword.jsx'
import Dashboard from './pages/Dashboard/index.jsx'
import Welcome from './pages/Welcome/index.jsx'
import Theme from 'components/Theme'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import CodeHandler from 'components/CodeHandler.jsx'
import AuthenticationErrorHandler from 'components/AuthenticationErrorHandler.jsx'
import PaymentHandler from 'components/PaymentHandler.jsx'
import PasswordHandler from 'components/PasswordHandler.jsx'
import RecoveryKeyHandler from 'components/RecoveryKeyHandler.jsx'
import ProtocolPermissionHandler from 'components/ProtocolPermissionHandler/index.jsx'
import SpendingAuthorizationHandler from 'components/SpendingAuthorizationHandler/index.jsx'
import BasketAccessHandler from 'components/BasketAccessHandler/index.jsx'
import CertificateAccessHandler from 'components/CertificateAccessHandler/index.jsx'
import GroupPermissionHandler from 'components/GroupPermissionHandler/index.jsx'
import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import UIContext from './UIContext'
import { ExchangeRateContextProvider } from './components/AmountDisplay/ExchangeRateContextProvider.jsx'
import UserTheme from './components/UserTheme.jsx'
import { SettingsProvider } from './context/SettingsContext.js'

const queries = {
  xs: '(max-width: 500px)',
  sm: '(max-width: 720px)',
  md: '(max-width: 1024px)',
  or: '(orientation: portrait)'
}

let ErrorBoundary = ({ children }) => children

export default ({
  onFocusRequested = () => { },
  onFocusRelinquished = () => { },
  isFocused = () => false,
  saveLocalSnapshot = () => { },
  removeLocalSnapshot = () => { },
  appVersion = '1.0.0',
  appName = 'Generic Babbage Wrapper',
  env = 'prod',
  isPackaged = true,
  usePortal = false,
  portalDestination = document.body
} = {}) => {

  const returnValue = (
    <BreakpointProvider queries={queries}>
      <UIContext.Provider
        value={{
          onFocusRequested,
          onFocusRelinquished,
          isFocused,
          saveLocalSnapshot,
          removeLocalSnapshot,
          appVersion,
          appName,
          env,
          isPackaged
        }}
      >
        <div>
          <ErrorBoundary>
            <ExchangeRateContextProvider>
              <Theme>
                <SettingsProvider>
                  <UserTheme>
                    <Router>
                      <CodeHandler />
                      <AuthenticationErrorHandler />
                      <PasswordHandler />
                      <RecoveryKeyHandler />
                      <ProtocolPermissionHandler />
                      <SpendingAuthorizationHandler />
                      <BasketAccessHandler />
                      <CertificateAccessHandler />
                      <GroupPermissionHandler />
                      <PaymentHandler />
                      <ToastContainer position='top-center' />
                      <Switch>
                        <Route exact path='/' component={Greeter} />
                        <Route
                          exact
                          path='/recovery/lost-phone'
                          component={LostPhone}
                        />
                        <Route
                          exact
                          path='/recovery/lost-password'
                          component={LostPassword}
                        />
                        <Route exact path='/recovery' component={Recovery} />
                        <Route path='/dashboard' component={Dashboard} />
                        <Route path='/welcome' component={Welcome} />
                      </Switch>
                    </Router>
                  </UserTheme>
                </SettingsProvider>
              </Theme>
            </ExchangeRateContextProvider>
          </ErrorBoundary>
        </div>
      </UIContext.Provider>
    </BreakpointProvider>
  )
  if (usePortal) {
    return ReactDOM.createPortal(returnValue, portalDestination)
  } else {
    return returnValue
  }
}

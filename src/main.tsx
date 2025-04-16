import React from 'react'
import { createRoot } from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { UserInterface } from '@bsv/brc100-ui-react-components'
import { onWalletReady } from './onWalletReady'
import ErrorBoundary from './ErrorBoundary'
import ThemeWrapper from './ThemeWrapper'
import { tauriFunctions } from './tauriFunctions'

// Create a simple UI component as fallback
const SimplePlaceholderUI = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '2rem',
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      <h1>Metanet Desktop</h1>
      <p>UI component integration in progress...</p>
    </div>
  )
}

// Create the root and render:
const rootElement = document.getElementById('root')
if (rootElement) {
  const root = createRoot(rootElement)

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        {/* <ThemeWrapper> */}
        {/* Attempt to use the main UI component */}
        <UserInterface 
          onWalletReady={onWalletReady}
          tauriFunctions={tauriFunctions}
        />

        {/* Uncomment this and comment out the line above if there are issues */}
        {/* <SimplePlaceholderUI /> */}
        {/* </ThemeWrapper> */}
      </ErrorBoundary>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </React.StrictMode>
  )
}

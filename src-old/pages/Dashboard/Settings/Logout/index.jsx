import React, { useState, useContext } from 'react'
import { Button } from '@mui/material'
import UIContext from '../../../../UIContext'

const Logout = ({ history }) => {
  const { removeLocalSnapshot } = useContext(UIContext)
  const [loading, setLoading] = useState(false)

  const signout = async () => {
    setLoading(true)
    try {
      // This is for UX reasons, and also to make the button turn grey before the prompt to window.confirm
      await new Promise(resolve => setTimeout(resolve, 750))
      if (
        !window.confirm(
          'Are you absolutely sure you want to exit this MetaNet portal?\n\nYou will also be logged out of all apps and systems that use this portal.'
        )
      ) {
        return
      }
      await window.CWI.logout()
      await removeLocalSnapshot()
      if (typeof window.CWI.getNinja === 'function') {
        delete window.CWI.ninja
      }
      localStorage.clear()
      sessionStorage.clear()
      history.push('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant='contained'
      color='secondary'
      onClick={signout}
      disabled={loading}
    >
      Exit This MetaNet Portal
    </Button>
  )
}

export default Logout

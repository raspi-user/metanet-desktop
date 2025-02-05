import React, { useState, useEffect, useContext } from 'react'
import 'react-phone-number-input/style.css'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  Typography,
  Button,
  TextField,
  CircularProgress
} from '@mui/material'
import {
  SettingsPhone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  PermPhoneMsg as SMSIcon,
  Lock as LockIcon,
  VpnKey as KeyIcon
} from '@mui/icons-material'
import { makeStyles } from '@mui/styles'
import { toast } from 'react-toastify'
import UIContext from '../../UIContext'
import PhoneEntry from '../../components/PhoneEntry.jsx'
import style from './style'

const useStyles = makeStyles(style, { name: 'LostPassword' })

const RecoveryLostPassword = ({ history }) => {
  const { saveLocalSnapshot } = useContext(UIContext)
  const classes = useStyles()
  const [accordianView, setAccordianView] = useState('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [recoveryKey, setRecoveryKey] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  // Ensure the correct authentication mode
  useEffect(() => {
    window.CWI.setAuthenticationMode('phone-number-and-recovery-key')
  }, [])

  useEffect(() => {
    (async () => {
      setAuthenticated(await window.CWI.isAuthenticated())
    })()
  }, [])

  useEffect(() => {
    let id
    (async () => {
      id = await window.CWI.bindCallback('onAuthenticationSuccess', () => {
        setAccordianView('new-password')
        saveLocalSnapshot()
        if (typeof window.CWI.getNinja === 'function') {
          window.CWI.ninja = window.CWI.getNinja()
        }
      })
    })()
    return () => {
      if (id) {
        window.CWI.unbindCallback('onAuthenticationSuccess', id)
      }
    }
  }, [])

  const handleSubmitPhone = async e => {
    e.preventDefault()
    try {
      setLoading(true)
      const success = await window.CWI.submitPhoneNumber(phone)
      if (success === true) {
        setAccordianView('code')
        toast.success('A code has been sent to your phone.')
      }
    } catch (e) {
      console.error(e)
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitCode = async e => {
    e.preventDefault()
    try {
      setLoading(true)
      const success = await window.CWI.submitCode(code)
      if (success === true) {
        setAccordianView('recovery-key')
      }
    } catch (e) {
      console.error(e)
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }
  const handleResendCode = async () => {
    try {
      setLoading(true)
      await window.CWI.submitPhoneNumber(phone)
      toast.success('A new code has been sent to your phone.')
    } catch (e) {
      console.error(e)
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }
  const handleSubmitRecoveryKey = async e => {
    e.preventDefault()
    try {
      setLoading(true)
      await window.CWI.submitRecoveryKey(recoveryKey)
    } catch (e) {
      console.error(e)
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitPassword = async e => {
    e.preventDefault()
    try {
      setLoading(true)
      const result = await window.CWI.changePassword(password, confirmPassword)
      if (result === true) {
        history.push('/dashboard/apps')
      }
    } catch (e) {
      console.error(e)
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={classes.content_wrap}>
      <Typography variant='h2' paragraph fontFamily='Helvetica' fontSize='2em'>
        Reset Password
      </Typography>
      {authenticated && (
        <div>
          <Typography paragraph>
            You are currently logged in. You must log out in order to reset your password.
          </Typography>
          <Button
            color='secondary'
            onClick={async () => {
              if (!window.confirm('Log out?')) return
              await window.CWI.logout()
              setAuthenticated(false)
            }}
          >
            Log Out
          </Button>
        </div>
      )}
      <Accordion
        expanded={accordianView === 'phone'}
      >
        <AccordionSummary
          className={classes.panel_header}
        >
          <PhoneIcon className={classes.expansion_icon} />
          <Typography
            className={classes.panel_heading}
          >
            Phone Number
          </Typography>
          {(accordianView === 'code' || accordianView === 'password') && (
            <CheckCircleIcon className={classes.complete_icon} />
          )}
        </AccordionSummary>
        <form onSubmit={handleSubmitPhone}>
          <AccordionDetails
            className={classes.expansion_body}
          >
            <PhoneEntry
              value={phone}
              onChange={setPhone}
              placeholder='Enter phone number'
            />
          </AccordionDetails>
          <AccordionActions>
            {loading
              ? <CircularProgress />
              : (
                <Button
                  variant='contained'
                  color='primary'
                  type='submit'
                >
                  Send Code
                </Button>
              )}
          </AccordionActions>
        </form>
      </Accordion>
      <Accordion
        expanded={accordianView === 'code'}
      >
        <AccordionSummary
          className={classes.panel_header}
        >
          <SMSIcon className={classes.expansion_icon} />
          <Typography
            className={classes.panel_heading}
          >
            Enter code
          </Typography>
          {accordianView === 'password' && (
            <CheckCircleIcon className={classes.complete_icon} />
          )}
        </AccordionSummary>
        <form onSubmit={handleSubmitCode}>
          <AccordionDetails
            className={classes.expansion_body}
          >
            <TextField
              onChange={e => setCode(e.target.value)}
              label='Code'
              fullWidth
            />
          </AccordionDetails>
          <AccordionActions>
            <Button
              color='secondary'
              onClick={handleResendCode}
              disabled={loading}
              align='left'
            >
              Resend Code
            </Button>
            {loading
              ? <CircularProgress />
              : (
                <Button
                  variant='contained'
                  color='primary'
                  type='submit'
                >
                  Next
                </Button>
              )}
          </AccordionActions>
        </form>
      </Accordion>
      <Accordion
        className={classes.accordion}
        expanded={accordianView === 'recovery-key'}
      >
        <AccordionSummary
          className={classes.panel_header}
        >
          <KeyIcon className={classes.expansion_icon} />
          <Typography
            className={classes.panel_heading}
          >
            Recovery Key
          </Typography>
          {(accordianView === 'password') && (
            <CheckCircleIcon className={classes.complete_icon} />
          )}
        </AccordionSummary>
        <form onSubmit={handleSubmitRecoveryKey}>
          <AccordionDetails
            className={classes.expansion_body}
          >
            <TextField
              onChange={e => setRecoveryKey(e.target.value)}
              label='Recovery Key'
              fullWidth
            />
          </AccordionDetails>
          <AccordionActions>
            {loading
              ? <CircularProgress />
              : (
                <Button
                  variant='contained'
                  color='primary'
                  type='submit'
                >
                  Continue
                </Button>
              )}
          </AccordionActions>
        </form>
      </Accordion>
      <Accordion
        expanded={accordianView === 'new-password'}
      >
        <AccordionSummary
          className={classes.panel_header}
        >
          <LockIcon className={classes.expansion_icon} />
          <Typography
            className={classes.panel_heading}
          >
            New Password
          </Typography>
        </AccordionSummary>
        <form onSubmit={handleSubmitPassword}>
          <AccordionDetails
            className={classes.expansion_body}
          >
            <TextField
              margin='normal'
              onChange={e => setPassword(e.target.value)}
              label='Password'
              fullWidth
              type='password'
            />
            <br />
            <TextField
              margin='normal'
              onChange={e => setConfirmPassword(e.target.value)}
              label='Confirm Password'
              fullWidth
              type='password'
            />
          </AccordionDetails>
          <AccordionActions>
            {loading
              ? <CircularProgress />
              : (
                <Button
                  variant='contained'
                  color='primary'
                  type='submit'
                >
                  Finish
                </Button>
              )}
          </AccordionActions>
        </form>
      </Accordion>
      <Button
        onClick={() => history.go(-1)}
        className={classes.back_button}
      >
        Go Back
      </Button>
    </div>
  )
}

export default RecoveryLostPassword

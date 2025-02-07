import { useContext, useState, useEffect, useRef } from 'react'
import style from './style'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Divider,
  InputAdornment,
  IconButton
} from '@mui/material'
import {
  SettingsPhone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  PermPhoneMsg as SMSIcon,
  Lock as LockIcon
} from '@mui/icons-material'
import PhoneEntry from '../../components/PhoneEntry.js'
import { makeStyles } from '@mui/styles'
import { Link } from 'react-router-dom'
import CWILogo from '../../components/Logo.js'
import { toast } from 'react-toastify'
import { WalletContext } from '../../UserInterface'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import PageLoading from '../../components/PageLoading.js'
import { Utils } from '@bsv/sdk'
// import KernelConfigurator from '../../components/KernelConfigurator.jsx'

const useStyles = makeStyles(style as any, { name: 'Greeter' })

const Greeter: React.FC<any> = ({ history }) => {
  const { appVersion, appName, managers } = useContext(WalletContext)
  const classes = useStyles()
  const [accordionView, setAccordionView] = useState('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accountStatus, setAccountStatus] = useState(undefined)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [pageLoaded, setPageLoaded] = useState(false)
  const phoneField = useRef(null)
  const codeField = useRef(null)
  const passwordField = useRef(null)
  // const [electronVersion, setElectronVersion] = useState('0.0.0')

  // Navigate to the dashboard if the user is already authenticated
  useEffect(() => {
    (async () => {
      if (managers.walletManager!.authenticated) {
        history.push('/dashboard/apps')
      }
      setPageLoaded(true)
    })()
  }, [history, managers])

  // Ensure the correct authentication mode
  useEffect(() => {
    managers.walletManager!.authenticationMode = 'presentation-key-and-password'
  }, [])

  const handleSubmitPhone = async e => {
    e.preventDefault()
    try {
      setLoading(true)
      await managers.walletManager!.providePhoneNumber(phone)
      setAccordionView('code')
      toast.success('A code has been sent to your phone.')
      if (codeField.current) {
        codeField.current.children[1].children[0].focus()
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
      managers.walletManager?.provideCode(code)
      if (managers.walletManager?.authenticationFlow === 'new-user') {
        setAccountStatus('new-user')
      }
      setAccordionView('password')
      if (passwordField.current) {
        passwordField.current.children[1].children[0].focus()
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
      await managers.walletManager?.providePhoneNumber(phone)
      toast.success('A new code has been sent to your phone.')
    } catch (e) {
      console.error(e)
      toast.error(e.message)
    } finally {
      // Prevent lots of re-send spam clicks
      await new Promise(resolve => setTimeout(resolve, 3000))
      setLoading(false)
    }
  }

  // TODO: Support auto-type again.
  // useEffect(() => {
  //   (async () => {
  //     if (accountStatus === 'existing-user') {
  //       try {
  //         const result = await window.CWI.submitPassword(password, password, true)
  //         if (result === true) {
  //           await saveLocalSnapshot()
  //           if (typeof window.CWI.getNinja === 'function') {
  //             window.CWI.ninja = window.CWI.getNinja()
  //           }
  //           history.push('/dashboard/apps')
  //         }
  //       } catch (e) {
  //       }
  //     }
  //   })()
  // }, [password])

  const handleSubmitPassword = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await managers.walletManager!.providePassword(
        password
      )
      if (managers.walletManager?.authenticated === true) {
        localStorage.snap = Utils.toBase64(managers.walletManager?.saveSnapshot())
        // if (accountStatus === 'new-user') {
        // history.push('/welcome') // todo
        // } else {
        // }
        history.push('/dashboard/apps')
      } else {
        throw new Error('Not authenticated, maybe password was wrong?')
      }
    } catch (e) {
      console.error(e)
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!pageLoaded) {
    return <PageLoading />
  }

  return (
    <div className={classes.max_width}>
      <div className={classes.content_wrap}>
        <center>
          <CWILogo
            className={classes.logo}
            rotate
          />
          <Typography variant='h2' paragraph fontFamily='Helvetica' fontSize='2em'>
            {appName}
          </Typography>
          <Typography variant='h4' paragraph fontFamily='Helvetica'>
            Welcome!
          </Typography>
          <Typography variant='p' paragraph>
            Please enter your phone number to login or sign up.
          </Typography>
          <Divider />
        </center>
        <Accordion
          expanded={accordionView === 'phone'}
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
            {(accordionView === 'code' || accordionView === 'password') && (
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
                autoFocus
                forewarRef={phoneField}
              />
            </AccordionDetails>
            <AccordionActions>
              <Button
                color='secondary'
                style={{ fontWeight: 'bold' }}
                type='submit'
                disabled={loading}
              >
                {!loading ? 'Send Code' : <CircularProgress />}
              </Button>
            </AccordionActions>
          </form>
        </Accordion>
        <Accordion
          expanded={accordionView === 'code'}
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
            {accordionView === 'password' && (
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
                autoFocus
                ref={codeField}
              />
            </AccordionDetails>
            <AccordionActions>
              <Button
                color='primary'
                onClick={handleResendCode}
                size='small'
                disabled={loading}
                align='left'
              >
                Resend Code
              </Button>
            </AccordionActions>
            <AccordionActions>
              <Button
                color='primary'
                onClick={() => setAccordionView('phone')}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                color='secondary'
                style={{ fontWeight: 'bold' }}
                type='submit'
                disabled={loading}
              >
                {!loading ? 'Next' : <CircularProgress />}
              </Button>
            </AccordionActions>
          </form>
        </Accordion>
        <Accordion
          expanded={accordionView === 'password'}
        >
          <AccordionSummary
            className={classes.panel_header}
          >
            <LockIcon className={classes.expansion_icon} />
            <Typography
              className={classes.panel_heading}
            >
              Password
            </Typography>
          </AccordionSummary>
          <form onSubmit={handleSubmitPassword}>
            <AccordionDetails
              className={classes.expansion_body}
            >
              <div
                className={
                  accountStatus === 'new-user'
                    ? classes.new_password_grid
                    : classes.password_grid
                }
              >
                <TextField
                  ref={passwordField}
                  onChange={e => setPassword(e.target.value)}
                  label='Password'
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          aria-label='toggle password visibility'
                          onClick={() => setShowPassword(!showPassword)}
                          edge='end'
                          style={{ color: 'inherit' }}
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                {accountStatus === 'new-user' && (
                  <TextField
                    onChange={e => setConfirmPassword(e.target.value)}
                    label='Retype Password'
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            aria-label='toggle password visibility'
                            onClick={() => setShowPassword(!showPassword)}
                            edge='end'
                            style={{ color: 'inherit' }}
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              </div>
            </AccordionDetails>
            <AccordionActions>
              <Button
                color='primary'
                onClick={() => setAccordionView('phone')}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                variant='contained'
                color='primary'
                type='submit'
                disabled={loading}
              >
                {!loading
                  ? (accountStatus === 'new-user'
                    ? 'Create Account'
                    : 'Log In'
                  )
                  : <CircularProgress />}
              </Button>
            </AccordionActions>
          </form>
        </Accordion>
        {/* <KernelConfigurator /> */}
        <br />
        <br />
        <Link to='/recovery'>
          <Button
            color='secondary'
            className={classes.recovery_link}
          >
            Account Recovery?
          </Button>
        </Link>
        <Typography
          align='center'
          color='textSecondary'
          className={classes.copyright_text}
        >
          <b>{appName} version {appVersion}</b>
        </Typography>
        <Typography
          align='center'
          color='textSecondary'
          className={classes.copyright_text}
        >
          Copyright &copy; 2020-2023 Peer-to-peer Privacy Systems Research, LLC. All rights reserved. Redistribution of this software is strictly prohibited. Use of this software is subject to the{' '}
          <a href='https://projectbabbage.com/desktop/license' target='_blank' rel='noopener noreferrer'>Babbage Software License Agreement</a>.
        </Typography>
      </div>
    </div>
  )
}

export default Greeter

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

const useStyles = makeStyles(style as any, { name: 'Greeter' })

const Greeter: React.FC<any> = ({ history }) => {
  const { appVersion, appName, managers } = useContext(WalletContext)
  const classes = useStyles()

  // We keep the same Accordion steps: phone, code, password
  const [accordionView, setAccordionView] = useState('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accountStatus, setAccountStatus] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [pageLoaded, setPageLoaded] = useState(false)

  const phoneField = useRef(null)
  const codeField = useRef(null)
  const passwordField = useRef(null)

  // Access the manager:
  const walletManager = managers.walletManager

  useEffect(() => {
    (async () => {
      // If the user is already authenticated, skip to dashboard
      if (walletManager?.authenticated) {
        history.push('/dashboard/apps')
      }
      setPageLoaded(true)
    })()
  }, [history, walletManager])

  // Force the manager to use the "presentation-key-and-password" flow:
  useEffect(() => {
    if (walletManager) {
      walletManager.authenticationMode = 'presentation-key-and-password'
    }
  }, [walletManager])

  // Step 1: The user enters a phone number, we call manager.startAuth(...)
  // This replaces the old providePhoneNumber(...) approach:
  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletManager) {
      toast.error("Wallet Manager not ready yet.")
      return
    }
    try {
      setLoading(true)
      // Typically we do manager.startAuth(...) with a Twilio payload
      await walletManager.startAuth({ phoneNumber: phone })
      setAccordionView('code')
      toast.success('A code has been sent to your phone.')
      // Move focus to code field
      if (codeField.current) {
        // MUI sub-layers: codeField.current.children[1].children[0].focus()
        (codeField.current as any).children[1].children[0].focus()
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Failed to send code")
    } finally {
      setLoading(false)
    }
  }

  // Step 2: The user enters the OTP code, we call manager.completeAuth(...)
  // This replaces the old provideCode(...) approach:
  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletManager) {
      toast.error("Wallet Manager not ready yet.")
      return
    }
    try {
      setLoading(true)
      await walletManager.completeAuth({ phoneNumber: phone, otp: code })

      // manager.completeAuth(...) should set manager.authenticationFlow to either
      // 'existing-user' or 'new-user' after retrieving the presentationKey from the WAB
      if (walletManager.authenticationFlow === 'new-user') {
        setAccountStatus('new-user')
      } else {
        setAccountStatus('existing-user')
      }

      setAccordionView('password')
      if (passwordField.current) {
        (passwordField.current as any).children[1].children[0].focus()
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Failed to verify code")
    } finally {
      setLoading(false)
    }
  }

  // Optional "resend code" that just calls startAuth again
  const handleResendCode = async () => {
    if (!walletManager) return
    try {
      setLoading(true)
      await walletManager.startAuth({ phoneNumber: phone })
      toast.success('A new code has been sent to your phone.')
    } catch (e: any) {
      console.error(e)
      toast.error(e.message)
    } finally {
      // small delay to avoid spam
      await new Promise(resolve => setTimeout(resolve, 2000))
      setLoading(false)
    }
  }

  // Step 3: Provide a password for the final step.
  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletManager) {
      toast.error("Wallet Manager not ready yet.")
      return
    }

    // If new-user, confirm password match
    if (accountStatus === 'new-user') {
      if (password !== confirmPassword) {
        toast.error("Passwords don't match.")
        return
      }
    }

    setLoading(true)
    try {
      // manager.providePassword(...) finalizes the creation or retrieval of the user’s primary key
      await walletManager.providePassword(password)

      if (walletManager.authenticated) {
        // Save snapshot to local storage
        localStorage.snap = Utils.toBase64(walletManager.saveSnapshot())
        toast.success("Authenticated successfully!")
        history.push(accountStatus === 'new-user' ? '/welcome' : '/dashboard/apps')
      } else {
        throw new Error('Authentication failed, maybe password is incorrect?')
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message)
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
          <Typography variant='body1' paragraph>
            Please enter your phone number to login or sign up.
          </Typography>
          <Divider />
        </center>
        {/* PHONE step */}
        <Accordion expanded={accordionView === 'phone'}>
          <AccordionSummary className={classes.panel_header}>
            <PhoneIcon className={classes.expansion_icon} />
            <Typography className={classes.panel_heading}>
              Phone Number
            </Typography>
            {(accordionView === 'code' || accordionView === 'password') && (
              <CheckCircleIcon className={classes.complete_icon} />
            )}
          </AccordionSummary>
          <form onSubmit={handleSubmitPhone}>
            <AccordionDetails className={classes.expansion_body}>
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
                {!loading ? 'Send Code' : <CircularProgress size={20} />}
              </Button>
            </AccordionActions>
          </form>
        </Accordion>

        {/* CODE step */}
        <Accordion expanded={accordionView === 'code'}>
          <AccordionSummary className={classes.panel_header}>
            <SMSIcon className={classes.expansion_icon} />
            <Typography className={classes.panel_heading}>
              Enter code
            </Typography>
            {accordionView === 'password' && (
              <CheckCircleIcon className={classes.complete_icon} />
            )}
          </AccordionSummary>
          <form onSubmit={handleSubmitCode}>
            <AccordionDetails className={classes.expansion_body}>
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
                {!loading ? 'Next' : <CircularProgress size={20} />}
              </Button>
            </AccordionActions>
          </form>
        </Accordion>

        {/* PASSWORD step */}
        <Accordion expanded={accordionView === 'password'}>
          <AccordionSummary className={classes.panel_header}>
            <LockIcon className={classes.expansion_icon} />
            <Typography className={classes.panel_heading}>
              Password
            </Typography>
          </AccordionSummary>
          <form onSubmit={handleSubmitPassword}>
            <AccordionDetails className={classes.expansion_body}>
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
                {loading ? (
                  <CircularProgress size={20} />
                ) : (
                  accountStatus === 'new-user' ? 'Create Account' : 'Log In'
                )}
              </Button>
            </AccordionActions>
          </form>
        </Accordion>

        <br />
        <br />
        <Link to='/recovery'>
          <Button color='secondary' className={classes.recovery_link}>
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
          Copyright &copy; 2020-2023 Peer-to-peer Privacy Systems Research, LLC.
          All rights reserved. Redistribution of this software is strictly prohibited.
          Use of this software is subject to the{' '}
          <a
            href='https://projectbabbage.com/desktop/license'
            target='_blank'
            rel='noopener noreferrer'
          >
            Babbage Software License Agreement
          </a>.
        </Typography>
      </div>
    </div>
  )
}

export default Greeter

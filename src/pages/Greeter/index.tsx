import { useContext, useState, useEffect, useRef } from 'react'
import style from './style'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Divider,
  InputAdornment,
  IconButton,
  Paper,
  Box,
  Container
} from '@mui/material'
import {
  SettingsPhone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  PermPhoneMsg as SMSIcon,
  Lock as LockIcon
} from '@mui/icons-material'
import PhoneEntry from '../../components/PhoneEntry.js'
import { Link } from 'react-router-dom'
import AppLogo from '../../components/AppLogo'
import { toast } from 'react-toastify'
import { WalletContext } from '../../UserInterface'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import PageLoading from '../../components/PageLoading.js'
import { Utils } from '@bsv/sdk'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles(style as any, { name: 'Greeter' })

// Phone form component to reduce cognitive complexity
const PhoneForm = ({ phone, setPhone, loading, handleSubmitPhone, phoneField }) => (
  <form onSubmit={handleSubmitPhone}>
    <PhoneEntry
      value={phone}
      onChange={setPhone}
      ref={phoneField}
      sx={{
        width: '100%',
        mb: 2, 
        '& .MuiOutlinedInput-root': {
          borderRadius: 1
        }
      }}
    />
    <Button
      variant='contained'
      type='submit'
      disabled={loading || !phone || phone.length < 10}
      fullWidth
      sx={{ 
        mt: 2,
        borderRadius: 1,
        textTransform: 'none',
        py: 1.2
      }}
    >
      {loading ? <CircularProgress size={24} /> : 'Continue'}
    </Button>
  </form>
);

// Code verification form component
const CodeForm = ({ code, setCode, loading, handleSubmitCode, handleResendCode, codeField }) => (
  <>
    <form onSubmit={handleSubmitCode}>
      <TextField
        label="6-digit code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        variant="outlined"
        fullWidth
        disabled={loading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {code.length === 6 && <CheckCircleIcon color='success' />}
            </InputAdornment>
          ),
        }}
        ref={codeField}
        sx={{ 
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: 1
          }
        }}
      />
      <Button
        variant='contained'
        type='submit'
        disabled={loading || code.length !== 6}
        fullWidth
        sx={{ 
          mt: 2,
          borderRadius: 1,
          textTransform: 'none',
          py: 1.2
        }}
      >
        {loading ? <CircularProgress size={24} /> : 'Verify Code'}
      </Button>
    </form>
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
      <Button
        disabled={loading}
        onClick={handleResendCode}
        size="small"
        color="secondary"
        sx={{ textTransform: 'none' }}
      >
        Resend Code
      </Button>
    </Box>
  </>
);

// Password form component
const PasswordForm = ({ password, setPassword, confirmPassword, setConfirmPassword, showPassword, setShowPassword, loading, handleSubmitPassword, accountStatus, passwordField }) => (
  <form onSubmit={handleSubmitPassword}>
    <TextField
      label="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      type={showPassword ? 'text' : 'password'}
      variant="outlined"
      fullWidth
      disabled={loading}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => setShowPassword(!showPassword)}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      ref={passwordField}
      sx={{ 
        mb: 2,
        '& .MuiOutlinedInput-root': {
          borderRadius: 1
        }
      }}
    />

    {accountStatus === 'new-user' && (
      <TextField
        label="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        type={showPassword ? 'text' : 'password'}
        variant="outlined"
        fullWidth
        disabled={loading}
        sx={{ 
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: 1
          }
        }}
      />
    )}

    <Button
      variant='contained'
      type='submit'
      disabled={loading || !password || (accountStatus === 'new-user' && !confirmPassword)}
      fullWidth
      sx={{ 
        mt: 2,
        borderRadius: 1,
        textTransform: 'none',
        py: 1.2
      }}
    >
      {loading ? <CircularProgress size={24} /> : (accountStatus === 'new-user' ? 'Create Account' : 'Login')}
    </Button>
  </form>
);

// Main Greeter component with reduced complexity
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
  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletManager) {
      toast.error("Wallet Manager not ready yet.")
      return
    }
    try {
      setLoading(true)
      await walletManager.startAuth({ phoneNumber: phone })
      setAccordionView('code')
      toast.success('A code has been sent to your phone.')
      // Move focus to code field
      if (codeField.current) {
        codeField.current.children[1].children[0].focus()
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Failed to send code")
    } finally {
      setLoading(false)
    }
  }

  // Step 2: The user enters the OTP code, we call manager.completeAuth(...)
  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletManager) {
      toast.error("Wallet Manager not ready yet.")
      return
    }
    try {
      setLoading(true)
      await walletManager.completeAuth({ phoneNumber: phone, otp: code })

      if (walletManager.authenticationFlow === 'new-user') {
        setAccountStatus('new-user')
      } else {
        setAccountStatus('existing-user')
      }

      setAccordionView('password')
      if (passwordField.current) {
        passwordField.current.children[1].children[0].focus()
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
    if (accountStatus === 'new-user' && password !== confirmPassword) {
      toast.error("Passwords don't match.")
      return
    }

    setLoading(true)
    try {
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
    <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Paper 
        elevation={4} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          background: 'linear-gradient(to bottom right, #ffffff, #f5f5f5)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{ mb: 2, width: '100px', height: '100px' }}>
            <AppLogo
              rotate
              size="100px"
              color="#2196F3"
            />
          </Box>
          <Typography 
            variant='h2' 
            fontFamily='Helvetica' 
            fontSize='2em'
            sx={{ 
              mb: 1,
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #2196F3, #3f51b5)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {appName}
          </Typography>
          <Typography 
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 3 }}
          >
            Secure your digital identity with blockchain technology
          </Typography>
          <Divider sx={{ width: '80%', mb: 4 }} />
        </Box>

        {/* PHONE step */}
        <Accordion 
          expanded={accordionView === 'phone'}
          sx={{ 
            mb: 2,
            boxShadow: 'none',
            '&:before': { display: 'none' },
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <AccordionSummary 
            sx={{
              backgroundColor: accordionView === 'phone' ? 'rgba(33, 150, 243, 0.08)' : 'transparent',
              borderLeft: accordionView === 'phone' ? '4px solid #2196F3' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography sx={{ fontWeight: 500 }}>
                Phone Number
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 3, pb: 3 }}>
            <PhoneForm 
              phone={phone}
              setPhone={setPhone}
              loading={loading}
              handleSubmitPhone={handleSubmitPhone}
              phoneField={phoneField}
            />
          </AccordionDetails>
        </Accordion>

        {/* CODE step */}
        <Accordion 
          expanded={accordionView === 'code'}
          sx={{ 
            mb: 2,
            boxShadow: 'none',
            '&:before': { display: 'none' },
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <AccordionSummary 
            sx={{
              backgroundColor: accordionView === 'code' ? 'rgba(33, 150, 243, 0.08)' : 'transparent',
              borderLeft: accordionView === 'code' ? '4px solid #2196F3' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SMSIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography sx={{ fontWeight: 500 }}>
                Verification Code
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 3, pb: 3 }}>
            <CodeForm
              code={code}
              setCode={setCode}
              loading={loading}
              handleSubmitCode={handleSubmitCode}
              handleResendCode={handleResendCode}
              codeField={codeField}
            />
          </AccordionDetails>
        </Accordion>

        {/* PASSWORD step */}
        <Accordion 
          expanded={accordionView === 'password'}
          sx={{ 
            mb: 2,
            boxShadow: 'none',
            '&:before': { display: 'none' },
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <AccordionSummary 
            sx={{
              backgroundColor: accordionView === 'password' ? 'rgba(33, 150, 243, 0.08)' : 'transparent',
              borderLeft: accordionView === 'password' ? '4px solid #2196F3' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LockIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography sx={{ fontWeight: 500 }}>
                {accountStatus === 'new-user' ? 'Create Password' : 'Enter Password'}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 3, pb: 3 }}>
            <PasswordForm 
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              loading={loading}
              handleSubmitPassword={handleSubmitPassword}
              accountStatus={accountStatus}
              passwordField={passwordField}
            />
          </AccordionDetails>
        </Accordion>

        <Typography
          variant='caption'
          color='textSecondary'
          align='center'
          sx={{ 
            display: 'block',
            mt: 3,
            mb: 1,
            fontSize: '0.75rem',
            opacity: 0.7
          }}
        >
          By signing in, you agree to the{' '}
          <a
            href='https://pow.co/terms'
            target='_blank'
            rel='noopener noreferrer'
            style={{ color: '#2196F3', textDecoration: 'none' }}
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href='https://babbage.systems/license/'
            target='_blank'
            rel='noopener noreferrer'
            style={{ color: '#2196F3', textDecoration: 'none' }}
          >
            Babbage Software License Agreement
          </a>.
        </Typography>

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
      </Paper>
    </Container>
  )
}

export default Greeter

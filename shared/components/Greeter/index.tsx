import { useContext, useState, useRef, useCallback } from 'react'
import { open } from '@tauri-apps/plugin-shell'
import {
  Typography,
  Button,
  TextField,
  CircularProgress,
  Divider,
  InputAdornment,
  IconButton,
  Paper,
  Box,
  Container,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material'
import {
  SettingsPhone as PhoneIcon,
  PermPhoneMsg as SMSIcon,
  Lock as LockIcon,
  Restore as RestoreIcon,
  Visibility,
  VisibilityOff,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'
import PhoneEntry from '../PhoneEntry'
import AppLogo from '../AppLogo'
import { toast } from 'react-toastify'
import { WalletContext } from '../../contexts/WalletContext'
import { UserContext } from '../../contexts/UserContext'
import PageLoading from '../../components/PageLoading'
import { Utils } from '@bsv/sdk'
import { Link as RouterLink } from 'react-router-dom'
import WalletConfig from '../WalletConfig'

// Define types for props
interface PhoneFormProps {
  phone: string
  setPhone: (phone: string) => void
  loading: boolean
  handleSubmitPhone: (e: React.FormEvent<HTMLFormElement>) => void
  phoneFieldRef: React.RefObject<HTMLInputElement>
}

interface CodeFormProps {
  code: string
  setCode: (code: string) => void
  loading: boolean
  handleSubmitCode: (e: React.FormEvent<HTMLFormElement>) => void
  handleResendCode: () => void
  codeFieldRef: React.RefObject<HTMLInputElement>
}

interface PasswordFormProps {
  password: string
  setPassword: (password: string) => void
  confirmPassword: string
  setConfirmPassword: (password: string) => void
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  loading: boolean
  handleSubmitPassword: (e: React.FormEvent<HTMLFormElement>) => void
  accountStatus: string | undefined
  passwordFieldRef: React.RefObject<HTMLInputElement>
}

interface GreeterProps {
  history: {
    push: (path: string) => void
  }
}

// Helper functions for the Stepper
const viewToStepIndex: { [key: string]: number } = {
  phone: 0,
  code: 1,
  password: 2
}

// Steps for the stepper
const steps = [
  {
    label: 'Phone Number',
    icon: <PhoneIcon />,
    description: 'Enter your phone number for verification'
  },
  {
    label: 'Verification Code',
    icon: <SMSIcon />,
    description: 'Enter the code you received via SMS'
  },
  {
    label: 'Password',
    icon: <LockIcon />,
    description: 'Enter your password'
  }
]

// Phone form component
const PhoneForm: React.FC<PhoneFormProps> = ({
  phone,
  setPhone,
  loading,
  handleSubmitPhone,
  phoneFieldRef
}) => {
  const theme = useTheme()
  return (
    <form onSubmit={handleSubmitPhone}>
      <PhoneEntry
        value={phone}
        onChange={setPhone}
        ref={phoneFieldRef}
        sx={{
          width: '100%',
          mb: 2
        }}
      />
      <Button
        variant="contained"
        type="submit"
        disabled={loading || !phone || phone.length < 10}
        fullWidth
        sx={{
          mt: 2,
          borderRadius: theme.shape.borderRadius,
          textTransform: 'none',
          py: 1.2
        }}
      >
        {loading ? <CircularProgress size={24} /> : 'Continue'}
      </Button>
    </form>
  )
}

// Code verification form component
const CodeForm: React.FC<CodeFormProps> = ({
  code,
  setCode,
  loading,
  handleSubmitCode,
  handleResendCode,
  codeFieldRef
}) => {
  const theme = useTheme()
  return (
    <>
      <form onSubmit={handleSubmitCode}>
        <TextField
          label="6-digit code"
          onChange={e => setCode(e.target.value)}
          variant="outlined"
          fullWidth
          disabled={loading}
          inputRef={codeFieldRef}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {code.length === 6 && <CheckCircleIcon color="success" />}
              </InputAdornment>
            )
          }}
          sx={{
            mb: 2
          }}
        />
        <Button
          variant="contained"
          type="submit"
          disabled={loading || code.length !== 6}
          fullWidth
          sx={{
            mt: 2,
            borderRadius: theme.shape.borderRadius,
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
  )
}

// Password form component
const PasswordForm: React.FC<PasswordFormProps> = ({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  loading,
  handleSubmitPassword,
  accountStatus,
  passwordFieldRef
}) => {
  const theme = useTheme()
  return (
    <form onSubmit={handleSubmitPassword}>
      <TextField
        label="Password"
        onChange={e => setPassword(e.target.value)}
        type={showPassword ? 'text' : 'password'}
        variant="outlined"
        fullWidth
        disabled={loading}
        inputRef={passwordFieldRef}
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
          )
        }}
        sx={{
          mb: 2
        }}
      />

      {accountStatus === 'new-user' && (
        <TextField
          label="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
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
            )
          }}
          sx={{
            mb: 2
          }}
        />
      )}

      <Button
        variant="contained"
        type="submit"
        disabled={
          loading ||
          !password ||
          (accountStatus === 'new-user' && !confirmPassword)
        }
        fullWidth
        sx={{
          borderRadius: theme.shape.borderRadius,
          mt: 2,
          textTransform: 'none',
          py: 1.2
        }}
      >
        {loading ? (
          <CircularProgress size={24} />
        ) : accountStatus === 'new-user' ? (
          'Create Account'
        ) : (
          'Login'
        )}
      </Button>
    </form>
  )
}

// Main Greeter component
const Greeter: React.FC<GreeterProps> = ({ history }) => {
  const { managers, configStatus } = useContext(WalletContext)
  const { appVersion, appName, pageLoaded } = useContext(UserContext)
  const theme = useTheme()

  // State with explicit types
  const [step, setStep] = useState<'phone' | 'code' | 'password'>('phone')
  const [phone, setPhone] = useState<string>('')
  const [code, setCode] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [accountStatus, setAccountStatus] = useState<string | undefined>(
    undefined
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)

  // Refs with proper typing
  const phoneFieldRef = useRef<HTMLInputElement>(null)
  const codeFieldRef = useRef<HTMLInputElement>(null)
  const passwordFieldRef = useRef<HTMLInputElement>(null)

  const walletManager = managers?.walletManager

  // Step 1: The user enters a phone number
  const handleSubmitPhone = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!walletManager) {
        toast.error('Wallet Manager not ready yet.')
        return
      }
      try {
        setLoading(true)
        await walletManager.startAuth({ phoneNumber: phone })
        setStep('code')
        toast.success('A code has been sent to your phone.')
        // Move focus to code field
        if (codeFieldRef.current) {
          codeFieldRef.current.focus()
        }
      } catch (err: any) {
        console.error(err)
        toast.error(err.message || 'Something went wrong, please try again.')
      } finally {
        setLoading(false)
      }
    },
    [walletManager, phone, setStep, setLoading, codeFieldRef]
  )

  // Step 2: The user enters the OTP code
  const handleSubmitCode = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!walletManager) {
        toast.error('Wallet Manager not ready yet.')
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

        setStep('password')
        if (passwordFieldRef.current) {
          passwordFieldRef.current.focus()
        }
      } catch (err: any) {
        console.error(err)
        toast.error(err.message || 'Something went wrong, please try again.')
      } finally {
        setLoading(false)
      }
    },
    [
      walletManager,
      phone,
      code,
      setStep,
      setAccountStatus,
      setLoading,
      passwordFieldRef
    ]
  )

  // Optional "resend code"
  const handleResendCode = useCallback(async () => {
    if (!walletManager) {
      toast.error('Wallet Manager not ready yet.')
      return
    }
    try {
      setLoading(true)
      await walletManager.startAuth({ phoneNumber: phone })
      toast.success('A new code has been sent to your phone.')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Something went wrong, please try again.')
    } finally {
      // Small delay to avoid spam
      await new Promise(resolve => setTimeout(resolve, 2000))
      setLoading(false)
    }
  }, [walletManager, phone, setLoading])

  // Step 3: Provide a password
  const handleSubmitPassword = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!walletManager) {
        toast.error('Wallet Manager not ready yet.')
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
          toast.success('Authenticated successfully!')
          history.push('/dashboard/apps')
        } else {
          throw new Error('Authentication failed, maybe password is incorrect?')
        }
      } catch (err: any) {
        console.error(err)
        toast.error(err.message || 'Something went wrong, please try again.')
      } finally {
        setLoading(false)
      }
    },
    [
      walletManager,
      password,
      confirmPassword,
      accountStatus,
      history,
      setLoading
    ]
  )

  if (!pageLoaded) {
    return <PageLoading />
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: theme.shadows[3]
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4
          }}
        >
          <Box sx={{ mb: 2, width: '100px', height: '100px' }}>
            <AppLogo rotate size="100px" color="#2196F3" />
          </Box>
          <Typography
            variant="h2"
            fontFamily="Helvetica"
            fontSize="2em"
            sx={{
              mb: 1,
              fontWeight: 'bold',
              background:
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(90deg, #FFFFFF 0%, #F5F5F5 100%)'
                  : 'linear-gradient(90deg, #2196F3 0%, #4569E5 100%)',
              backgroundClip: 'text',
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
            Secure BSV Blockchain Wallet
          </Typography>
          <Divider sx={{ width: '80%' }} />
          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
            sx={{ mt: 1 }}
          >
            <i>v{appVersion}</i>
          </Typography>
        </Box>

        <WalletConfig />

        {/* Authentication Stepper */}
        {configStatus === 'configured' && (
          <Stepper activeStep={viewToStepIndex[step]} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  icon={step.icon}
                  optional={
                    <Typography variant="caption" color="text.secondary">
                      {step.description}
                    </Typography>
                  }
                >
                  <Typography variant="body2" fontWeight={500}>
                    {step.label}
                  </Typography>
                </StepLabel>
                <StepContent>
                  {index === 0 && (
                    <PhoneForm
                      phone={phone}
                      setPhone={setPhone}
                      loading={loading}
                      handleSubmitPhone={handleSubmitPhone}
                      phoneFieldRef={phoneFieldRef}
                    />
                  )}

                  {index === 1 && (
                    <CodeForm
                      code={code}
                      setCode={setCode}
                      loading={loading}
                      handleSubmitCode={handleSubmitCode}
                      handleResendCode={handleResendCode}
                      codeFieldRef={codeFieldRef}
                    />
                  )}

                  {index === 2 && (
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
                      passwordFieldRef={passwordFieldRef}
                    />
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <RouterLink to="/recovery" style={{ textDecoration: 'none' }}>
            <Button
              variant="text"
              color="secondary"
              size="small"
              startIcon={<RestoreIcon />}
            >
              Account Recovery
            </Button>
          </RouterLink>
        </Box>

        <Typography
          variant="caption"
          color="textSecondary"
          align="center"
          sx={{
            display: 'block',
            mt: 3,
            mb: 1,
            fontSize: '0.75rem',
            opacity: 0.7
          }}
        >
          By using this software, you acknowledge that you have read, understood
          and accepted the terms of the{' '}
          <a
            href="https://github.com/bitcoin-sv/metanet-desktop/blob/master/LICENSE.txt"
            target="_blank"
            rel="noopener noreferrer"
            onClick={async e => {
              e.preventDefault()
              try {
                await open(
                  'https://github.com/bitcoin-sv/metanet-desktop/blob/master/LICENSE.txt'
                )
              } catch (err: any) {
                console.error('Failed to open license link:', err)
                toast.error('Something went wrong, please try again.')
              }
            }}
            style={{
              color: theme.palette.primary.main,
              textDecoration: 'none'
            }}
          >
            Software License
          </a>
          .
        </Typography>
      </Paper>
    </Container>
  )
}

export default Greeter

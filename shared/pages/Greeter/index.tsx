// shared/pages/Greeter/index.tsx
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import {
  Platform,
  View,
  Text,
  TextInput,
  StyleSheet,
  GestureResponderEvent,
  ScrollView
} from 'react-native'
import { Modal as RNModal } from 'react-native'
import {
  Typography,
  Button as MuiButton,
  TextField,
  CircularProgress,
  Divider,
  InputAdornment,
  IconButton,
  Paper,
  Box,
  Container,
  useTheme,
  Theme,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  Phone as PhoneIcon,
  PermPhoneMsg as SMSIcon,
  Lock as LockIcon,
  VpnKey,
  Visibility,
  VisibilityOff
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useRouter, Link } from 'expo-router'
import * as Linking from 'expo-linking'
import PhoneEntry from 'shared/components/PhoneEntry'
import Button from 'shared/components/Button'
import CodeForm from 'shared/components/CodeForm'
import AppLogo from 'shared/components/AppLogo'
import PageLoading from 'shared/components/PageLoading'
import WalletConfig from 'shared/components/WalletConfig'
import { WalletContext } from 'shared/contexts/WalletContext'
import { UserContext } from 'shared/contexts/UserContext'
import { Utils } from '@bsv/sdk'

// Define styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 40 : 20,
    backgroundColor: '#f5f5f5'
  },
  form: {
    width: '100%',
    maxWidth: 400,
    marginVertical: 20
  },
  label: {
    fontSize: 16,
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    fontSize: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  version: {
    fontSize: 12,
    color: '#999',
    marginTop: 5
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
    maxWidth: 500
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginTop: 5
  }
})

// Helper functions for the Stepper
const viewToStepIndex = {
  config: 0,
  phone: 1,
  code: 2,
  password: 3,
  recovery: 4
}

// Steps for the stepper
const steps = [
  {
    label: 'Configuration',
    icon: <PhoneIcon />,
    description: 'Set up your wallet authentication service'
  },
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
  },
  {
    label: 'Recovery Key',
    icon: <VpnKey />,
    description: 'Save your recovery key'
  }
]

// Define types
interface WalletManager {
  startAuth: (args: { phoneNumber: string }) => Promise<void>
  completeAuth: (payload: any) => Promise<void>
  providePassword: (password: string) => Promise<void>
  authenticated: boolean
  saveSnapshot: () => any
}

interface WalletContextType {
  managers: { walletManager?: WalletManager }
  configStatus: string
  finalizeConfig?: (config: any) => boolean
  setRecoveryKeySaver?: (saver: (key: number[]) => Promise<true>) => void
}

interface UserContextType {
  appVersion: string
  appName: string
  pageLoaded: boolean
}

interface HandleSubmitCodeProps {
  walletManager: WalletManager
  phone: string
  code: string
  setLoading: (loading: boolean) => void
}

interface PhoneFormProps {
  phone: string
  setPhone: (phone: string) => void
  loading: boolean
  handleSubmitPhone: (e: React.FormEvent | GestureResponderEvent) => void
  phoneFieldRef: React.RefObject<any>
}

interface PasswordFormProps {
  password: string
  setPassword: (password: string) => void
  confirmPassword: string
  setConfirmPassword: (password: string) => void
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  loading: boolean
  handleSubmitPassword: (e: React.FormEvent | GestureResponderEvent) => void
  accountStatus: string
  passwordFieldRef: React.RefObject<any>
}

// Phone form component
const PhoneForm: React.FC<PhoneFormProps> = ({
  phone,
  setPhone,
  loading,
  handleSubmitPhone,
  phoneFieldRef
}) => {
  const theme: Theme = useTheme()
  const isBrowserExtension =
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    !navigator.userAgent.includes('Chrome')

  if (isBrowserExtension) {
    return (
      <View style={styles.form}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          ref={phoneFieldRef}
        />
        <Button
          onPress={handleSubmitPhone}
          disabled={loading || !phone || phone.length < 10}
        >
          {loading ? 'Loading...' : 'Continue'}
        </Button>
      </View>
    )
  } else if (Platform.OS !== 'web') {
    return (
      <View style={styles.form}>
        <Text style={styles.label}>Phone Number</Text>
        <PhoneEntry
          value={phone}
          onChange={setPhone}
          ref={phoneFieldRef}
          sx={{ width: '100%', marginBottom: 2 }}
        />
        <Button
          onPress={handleSubmitPhone}
          disabled={loading || !phone || phone.length < 10}
        >
          {loading ? 'Loading...' : 'Continue'}
        </Button>
      </View>
    )
  } else {
    return (
      <form onSubmit={handleSubmitPhone}>
        <PhoneEntry
          value={phone}
          onChange={setPhone}
          ref={phoneFieldRef}
          sx={{ width: '100%', marginBottom: 2 }}
        />
        <MuiButton
          variant="contained"
          type="submit"
          disabled={loading || !phone || phone.length < 10}
          fullWidth
          sx={{
            marginTop: 2,
            borderRadius: theme.shape.borderRadius,
            paddingY: 1.2
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Continue'}
        </MuiButton>
      </form>
    )
  }
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
  const theme: Theme = useTheme()
  const isBrowserExtension =
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    !navigator.userAgent.includes('Chrome')

  if (isBrowserExtension) {
    return (
      <View style={styles.form}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
          ref={passwordFieldRef}
        />
        {accountStatus === 'new-user' && (
          <>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry={!showPassword}
            />
          </>
        )}
        <Button
          onPress={handleSubmitPassword}
          disabled={
            loading ||
            !password ||
            (accountStatus === 'new-user' && !confirmPassword)
          }
        >
          {loading
            ? 'Loading...'
            : accountStatus === 'new-user'
            ? 'Create Account'
            : 'Login'}
        </Button>
        <Button onPress={() => setShowPassword(!showPassword)}>
          {showPassword ? 'Hide Password' : 'Show Password'}
        </Button>
      </View>
    )
  } else if (Platform.OS !== 'web') {
    return (
      <View style={styles.form}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
          ref={passwordFieldRef}
        />
        {accountStatus === 'new-user' && (
          <>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry={!showPassword}
            />
          </>
        )}
        <Button
          onPress={handleSubmitPassword}
          disabled={
            loading ||
            !password ||
            (accountStatus === 'new-user' && !confirmPassword)
          }
        >
          {loading
            ? 'Loading...'
            : accountStatus === 'new-user'
            ? 'Create Account'
            : 'Login'}
        </Button>
        <Button onPress={() => setShowPassword(!showPassword)}>
          {showPassword ? 'Hide Password' : 'Show Password'}
        </Button>
      </View>
    )
  } else {
    return (
      <form onSubmit={handleSubmitPassword}>
        <TextField
          label="Password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
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
          sx={{ marginBottom: 2 }}
        />
        {accountStatus === 'new-user' && (
          <TextField
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmPassword(e.target.value)
            }
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
            sx={{ marginBottom: 2 }}
          />
        )}
        <MuiButton
          variant="contained"
          type="submit"
          disabled={
            loading ||
            !password ||
            (accountStatus === 'new-user' && !confirmPassword)
          }
          fullWidth
          sx={{
            marginTop: 2,
            borderRadius: theme.shape.borderRadius,
            paddingY: 1.2
          }}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : accountStatus === 'new-user' ? (
            'Create Account'
          ) : (
            'Login'
          )}
        </MuiButton>
      </form>
    )
  }
}

// Main Greeter component
const Greeter: React.FC = () => {
  const walletContext = useContext(WalletContext) as WalletContextType
  const userContext = useContext(UserContext) as UserContextType
  if (!userContext) {
    throw new Error('UserContext must be used within a UserContextProvider')
  }
  if (!walletContext) {
    throw new Error('WalletContext must be used within a WalletContextProvider')
  }
  const { appVersion, appName, pageLoaded } = userContext
  const theme: Theme = useTheme()
  const router = useRouter()

  const [step, setStep] = useState<
    'config' | 'phone' | 'code' | 'password' | 'recovery'
  >('config')
  const [phone, setPhone] = useState<string>('')
  const [code, setCode] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [accountStatus, setAccountStatus] = useState<string>('existing-user')
  const [loading, setLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [recoveryKey, setRecoveryKey] = useState<number[] | null>(null)
  const [recoveryModalOpen, setRecoveryModalOpen] = useState<boolean>(false)

  const phoneFieldRef = useRef<any>(null)
  const codeFieldRef = useRef<TextInput>(null)
  const passwordFieldRef = useRef<any>(null)

  const managers = walletContext.managers
  const configStatus = walletContext.configStatus
  const walletManager = managers?.walletManager

  // Validation
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    return phoneRegex.test(phone)
  }

  const validateCode = (code: string): boolean => {
    return code.length === 6 && /^\d+$/.test(code)
  }

  const validatePassword = (password: string): boolean => {
    return password.length >= 6
  }

  const handleSubmitPhone = useCallback(
    async (e: React.FormEvent | GestureResponderEvent) => {
      e.preventDefault()
      if (!validatePhone(phone)) {
        setError('Please enter a valid phone number.')
        toast.error('Please enter a valid phone number.')
        return
      }
      if (!walletManager) {
        setError('Wallet Manager not ready yet.')
        toast.error('Wallet Manager not ready yet.')
        return
      }
      try {
        setLoading(true)
        setError(null)
        await walletManager.startAuth({ phoneNumber: phone })
        setAccountStatus('existing-user') // Mock; replace with walletManager logic
        setStep('code')
        toast.success('A code has been sent to your phone.')
        if (codeFieldRef.current) {
          codeFieldRef.current.focus()
        }
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Failed to send code.')
        toast.error(err.message || 'Failed to send code.')
      } finally {
        setLoading(false)
      }
    },
    [walletManager, phone]
  )

  const handleSubmitCode = useCallback(
    async (
      e: React.FormEvent | GestureResponderEvent,
      { walletManager, phone, code, setLoading }: HandleSubmitCodeProps
    ) => {
      e.preventDefault()
      if (!validateCode(code)) {
        setError('Code must be 6 digits.')
        toast.error('Code must be 6 digits.')
        return
      }
      setLoading(true)
      setError(null)
      try {
        if (!walletManager) {
          throw new Error('Wallet manager is not initialized')
        }
        await walletManager.completeAuth({ phone, code })
        setStep('password')
        toast.success('Code verified successfully!')
      } catch (error: any) {
        setError(error.message || 'Failed to verify code.')
        toast.error(error.message || 'Failed to verify code.')
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const handleResendCode = useCallback(async () => {
    if (!walletManager) {
      setError('Wallet Manager not ready yet.')
      toast.error('Wallet Manager not ready yet.')
      return
    }
    try {
      setLoading(true)
      setError(null)
      await walletManager.startAuth({ phoneNumber: phone })
      toast.success('A new code has been sent to your phone.')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to resend code.')
      toast.error(err.message || 'Failed to resend code.')
    } finally {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setLoading(false)
    }
  }, [walletManager, phone])

  const handleSubmitPassword = useCallback(
    async (e: React.FormEvent | GestureResponderEvent) => {
      e.preventDefault()
      if (!validatePassword(password)) {
        setError('Password must be at least 6 characters.')
        toast.error('Password must be at least 6 characters.')
        return
      }
      if (accountStatus === 'new-user' && password !== confirmPassword) {
        setError("Passwords don't match.")
        toast.error("Passwords don't match.")
        return
      }
      if (!walletManager) {
        setError('Wallet Manager not ready yet.')
        toast.error('Wallet Manager not ready yet.')
        return
      }
      setLoading(true)
      setError(null)
      try {
        await walletManager.providePassword(password)
        if (walletManager.authenticated) {
          if (typeof window !== 'undefined') {
            localStorage.snap = Utils.toBase64(walletManager.saveSnapshot())
          }
          if (accountStatus === 'new-user') {
            setStep('recovery')
          } else {
            toast.success('Authenticated successfully!')
            router.push('/dashboard')
          }
        } else {
          throw new Error('Authentication failed, maybe password is incorrect?')
        }
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Failed to authenticate.')
        toast.error(err.message || 'Failed to authenticate.')
      } finally {
        setLoading(false)
      }
    },
    [walletManager, password, confirmPassword, accountStatus]
  )

  const handleGenerateRecoveryKey = useCallback(() => {
    const key = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 256)
    )
    setRecoveryKey(key)
    setRecoveryModalOpen(true)
  }, [])

  const handleSaveRecoveryKey = useCallback(async () => {
    if (!recoveryKey) {
      setError('No recovery key generated.')
      toast.error('No recovery key generated.')
      return
    }
    try {
      setLoading(true)
      setError(null)
      if (walletContext.setRecoveryKeySaver) {
        walletContext.setRecoveryKeySaver(async (key: number[]) => {
          if (typeof document !== 'undefined') {
            const blob = new Blob([JSON.stringify(key)], {
              type: 'application/json'
            })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'recovery_key.json'
            a.click()
            URL.revokeObjectURL(url)
          }
          return true
        })
      }
      setRecoveryModalOpen(false)
      toast.success('Recovery key saved!')
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to save recovery key.')
      toast.error(err.message || 'Failed to save recovery key.')
    } finally {
      setLoading(false)
    }
  }, [walletContext, recoveryKey])

  useEffect(() => {
    if (pageLoaded && phoneFieldRef.current && step === 'phone') {
      phoneFieldRef.current.focus()
    }
  }, [pageLoaded, step])

  useEffect(() => {
    if (
      walletManager?.authenticated &&
      configStatus === 'configured' &&
      step !== 'recovery'
    ) {
      if (accountStatus !== 'new-user') {
        router.push('/dashboard')
      }
    }
  }, [walletManager, configStatus, accountStatus, step])

  const renderRecoveryModal = () => {
    if (Platform.OS !== 'web') {
      return (
        <RNModal
          visible={recoveryModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setRecoveryModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text
                style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}
              >
                Save Your Recovery Key
              </Text>
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
                This key is essential for recovering your account. Store it
                securely.
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  padding: 10,
                  borderRadius: 5,
                  fontSize: 16,
                  height: 100,
                  textAlignVertical: 'top',
                  marginBottom: 16,
                  width: '100%'
                }}
                value={recoveryKey ? recoveryKey.join(', ') : ''}
                multiline
                numberOfLines={4}
                editable={false}
              />
              {error && <Text style={styles.errorText}>{error}</Text>}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 16
                }}
              >
                <Button
                  variant="outlined"
                  onPress={() => setRecoveryModalOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onPress={handleSaveRecoveryKey}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Save Key'}
                </Button>
              </View>
            </View>
          </View>
        </RNModal>
      )
    } else {
      return (
        <Dialog
          open={recoveryModalOpen}
          onClose={() => setRecoveryModalOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Save Your Recovery Key</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="textSecondary" paragraph>
              This key is essential for recovering your account. Store it
              securely.
            </Typography>
            <TextField
              label="Recovery Key"
              value={recoveryKey ? recoveryKey.join(', ') : ''}
              multiline
              rows={4}
              fullWidth
              margin="normal"
              InputProps={{ readOnly: true }}
            />
            {error && <Typography sx={styles.errorText}>{error}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onPress={() => setRecoveryModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onPress={handleSaveRecoveryKey}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Key'}
            </Button>
          </DialogActions>
        </Dialog>
      )
    }
  }

  if (!pageLoaded) {
    return <PageLoading />
  }

  const isBrowserExtension =
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    !navigator.userAgent.includes('Chrome')

  if (isBrowserExtension) {
    return (
      <View style={styles.container}>
        <AppLogo rotate size={100} />
        <Text style={styles.title}>{appName}</Text>
        <Text style={styles.subtitle}>Secure BSV Blockchain Wallet</Text>
        <Text style={styles.version}>v{appVersion}</Text>
        {configStatus === 'configured' && (
          <>
            {step === 'phone' && (
              <PhoneForm
                phone={phone}
                setPhone={setPhone}
                loading={loading}
                handleSubmitPhone={handleSubmitPhone}
                phoneFieldRef={phoneFieldRef}
              />
            )}
            {step === 'code' && (
              <CodeForm
                code={code}
                setCode={setCode}
                loading={loading}
                handleSubmitCode={e =>
                  handleSubmitCode(e, {
                    walletManager: walletManager!,
                    phone,
                    code,
                    setLoading
                  })
                }
                handleResendCode={handleResendCode}
                codeFieldRef={codeFieldRef}
              />
            )}
            {step === 'password' && (
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
            {step === 'recovery' && (
              <View style={styles.form}>
                <Typography variant="h5" gutterBottom>
                  Secure Your Account
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Generate and save a recovery key to protect your account.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onPress={handleGenerateRecoveryKey}
                  disabled={loading}
                >
                  <VpnKey sx={{ marginRight: 1 }} />
                  Generate Recovery Key
                </Button>
                {error && (
                  <Typography sx={styles.errorText}>{error}</Typography>
                )}
              </View>
            )}
          </>
        )}
        {renderRecoveryModal()}
      </View>
    )
  } else if (Platform.OS !== 'web') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <AppLogo rotate size={100} />
        <Text style={styles.title}>{appName}</Text>
        <Text style={styles.subtitle}>Secure BSV Blockchain Wallet</Text>
        <Text style={styles.version}>v{appVersion}</Text>
        {step === 'config' && <WalletConfig />}
        {configStatus === 'configured' && (
          <>
            {step === 'phone' && (
              <PhoneForm
                phone={phone}
                setPhone={setPhone}
                loading={loading}
                handleSubmitPhone={handleSubmitPhone}
                phoneFieldRef={phoneFieldRef}
              />
            )}
            {step === 'code' && (
              <CodeForm
                code={code}
                setCode={setCode}
                loading={loading}
                handleSubmitCode={e =>
                  handleSubmitCode(e, {
                    walletManager: walletManager!,
                    phone,
                    code,
                    setLoading
                  })
                }
                handleResendCode={handleResendCode}
                codeFieldRef={codeFieldRef}
              />
            )}
            {step === 'password' && (
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
            {step === 'recovery' && (
              <View style={styles.form}>
                <Typography variant="h5" gutterBottom>
                  Secure Your Account
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Generate and save a recovery key to protect your account.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onPress={handleGenerateRecoveryKey}
                  disabled={loading}
                >
                  <VpnKey sx={{ marginRight: 1 }} />
                  Generate Recovery Key
                </Button>
                {error && (
                  <Typography sx={styles.errorText}>{error}</Typography>
                )}
              </View>
            )}
          </>
        )}
        {renderRecoveryModal()}
      </ScrollView>
    )
  } else {
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
            padding: 4,
            borderRadius: 2,
            backgroundColor: 'background.paper',
            boxShadow: theme.shadows[3]
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 4
            }}
          >
            <Box sx={{ marginBottom: 2, width: '100px', height: '100px' }}>
              <AppLogo rotate size="100px" color="#2196F3" />
            </Box>
            <Typography
              variant="h2"
              fontFamily="Helvetica"
              fontSize="2em"
              sx={{
                marginBottom: 1,
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
              sx={{ marginBottom: 3 }}
            >
              Secure BSV Blockchain Wallet
            </Typography>
            <Divider sx={{ width: '80%' }} />
            <Typography
              variant="caption"
              color="text.secondary"
              align="center"
              sx={{ marginTop: 1 }}
            >
              <i>v{appVersion}</i>
            </Typography>
          </Box>

          {step === 'config' && <WalletConfig />}

          {configStatus === 'configured' && (
            <Stepper activeStep={viewToStepIndex[step]} orientation="vertical">
              {steps.map((stepItem, index) => (
                <Step key={stepItem.label}>
                  <StepLabel
                    icon={stepItem.icon}
                    optional={
                      <Typography variant="caption" color="text.secondary">
                        {stepItem.description}
                      </Typography>
                    }
                  >
                    <Typography variant="body2" fontWeight={500}>
                      {stepItem.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    {index === 0 && <WalletConfig />}
                    {index === 1 && (
                      <PhoneForm
                        phone={phone}
                        setPhone={setPhone}
                        loading={loading}
                        handleSubmitPhone={handleSubmitPhone}
                        phoneFieldRef={phoneFieldRef}
                      />
                    )}
                    {index === 2 && (
                      <CodeForm
                        code={code}
                        setCode={setCode}
                        loading={loading}
                        handleSubmitCode={e =>
                          handleSubmitCode(e, {
                            walletManager: walletManager!,
                            phone,
                            code,
                            setLoading
                          })
                        }
                        handleResendCode={handleResendCode}
                        codeFieldRef={codeFieldRef}
                      />
                    )}
                    {index === 3 && (
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
                    {index === 4 && (
                      <Box sx={{ width: '100%', maxWidth: 400 }}>
                        <Typography variant="h5" gutterBottom>
                          Secure Your Account
                        </Typography>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          paragraph
                        >
                          Generate and save a recovery key to protect your
                          account.
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          onPress={handleGenerateRecoveryKey}
                          disabled={loading}
                        >
                          <VpnKey sx={{ marginRight: 1 }} />
                          Generate Recovery Key
                        </Button>
                        {error && (
                          <Typography sx={styles.errorText}>{error}</Typography>
                        )}
                      </Box>
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          )}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 4,
              marginBottom: 2
            }}
          >
            <Link href="/recovery">
              <MuiButton
                variant="text"
                color="secondary"
                sx={{ textTransform: 'none' }}
              >
                Account Recovery
              </MuiButton>
            </Link>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
            sx={{
              display: 'block',
              marginTop: 3,
              marginBottom: 1,
              fontSize: '0.75rem',
              opacity: 0.7
            }}
          >
            By using this software, you acknowledge that you have read,
            understood, and accepted the terms of the{' '}
            <a
              href="https://github.com/bitcoin-sv/metanet-desktop/blob/master/LICENSE.txt"
              onClick={async (e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault()
                await Linking.openURL(
                  'https://github.com/bitcoin-sv/metanet-desktop/blob/master/LICENSE.txt'
                )
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
        {renderRecoveryModal()}
      </Container>
    )
  }
}

export default Greeter

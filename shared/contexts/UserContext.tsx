// shared/contexts/UserContext.tsx
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState
} from 'react'

// Stub focus functions for Expo
const isFocused = async (): Promise<boolean> => {
  return true
}

const onFocusRequested = async (): Promise<void> => {}

const onFocusRelinquished = async (): Promise<void> => {}

const APP_VERSION = '0.3.2' // From react-native-mobile/package.json

interface UserContextProps {
  appVersion?: string
  appName?: string
  children?: React.ReactNode
}

export interface UserContextValue {
  isFocused: () => Promise<boolean>
  onFocusRequested: () => Promise<void>
  onFocusRelinquished: () => Promise<void>
  appVersion: string
  appName: string
  basketAccessModalOpen: boolean
  setBasketAccessModalOpen: Dispatch<SetStateAction<boolean>>
  certificateAccessModalOpen: boolean
  setCertificateAccessModalOpen: Dispatch<SetStateAction<boolean>>
  protocolAccessModalOpen: boolean
  setProtocolAccessModalOpen: Dispatch<SetStateAction<boolean>>
  spendingAuthorizationModalOpen: boolean
  setSpendingAuthorizationModalOpen: Dispatch<SetStateAction<boolean>>
  pageLoaded: boolean
  setPageLoaded: Dispatch<SetStateAction<boolean>>
}

export const UserContext = createContext<UserContextValue | undefined>(
  undefined
)

export const UserContextProvider: React.FC<UserContextProps> = ({
  appVersion = APP_VERSION,
  appName = 'Metanet Desktop',
  children
}) => {
  const [basketAccessModalOpen, setBasketAccessModalOpen] = useState(false)
  const [certificateAccessModalOpen, setCertificateAccessModalOpen] =
    useState(false)
  const [protocolAccessModalOpen, setProtocolAccessModalOpen] = useState(false)
  const [spendingAuthorizationModalOpen, setSpendingAuthorizationModalOpen] =
    useState(false)
  const [pageLoaded, setPageLoaded] = useState(false)

  const userContext = useMemo(
    () => ({
      isFocused,
      onFocusRequested,
      onFocusRelinquished,
      appVersion,
      appName,
      basketAccessModalOpen,
      setBasketAccessModalOpen,
      certificateAccessModalOpen,
      setCertificateAccessModalOpen,
      protocolAccessModalOpen,
      setProtocolAccessModalOpen,
      spendingAuthorizationModalOpen,
      setSpendingAuthorizationModalOpen,
      pageLoaded,
      setPageLoaded
    }),
    [
      appVersion,
      appName,
      basketAccessModalOpen,
      certificateAccessModalOpen,
      protocolAccessModalOpen,
      spendingAuthorizationModalOpen,
      pageLoaded
    ]
  )

  useEffect(() => {
    console.log('setPageLoaded()')
    setPageLoaded(true)
  }, [])

  return (
    <UserContext.Provider value={userContext}>{children}</UserContext.Provider>
  )
}

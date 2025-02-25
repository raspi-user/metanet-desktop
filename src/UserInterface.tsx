import React, { useState, useEffect, createContext, useContext } from 'react'
import {
    Wallet,
    WalletPermissionsManager,
    PrivilegedKeyManager,
    Services,
    StorageClient,
    WalletSigner,
    WalletStorageManager,
    UMPTokenInteractor,
    PermissionEventHandler,
    WalletAuthenticationManager,
    OverlayUMPTokenInteractor,
    WABClient,
    TwilioPhoneInteractor
} from '@cwi/wallet-toolbox-client'
import {
    KeyDeriver,
    LookupResolver,
    PrivateKey,
    SHIPBroadcaster,
    Utils,
    WalletInterface
} from '@bsv/sdk'
import { Switch, Route, useHistory } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { WalletSettingsManager } from '@cwi/wallet-toolbox-client/out/src/WalletSettingsManager'
import { Chain } from '@cwi/wallet-toolbox-client/out/src/sdk'

import PasswordHandler from './components/PasswordHandler'
import RecoveryKeyHandler from './components/RecoveryKeyHandler'
import SpendingAuthorizationHandler from './components/SpendingAuthorizationHandler'
import ProtocolPermissionHandler from './components/ProtocolPermissionHandler'
import CertificateAccessHandler from './components/CertificateAccessHandler'
import BasketAccessHandler from './components/BasketAccessHandler'
import Theme from './components/Theme'
import { ExchangeRateContextProvider } from './components/AmountDisplay/ExchangeRateContextProvider'
import { BreakpointProvider } from './utils/useBreakpoints'
import Greeter from './pages/Greeter'
import Recovery from './pages/Recovery'
import LostPhone from './pages/Recovery/LostPhone'
import LostPassword from './pages/Recovery/LostPassword'
import Dashboard from './pages/Dashboard'
import WalletConfig from './components/WalletConfig'
import { BrowserRouter as Router } from 'react-router-dom'

const STORAGE_URL = 'https://storage.babbage.systems'
const CHAIN = 'main'

const inMemoryInteractor: UMPTokenInteractor = {
    findByPresentationKeyHash: async () => undefined,
    findByRecoveryKeyHash: async () => undefined,
    buildAndSend: async () => 'abcd.0'
}

const queries = {
    xs: '(max-width: 500px)',
    sm: '(max-width: 720px)',
    md: '(max-width: 1024px)',
    or: '(orientation: portrait)'
}

interface ManagerState {
    walletManager?: WalletAuthenticationManager
    permissionsManager?: WalletPermissionsManager
    settingsManager?: WalletSettingsManager
}

export interface WalletContextValue {
    managers: ManagerState
    updateManagers: (newManagers: ManagerState) => void
    isFocused: () => Promise<boolean>
    onFocusRequested: () => Promise<void>
    onFocusRelinquished: () => Promise<void>
    appVersion: string
    appName: string
}

export const WalletContext = createContext<WalletContextValue>({
    managers: {},
    updateManagers: () => { },
    isFocused: async () => false,
    onFocusRequested: async () => { },
    onFocusRelinquished: async () => { },
    appVersion: '0.0.0',
    appName: 'Example Desktop'
})

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
    const [managers, setManagers] = useState<ManagerState>({})

    const updateManagers = (newManagers: ManagerState) => {
        setManagers(newManagers)
    }

    return (
        <WalletContext.Provider
            value={{
                managers,
                updateManagers,
                isFocused: async () => false,
                onFocusRequested: async () => { },
                onFocusRelinquished: async () => { },
                appVersion: '0.0.0',
                appName: 'Example Desktop'
            }}
        >
            {children}
        </WalletContext.Provider>
    )
}

interface UserInterfaceProps {
    onWalletReady: (wallet: WalletInterface) => void
    isFocused?: () => Promise<boolean>
    requestFocus?: () => Promise<void>
    relinquishFocus?: () => Promise<void>
}

// Rendered inside the Router so useHistory is available.
const UserInterfaceContent: React.FC<UserInterfaceProps> = ({
    onWalletReady,
    isFocused,
    requestFocus,
    relinquishFocus
}) => {
    const { managers, updateManagers } = useContext(WalletContext)
    const history = useHistory()

    const [passwordRetriever, setPasswordRetriever] = useState<
        (reason: string, test: (pw: string) => boolean) => Promise<string>
    >()
    const [recoveryKeySaver, setRecoveryKeySaver] = useState<(key: number[]) => Promise<true>>()
    const [spendingAuthorizationCallback, setSpendingAuthorizationCallback] = useState<PermissionEventHandler>(() => { })
    const [basketAccessCallback, setBasketAccessCallback] = useState<PermissionEventHandler>(() => { })
    const [protocolPermissionCallback, setProtocolPermissionCallback] = useState<PermissionEventHandler>(() => { })
    const [certificateAccessCallback, setCertificateAccessCallback] = useState<PermissionEventHandler>(() => { })

    const [wabUrl, setWabUrl] = useState('https://wab.babbage.systems')
    const [wabInfo, setWabInfo] = useState<{
        supportedAuthMethods: string[]
        faucetEnabled: boolean
        faucetAmount: number
    } | null>(null)
    const [selectedAuthMethod, setSelectedAuthMethod] = useState<string>('')
    const [selectedNetwork, setSelectedNetwork] = useState<string>(CHAIN)
    const [selectedStorageUrl, setSelectedStorageUrl] = useState<string>(STORAGE_URL)
    const [configComplete, setConfigComplete] = useState(false)
    const [snapshotLoadFailed, setSnapshotLoadFailed] = useState(false)

    const snapshotExists = !!localStorage.snap

    useEffect(() => {
        if (snapshotExists) setConfigComplete(true)
    }, [snapshotExists])

    useEffect(() => {
        if (!passwordRetriever || !recoveryKeySaver || managers.walletManager) return

        const walletBuilder = async (primaryKey: number[], privilegedKM: PrivilegedKeyManager): Promise<WalletInterface> => {
            const chain = selectedNetwork
            const keyDeriver = new KeyDeriver(new PrivateKey(primaryKey))
            const storageManager = new WalletStorageManager(keyDeriver.identityKey)
            const signer = new WalletSigner(chain as Chain, keyDeriver, storageManager)
            const services = new Services(chain as Chain)
            const wallet = new Wallet(signer, services, undefined, privilegedKM)
            const settingsManager = wallet.settingsManager

            const client = new StorageClient(wallet, selectedStorageUrl)
            await client.makeAvailable()
            await storageManager.addWalletStorageProvider(client)

            const permissionsManager = new WalletPermissionsManager(wallet, 'admin.com', {
                encryptWalletMetadata: false,
                seekPermissionsForPublicKeyRevelation: false,
                seekProtocolPermissionsForSigning: false,
                seekProtocolPermissionsForEncrypting: false,
                seekProtocolPermissionsForHMAC: false,
                seekPermissionsForIdentityKeyRevelation: false,
                seekPermissionsForKeyLinkageRevelation: false
            })
            permissionsManager.bindCallback('onProtocolPermissionRequested', protocolPermissionCallback)
            permissionsManager.bindCallback('onBasketAccessRequested', basketAccessCallback)
            permissionsManager.bindCallback('onSpendingAuthorizationRequested', spendingAuthorizationCallback)
            permissionsManager.bindCallback('onCertificateAccessRequested', certificateAccessCallback)

            updateManagers({
                walletManager: exampleWalletManager,
                permissionsManager,
                settingsManager
            })

            return permissionsManager
        }

        const resolver = new LookupResolver({
            hostOverrides: { 'ls_ship': ['https://users.bapp.dev'], 'ls_users': ['https://users.bapp.dev'] },
            slapTrackers: ['https://users.bapp.dev']
        })

        const exampleWalletManager = new WalletAuthenticationManager(
            'admin.com',
            walletBuilder,
            new OverlayUMPTokenInteractor(
                resolver,
                new SHIPBroadcaster(['tm_users', 'tm_ship'], { resolver })
            ),
            recoveryKeySaver,
            passwordRetriever,
            new WABClient(wabUrl),
            new TwilioPhoneInteractor()
        )

            ; (window as any).authManager = exampleWalletManager

        if (snapshotExists && !snapshotLoadFailed) {
            const snapArr = Utils.toArray(localStorage.snap, 'base64')
            exampleWalletManager.loadSnapshot(snapArr)
                .then(() => {
                    if (exampleWalletManager.authenticated) {
                        onWalletReady(exampleWalletManager)
                        // walletBuilder is invoked during snapshot load, so updateManagers gets called with permissionsManager
                        history.push('/dashboard')
                    }
                })
                .catch(() => {
                    setSnapshotLoadFailed(true)
                    setConfigComplete(false)
                })
        }

        // For new users (no snapshot), do not update managers immediately.
        // Instead, let the authentication flow (triggered via PasswordHandler) call walletBuilder.
    }, [
        passwordRetriever,
        recoveryKeySaver,
        configComplete,
        managers.walletManager,
        wabUrl,
        selectedNetwork,
        selectedStorageUrl,
        snapshotExists,
        snapshotLoadFailed,
        protocolPermissionCallback,
        basketAccessCallback,
        spendingAuthorizationCallback,
        certificateAccessCallback,
        onWalletReady,
        updateManagers,
        history
    ])

    useEffect(() => {
        if (managers.walletManager?.authenticated) {
            history.push('/dashboard')
        }
    }, [managers.walletManager, history])

    const fetchWabInfo = async () => {
        try {
            const res = await fetch(`${wabUrl}/info`)
            if (!res.ok) throw new Error(`Failed to fetch info: ${res.status}`)
            const info = await res.json()
            setWabInfo(info)
        } catch (err: any) {
            alert('Could not fetch WAB info: ' + err.message)
        }
    }

    const onSelectAuthMethod = (method: string) => {
        setSelectedAuthMethod(method)
    }

    // When the user clicks "Finalize Config", ensure prerequisites are met.
    // In this branch, we simply mark configComplete so that the PasswordHandler can continue the authentication flow.
    const finalizeConfig = () => {
        if (!wabInfo || !selectedAuthMethod) {
            alert('Please fetch WAB info and select an Auth Method first.')
            return
        }
        setConfigComplete(true)
    }

    const showConfig = !managers.walletManager || !managers.walletManager.authenticated

    return (
        <>
            <ExchangeRateContextProvider>
                <BreakpointProvider queries={queries}>
                    <Theme>
                        <ToastContainer position='top-center' />
                        <PasswordHandler setPasswordRetriever={setPasswordRetriever} />
                        <RecoveryKeyHandler setRecoveryKeySaver={setRecoveryKeySaver} />
                        <SpendingAuthorizationHandler setSpendingAuthorizationCallback={setSpendingAuthorizationCallback} />
                        <BasketAccessHandler setBasketAccessHandler={setBasketAccessCallback} />
                        <ProtocolPermissionHandler setProtocolPermissionCallback={setProtocolPermissionCallback} />
                        <CertificateAccessHandler setCertificateAccessHandler={setCertificateAccessCallback} />
                        {showConfig && !managers.walletManager?.authenticated && (
                            <WalletConfig
                                noManagerYet={!managers.walletManager}
                                wabUrl={wabUrl}
                                setWabUrl={setWabUrl}
                                fetchWabInfo={fetchWabInfo}
                                wabInfo={wabInfo || undefined}
                                selectedAuthMethod={selectedAuthMethod}
                                onSelectAuthMethod={onSelectAuthMethod}
                                selectedNetwork={selectedNetwork}
                                setSelectedNetwork={setSelectedNetwork}
                                selectedStorageUrl={selectedStorageUrl}
                                setSelectedStorageUrl={setSelectedStorageUrl}
                                finalizeConfig={finalizeConfig}
                            />
                        )}
                        {managers.walletManager && (
                            <Switch>
                                <Route exact path='/' component={Greeter} />
                                <Route exact path='/recovery/lost-phone' component={LostPhone} />
                                <Route exact path='/recovery/lost-password' component={LostPassword} />
                                <Route exact path='/recovery' component={Recovery} />
                                <Route path='/dashboard' component={Dashboard} />
                            </Switch>
                        )}
                    </Theme>
                </BreakpointProvider>
            </ExchangeRateContextProvider>
        </>
    )
}

export const UserInterface: React.FC<UserInterfaceProps> = (props) => {
    return (
        <WalletProvider>
            <Router>
                <UserInterfaceContent {...props} />
            </Router>
        </WalletProvider>
    )
}

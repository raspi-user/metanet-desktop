import React, { useState, useEffect, createContext, useContext } from 'react'
import {
    Wallet,
    WalletPermissionsManager,
    ExampleWalletManager,
    PrivilegedKeyManager,
    Services,
    StorageClient,
    WalletSigner,
    WalletStorageManager,
    UMPTokenInteractor,
    PermissionEventHandler,
} from '@cwi/wallet-toolbox-client'
import {
    KeyDeriver,
    PrivateKey,
    Utils,
    WalletInterface,
} from '@bsv/sdk'
import PasswordHandler from './components/PasswordHandler'
import RecoveryKeyHandler from './components/RecoveryKeyHandler'
import SpendingAuthorizationHandler from './components/SpendingAuthorizationHandler'
import ProtocolPermissionHandler from './components/ProtocolPermissionHandler'
import CertificateAccessHandler from './components/CertificateAccessHandler'
import Theme from './components/Theme'
import { ExchangeRateContextProvider } from './components/AmountDisplay/ExchangeRateContextProvider'
import { WalletSettingsManager } from '@cwi/wallet-toolbox-client/out/src/WalletSettingsManager'
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import BasketAccessHandler from './components/BasketAccessHandler'
import { BreakpointProvider } from './utils/useBreakpoints'

import Greeter from './pages/Greeter'
import Recovery from './pages/Recovery'
import LostPhone from './pages/Recovery/LostPhone'
import LostPassword from './pages/Recovery/LostPassword'
import Dashboard from './pages/Dashboard'

const SECRET_SERVER_URL = 'https://staging-secretserver.babbage.systems'
const STORAGE_URL = 'https://staging-dojo.babbage.systems'
const CHAIN = 'test'

const queries = {
    xs: '(max-width: 500px)',
    sm: '(max-width: 720px)',
    md: '(max-width: 1024px)',
    or: '(orientation: portrait)'
}

// -----
// Context Types
// -----

interface ManagerState {
    walletManager?: ExampleWalletManager;
    permissionsManager?: WalletPermissionsManager;
    settingsManager?: WalletSettingsManager;
}

// We also define the shape of the focus-handling callbacks:
export interface WalletContextValue {
    managers: ManagerState;
    updateManagers: (newManagers: ManagerState) => void;
    // Focus APIs:
    isFocused: () => Promise<boolean>;
    onFocusRequested: () => Promise<void>;
    onFocusRelinquished: () => Promise<void>;
    //
    appVersion: string;
    appName: string;
}

// Provide default no-op or trivial implementations
export const WalletContext = createContext<WalletContextValue>({
    managers: {},
    updateManagers: () => { },
    isFocused: async () => false,
    onFocusRequested: async () => { },
    onFocusRelinquished: async () => { },
    appVersion: '0.0.0',
    appName: 'Example Desktop',
});

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
    const [managers, setManagers] = useState<ManagerState>({});

    const updateManagers = (newManagers: ManagerState) => {
        setManagers(newManagers);
    };

    return (
        <WalletContext.Provider
            value={{
                managers,
                updateManagers,
                isFocused: async () => false,        // If you wanted a fallback...
                onFocusRequested: async () => { },
                onFocusRelinquished: async () => { },
                appVersion: '0.0.0',
                appName: 'Example Desktop'
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

// -----
// Now define the props for the UserInterface component
// -----
interface UserInterfaceProps {
    onWalletReady: (wallet: WalletInterface) => void;
    // Our newly introduced focus-handling props:
    isFocused?: () => Promise<boolean>;
    requestFocus?: () => Promise<void>;
    relinquishFocus?: () => Promise<void>;
}

export const UserInterface: React.FC<UserInterfaceProps> = ({
    onWalletReady,
    isFocused,
    requestFocus,
    relinquishFocus
}) => {
    // Access the context so we can override it with the provided focus fns
    const { managers, updateManagers } = useContext(WalletContext);

    const [passwordRetriever, setPasswordRetriever] = useState<
        (reason: string, test: (passwordCandidate: string) => boolean) => Promise<string>
    >();

    const [recoveryKeySaver, setRecoveryKeySaver] = useState<
        (key: number[]) => Promise<true>
    >();

    const [spendingAuthorizationCallback, setSpendingAuthorizationCallback] =
        useState<PermissionEventHandler>(() => { });

    const [basketAccessCallback, setBasketAccessCallback] =
        useState<PermissionEventHandler>(() => { });

    const [protocolPermissionCallback, setProtocolPermissionCallback] =
        useState<PermissionEventHandler>(() => { });

    const [certificateAccessCallback, setCertificateAccessCallback] =
        useState<PermissionEventHandler>(() => { });

    useEffect(() => {
        if (
            passwordRetriever &&
            recoveryKeySaver &&
            spendingAuthorizationCallback &&
            basketAccessCallback &&
            protocolPermissionCallback &&
            certificateAccessCallback
        ) {
            // Once we have all of these set, we build the wallet:
            const walletBuilder = async (
                primaryKey: number[],
                privilegedKeyManager: PrivilegedKeyManager
            ): Promise<WalletInterface> => {
                const keyDeriver = new KeyDeriver(new PrivateKey(primaryKey))
                const storageManager = new WalletStorageManager(keyDeriver.identityKey)
                const signer = new WalletSigner(CHAIN, keyDeriver, storageManager)
                const services = new Services(CHAIN)
                const wallet = new Wallet(signer, services, undefined, privilegedKeyManager)
                const settingsManager = wallet.settingsManager

                const client = new StorageClient(wallet, STORAGE_URL)
                await client.makeAvailable()
                await storageManager.addWalletStorageProvider(client)

                const permissionsManager = new WalletPermissionsManager(wallet, 'admin.com', {
                    encryptWalletMetadata: false
                })
                permissionsManager.bindCallback('onProtocolPermissionRequested', protocolPermissionCallback)
                permissionsManager.bindCallback('onBasketAccessRequested', basketAccessCallback)
                permissionsManager.bindCallback('onSpendingAuthorizationRequested', spendingAuthorizationCallback)
                permissionsManager.bindCallback('onCertificateAccessRequested', certificateAccessCallback)

                    ; (window as any).permissionsManager = permissionsManager

                updateManagers({
                    walletManager: exampleWalletManager,
                    permissionsManager,
                    settingsManager
                })

                return permissionsManager
            }

            // Dummy in-memory interattor:
            const inMemoryInterattor: UMPTokenInteractor = {
                findByPresentationKeyHash: async () => undefined,
                findByRecoveryKeyHash: async () => undefined,
                buildAndSend: async () => 'abcd.0'
            }

            // Attempt to load a local snapshot
            let snap: number[] | undefined
            if (localStorage.snap) {
                snap = Utils.toArray(localStorage.snap, 'base64')
            }
            // HARDCODE
            snap = Utils.toArray('2dtzh6LfYexvC6//w7qW52td8EQjs0HM8oCxFjwm+vJtdDs0UuvvLw/dguCoTmum+zrAjn/ibZiZSo+PGbQ14Y+5oxyU7hd3b/I95b9yYgEBBKs0/ydffe0wwIxV4ah3T2mz5UIst5RmuLrMXP9jc+k3udmp4REdBAGHDBnbR8nRBXiB1BCXdPwGGHWekDe3KEzpm7HMD1L8cOs0s5z8F+IAU4J0oDbqjCPjCvN87yJiDCEYihEm2JP04/B00aFhDM3yE6hUH6QhNH0GaYrBAA4lWPtWkI8diHp2K1pzTuBV+IEUtiYhBTolWKXduZvzbe67/sfM+NuUQkxX8mZg6gqrgYOVrJhPk6jlsGTRj/gWy2+DYoiCs0FlREPiEQA2B78AFTRfxSQrAZW29wEsBcLAzmZiGSsbF63JH0+QhcoSJYq80pDu6lHtZk+clkBkFrrlqtCXwJNTBAP6e3ZMBuwiAWqeOmxKMWoe5jG6xR4EYSWRkPfVmm3+pwpjYWJ5uyFmyOl6Y9mwhED2mJxwBB69sooIibtNCu5Cqu7MJpwq/PRj14n4W5AcgrxOhXeS7Oc0ojFrILswaofFg/S+yw5pfSPTL/KMbVIHFdHX2i6SFt3YuKf59JA3KgR4vEYUMU0YbqRJG4zHPkDfP8kmjeiJG8WmcWNvkt/Mg/TWOpqDnZxFGYW1qL6isdCiUghUn1Of6nlzsT79C4qFzDcwEdHtDIjftYEBH8kCCQoTNbNJe31HjZ+R9ZrBOPnZoc8olRftr79A4SsHgwXRq+t+cymtSiNk4Ba4XiycwFzM/yTUArGRl5pjgVAsvCUVtgAPci4NOwrOjRDZLN4otGfAefDeJPyb7eHHtsxLqeuVF648bzgrthQKVQFONiDhX1HRMxZwnob+1YsNxdMS4LuBCeytDCKnNDg3iinF7ED0ZwaZt3kOP2OnrgM0XhoMGLqSf78KrG2a/1rsBR2bfOQdGSY+No0lwWqUdyVn0iYmyUxWzmLhJVffBDJmhoCUhz0aX84KyU9wdgWglk1mw3s2BRQyYXSOrzOBlSY1fEoYeoMQe4+Lf7AyEgi2/nQ0OoDArK+uGJyPEqIN8Up4JYMmp0WFPSL5Gndg5xpi7gPs3IIRQtiQwCtSmLVnspG4cXLF8rVQ', 'base64')

            const exampleWalletManager = new ExampleWalletManager(
                'admin.com',
                walletBuilder,
                inMemoryInterattor,
                recoveryKeySaver,
                passwordRetriever,
                SECRET_SERVER_URL,
                snap
            )

            onWalletReady(exampleWalletManager)
            updateManagers({ walletManager: exampleWalletManager })
        }
    }, [
        passwordRetriever,
        recoveryKeySaver,
        spendingAuthorizationCallback,
        basketAccessCallback,
        protocolPermissionCallback,
        certificateAccessCallback
    ])

    // Return your entire UI
    // But override context to include the focus methods if provided:
    return (
        <WalletContext.Provider
            value={{
                managers,
                updateManagers,
                // if caller didn't supply, default to the existing context
                isFocused: isFocused ? isFocused : async () => false,
                onFocusRequested: requestFocus ? requestFocus : async () => { },
                onFocusRelinquished: relinquishFocus ? relinquishFocus : async () => { },
                appVersion: '0.0.0',
                appName: 'Example Desktop'
            }}
        >
            <Router>
                <ExchangeRateContextProvider>
                    <BreakpointProvider queries={queries}>
                        <Theme>
                            <ToastContainer position='top-center' />
                            <PasswordHandler setPasswordRetriever={setPasswordRetriever} />
                            <RecoveryKeyHandler setRecoveryKeySaver={setRecoveryKeySaver} />
                            <SpendingAuthorizationHandler
                                setSpendingAuthorizationCallback={setSpendingAuthorizationCallback}
                            />
                            <BasketAccessHandler
                                setBasketAccessHandler={setBasketAccessCallback}
                            />
                            <ProtocolPermissionHandler
                                setProtocolPermissionCallback={setProtocolPermissionCallback}
                            />
                            <CertificateAccessHandler
                                setCertificateAccessHandler={setCertificateAccessCallback}
                            />

                            {/* Only render the routes after the manager exists */}
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
            </Router>
        </WalletContext.Provider>
    )
}

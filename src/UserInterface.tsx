import React, { useState, useEffect, createContext, useContext } from 'react'
import { Wallet, WalletPermissionsManager, ExampleWalletManager, PrivilegedKeyManager, Services, StorageClient, WalletSigner, WalletStorageManager, UMPTokenInteractor, PermissionEventHandler } from '@cwi/wallet-toolbox-client'
import { KeyDeriver, PrivateKey, Utils, WalletInterface } from '@bsv/sdk'
import { message } from '@tauri-apps/plugin-dialog'
import PasswordHandler from './components/PasswordHandler'
import RecoveryKeyHandler from './components/RecoveryKeyHandler'
import SpendingAuthorizationHandler from './components/SpendingAuthorizationHandler'
import ProtocolPermissionHandler from './components/ProtocolPermissionHandler'
import CertificateAccessHandler from './components/CertificateAccessHandler'
import Theme from './components/Theme'
import { ExchangeRateContextProvider } from './components/AmountDisplay/ExchangeRateContextProvider'
import { WalletSettingsManager } from '@cwi/wallet-toolbox-client/out/src/WalletSettingsManager'
import AmountDisplay from './components/AmountDisplay'
import { MemoryRouter as Router, Switch } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import BasketAccessHandler from './components/BasketAccessHandler'

const SECRET_SERVER_URL = 'https://staging-secretserver.babbage.systems'
const STORAGE_URL = 'https://staging-dojo.babbage.systems'
const CHAIN = 'test'

interface ManagerState {
    walletManager?: ExampleWalletManager;
    permissionsManager?: WalletPermissionsManager;
    settingsManager?: WalletSettingsManager
}

export interface WalletContextValue {
    managers: ManagerState;
    updateManagers: (newManagers: ManagerState) => void;
    onFocusRequested: Function;
    onFocusRelinquished: Function;
    isFocused: Function;
}

export const WalletContext: React.Context<WalletContextValue> = createContext<WalletContextValue>({
    managers: {},
    isFocused: () => { },
    onFocusRelinquished: () => { },
    onFocusRequested: () => { },
    updateManagers: () => { }
});

export const WalletProvider = ({ children }: any) => {
    const [managers, setManagers] = useState<ManagerState>({});

    const updateManagers = (newManagers: ManagerState) => {
        setManagers(newManagers);
    };

    return (
        <WalletContext.Provider
            value={{
                managers,
                updateManagers,
                onFocusRequested: () => { },
                onFocusRelinquished: () => { },
                isFocused: () => { }
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export const UserInterface = ({ onWalletReady }: { onWalletReady: (wallet: WalletInterface) => void }) => {
    const { managers, updateManagers } = useContext(WalletContext);
    const [passwordRetriever, setPasswordRetriever] = useState<(reason: string, test: (passwordCandidate: string) => boolean) => Promise<string>>()
    const [recoveryKeySaver, setRecoveryKeySaver] = useState<(key: number[]) => Promise<true>>()
    const [spendingAuthorizationCallback, setSpendingAuthorizationCallback] = useState<PermissionEventHandler>(() => { })
    const [basketAccessCallback, setBasketAccessCallback] = useState<PermissionEventHandler>(() => { })
    const [protocolPermissionCallback, setProtocolPermissionCallback] = useState<PermissionEventHandler>()
    const [certificateAccessCallback, setCertificateAccessCallback] = useState<PermissionEventHandler>()

    useEffect(() => {
        if (passwordRetriever && recoveryKeySaver && spendingAuthorizationCallback && basketAccessCallback && protocolPermissionCallback && certificateAccessCallback) {
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
                });
                permissionsManager.bindCallback('onProtocolPermissionRequested', protocolPermissionCallback)
                permissionsManager.bindCallback('onBasketAccessRequested', basketAccessCallback)
                permissionsManager.bindCallback('onSpendingAuthorizationRequested', spendingAuthorizationCallback)
                permissionsManager.bindCallback('onCertificateAccessRequested', certificateAccessCallback);
                (window as any).permissionsManager = permissionsManager;
                updateManagers({
                    walletManager: exampleWalletManager,
                    permissionsManager,
                    settingsManager
                })
                return permissionsManager
            }

            const inMemoryInterattor: UMPTokenInteractor = {
                findByPresentationKeyHash: async () => undefined,
                findByRecoveryKeyHash: async () => undefined,
                buildAndSend: async () => 'abcd.0'
            }
            let snap: number[] | undefined
            if (localStorage.snap) {
                snap = Utils.toArray(localStorage.snap, 'base64')
            }
            // HARDCODE SNAPSHOT
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
            updateManagers({
                walletManager: exampleWalletManager
            })
        }
    }, [passwordRetriever, recoveryKeySaver, spendingAuthorizationCallback, basketAccessCallback, protocolPermissionCallback, certificateAccessCallback])

    return (
        <Router>
            <Switch>
                <ExchangeRateContextProvider>
                    <Theme>
                        <ToastContainer position='top-center' />
                        <PasswordHandler setPasswordRetriever={setPasswordRetriever} />
                        <RecoveryKeyHandler setRecoveryKeySaver={setRecoveryKeySaver} />
                        <SpendingAuthorizationHandler setSpendingAuthorizationCallback={setSpendingAuthorizationCallback} />
                        <BasketAccessHandler setBasketAccessHandler={setBasketAccessCallback} />
                        <ProtocolPermissionHandler setProtocolPermissionCallback={setProtocolPermissionCallback} />
                        <CertificateAccessHandler setCertificateAccessHandler={setCertificateAccessCallback} />
                        <h1>test </h1>
                        <AmountDisplay>{37000}</AmountDisplay>
                        {
                            managers.walletManager && (
                                <h1>Authenticated: {String(managers.walletManager.authenticated)} </h1>
                            )}
                        <button onClick={
                            (async () => {
                                await managers.walletManager?.providePresentationKey(Array.from(new Uint8Array(32)));
                                await managers.walletManager?.providePassword('test-pw');
                                const snap = managers.walletManager?.saveSnapshot()!
                                localStorage.snap = Utils.toBase64(snap)
                            })
                        }> Authenticate </button>
                        < button onClick={(async () => {
                            const { publicKey } = await managers.walletManager?.getPublicKey({ identityKey: true, privileged: true, privilegedReason: 'foo is a bar' }, 'test-nonadmin.com')!
                            await message(publicKey)
                        })}> Get privileged identity key </button>
                        < button onClick={(async () => {
                            await managers.walletManager?.createAction({
                                outputs: [{
                                    lockingScript: '016a',
                                    satoshis: 1,
                                    outputDescription: 'test 123'
                                }], description: 'action is a bar'
                            }, 'test-nonadmin.com')!
                        })}> Create 1sat action </button>
                    </Theme>
                </ExchangeRateContextProvider>
            </Switch>
        </Router>
    )
}

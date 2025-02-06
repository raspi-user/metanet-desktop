import React, { useState, useEffect, createContext, useContext } from 'react'
import { Wallet, WalletPermissionsManager, ExampleWalletManager, PrivilegedKeyManager, Services, StorageClient, WalletSigner, WalletStorageManager, UMPTokenInteractor, PermissionEventHandler } from '@cwi/wallet-toolbox-client'
import { KeyDeriver, PrivateKey, WalletInterface } from '@bsv/sdk'
import { message } from '@tauri-apps/plugin-dialog'
import PasswordHandler from './components/PasswordHandler'
import RecoveryKeyHandler from './components/RecoveryKeyHandler'
import SpendingAuthorizationHandler from './components/SpendingAuthorizationHandler'
import Theme from './components/Theme'
import { ExchangeRateContextProvider } from './components/AmountDisplay/ExchangeRateContextProvider'
import { WalletSettingsManager } from '@cwi/wallet-toolbox-client/out/src/WalletSettingsManager'
import AmountDisplay from './components/AmountDisplay'
import { MemoryRouter as Router, Switch } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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
    // const [protocolPermissionCallback, setProtocolPermissionCallback] = useState<PermissionEventHandler>()
    // const [basketAccessCallback, setBasketAccessCallback] = useState<PermissionEventHandler>()
    // const [certificateAccessCallback, setCertificateAccessCallback] = useState<PermissionEventHandler>()

    useEffect(() => {
        if (passwordRetriever && recoveryKeySaver && spendingAuthorizationCallback) {
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
                permissionsManager.bindCallback('onProtocolPermissionRequested', console.log)
                permissionsManager.bindCallback('onBasketAccessRequested', console.log)
                permissionsManager.bindCallback('onSpendingAuthorizationRequested', spendingAuthorizationCallback)
                permissionsManager.bindCallback('onCertificateAccessRequested', console.log);
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
                buildAndSend: async () => ''
            }

            const exampleWalletManager = new ExampleWalletManager(
                'admin.com',
                walletBuilder,
                inMemoryInterattor,
                recoveryKeySaver,
                passwordRetriever,
                SECRET_SERVER_URL,
                undefined // stateSnapshot
            )
            onWalletReady(exampleWalletManager)
            updateManagers({
                walletManager: exampleWalletManager
            })
        }
    }, [passwordRetriever, recoveryKeySaver, spendingAuthorizationCallback])

    return (
        <Router>
            <Switch>
                <ExchangeRateContextProvider>
                    <Theme>
                        <ToastContainer position='top-center' />
                        <PasswordHandler setPasswordRetriever={setPasswordRetriever} />
                        <RecoveryKeyHandler setRecoveryKeySaver={setRecoveryKeySaver} />
                        <SpendingAuthorizationHandler setSpendingAuthorizationCallback={setSpendingAuthorizationCallback} />
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

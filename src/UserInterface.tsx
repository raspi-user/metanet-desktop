import React, { useState, useEffect, createContext, useContext } from 'react'
import { Wallet, WalletPermissionsManager, ExampleWalletManager, PrivilegedKeyManager, Services, StorageClient, WalletSigner, WalletStorageManager, UMPTokenInteractor } from '@cwi/wallet-toolbox-client'
import { KeyDeriver, PrivateKey, Utils, WalletInterface } from '@bsv/sdk'
import { message } from '@tauri-apps/plugin-dialog'
import PasswordHandler from './components/PasswordHandler'
import Theme from './components/Theme'

const SECRET_SERVER_URL = 'https://staging-secretserver.babbage.systems'
const STORAGE_URL = 'https://staging-dojo.babbage.systems'
const CHAIN = 'test'

interface ManagerState {
    walletManager?: ExampleWalletManager;
    permissionsManager?: WalletPermissionsManager;
}

export interface WalletContextValue {
    managers: ManagerState;
    updateManagers: (newManagers: ManagerState) => void;
    onFocusRequested: Function;
    onFocusRelinquished: Function;
    isFocused: boolean;
}

export const WalletContext: React.Context<WalletContextValue> = createContext<WalletContextValue>({
    managers: {},
    isFocused: true,
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
                isFocused: true
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export const UserInterface = ({ onWalletReady }: { onWalletReady: (wallet: WalletInterface) => void }) => {
    const { managers, updateManagers } = useContext(WalletContext);
    const [passwordRetriever, setPasswordRetriever] = useState<(reason: string, test: (passwordCandidate: string) => boolean) => Promise<string>>()

    useEffect(() => {
        if (passwordRetriever) {
            const walletBuilder = async (
                primaryKey: number[],
                privilegedKeyManager: PrivilegedKeyManager
            ): Promise<WalletInterface> => {
                const keyDeriver = new KeyDeriver(new PrivateKey(primaryKey))
                const storageManager = new WalletStorageManager(keyDeriver.identityKey)
                const signer = new WalletSigner(CHAIN, keyDeriver, storageManager)
                const services = new Services(CHAIN)
                const wallet = new Wallet(signer, services, undefined, privilegedKeyManager)
                const client = new StorageClient(wallet, STORAGE_URL)
                await client.makeAvailable()
                await storageManager.addWalletStorageProvider(client)
                const permissionsManager = new WalletPermissionsManager(wallet, 'admin.com', {
                    seekPermissionsForIdentityKeyRevelation: false,
                    seekPermissionsForIdentityResolution: false,
                    seekPermissionsForKeyLinkageRevelation: false,
                    seekPermissionsForPublicKeyRevelation: false,
                    seekBasketInsertionPermissions: false,
                    seekBasketListingPermissions: false
                });
                updateManagers({
                    walletManager: exampleWalletManager,
                    permissionsManager
                })
                return permissionsManager
            }

            const recoveryKeySaver = async (key: number[]): Promise<true> => {
                await message(`SAVE YOUR KEY!!!! ${Utils.toBase64(key)}`)
                return true
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
    }, [passwordRetriever])

    return (
        <Theme>
            <div>
                <PasswordHandler setPasswordRetriever={setPasswordRetriever} />
                <h1>test </h1>
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
                    const { publicKey } = await managers.walletManager?.getPublicKey({ identityKey: true, privileged: true, privilegedReason: 'foo is a bar' })!
                    await message(publicKey)
                })}> Get privileged identity key </button>
            </div>
        </Theme>
    )
}

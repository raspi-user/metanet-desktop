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
    PermissionEventHandler
} from '@cwi/wallet-toolbox-client'
import {
    KeyDeriver,
    PrivateKey,
    Utils,
    WalletInterface
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

/** Defaults from the original file */
const SECRET_SERVER_URL = 'https://staging-secretserver.babbage.systems'
const STORAGE_URL = 'https://staging-dojo.babbage.systems'
const CHAIN = 'test'

/**
 * We might choose to store the "in-memory" fallback interactor for the UMP token logic
 * (if you want to skip on-chain logic in dev). Modify if needed.
 */
const inMemoryInteractor: UMPTokenInteractor = {
    findByPresentationKeyHash: async () => undefined,
    findByRecoveryKeyHash: async () => undefined,
    buildAndSend: async () => 'abcd.0'
};

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
    appVersion: '0.0.    appName: 'Example Desktop'
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
                isFocused: async () => false,
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

/**
 * UI to let user select WAB server, pick an Auth Method, and choose network & storage.
 * Once the user has also provided the password retriever & recovery key saver callbacks,
 * we build the ExampleWalletManager and store it in context.
 */
export const UserInterface: React.FC<UserInterfaceProps> = ({
    onWalletReady,
    isFocused,
    requestFocus,
    relinquishFocus
}) => {
    // Access the context so we can override it with the provided focus fns
    const { managers, updateManagers } = React.useContext(WalletContext);

    // The original code sets up passwordRetriever, etc. for hooking into the manager:
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

    // --------------- New: WAB + network + storage config ---------------

    // Minimal placeholders for a user to configure
    const [wabUrl, setWabUrl] = useState<string>("https://my-wab.example.com");
    const [wabInfo, setWabInfo] = useState<{
        supportedAuthMethods: string[];
        faucetEnabled: boolean;
        faucetAmount: number;
    } | null>(null);

    const [selectedAuthMethod, setSelectedAuthMethod] = useState<string>("");
    const [selectedNetwork, setSelectedNetwork] = useState<string>(CHAIN); // "test" or "main"
    const [selectedStorageUrl, setSelectedStorageUrl] = useState<string>(STORAGE_URL);

    const [configComplete, setConfigComplete] = useState<boolean>(false);

    async function fetchWabInfo() {
        try {
            const res = await fetch(`${wabUrl}/info`);
            if (!res.ok) {
                throw new Error(`Failed to fetch info: ${res.status}`);
            }
            const info = await res.json();
            setWabInfo(info);
        } catch (error: any) {
            console.error("Error fetching WAB info", error);
            alert("Could not fetch WAB info: " + error.message);
        }
    }

    function onSelectAuthMethod(method: string) {
        setSelectedAuthMethod(method);
    }

    // Mark config as complete so the effect that builds the manager can proceed:
    function finalizeConfig() {
        if (!wabInfo || !selectedAuthMethod) {
            alert("Please select an Auth Method from the WAB info first.");
            return;
        }
        setConfigComplete(true);
    }

    // ------------------------------------------------------------------

    /**
     * Once we have all essential building blocks:
     * - passwordRetriever
     * - recoveryKeySaver
     * - user config (WAB + AuthMethod + network + storage)
     *
     * we build an ExampleWalletManager. This is the "heart" of the original code,
     * but updated to handle a dynamic WAB-based approach.
     */
    useEffect(() => {
        if (
            passwordRetriever &&
            recoveryKeySaver &&
            configComplete && // user has chosen WAB, method, etc.
            !managers.walletManager // only build once
        ) {
            // Build the walletBuilder from user-chosen network + storage
            const walletBuilder = async (
                primaryKey: number[],
                privilegedKeyManager: PrivilegedKeyManager
            ): Promise<WalletInterface> => {
                // Example: use the user-chosen network
                const chain = selectedNetwork;

                const keyDeriver = new KeyDeriver(new PrivateKey(primaryKey));
                const storageManager = new WalletStorageManager(keyDeriver.identityKey);
                const signer = new WalletSigner(chain, keyDeriver, storageManager);
                const services = new Services(chain);
                const wallet = new Wallet(signer, services, undefined, privilegedKeyManager);
                const settingsManager = wallet.settingsManager;

                // Use user-chosen storage
                const client = new StorageClient(wallet, selectedStorageUrl);
                await client.makeAvailable();
                await storageManager.addWalletStorageProvider(client);

                // Setup permissions
                const permissionsManager = new WalletPermissionsManager(wallet, 'admin.com', {
                    encryptWalletMetadata: false
                });
                permissionsManager.bindCallback('onProtocolPermissionRequested', protocolPermissionCallback);
                permissionsManager.bindCallback('onBasketAccessRequested', basketAccessCallback);
                permissionsManager.bindCallback('onSpendingAuthorizationRequested', spendingAuthorizationCallback);
                permissionsManager.bindCallback('onCertificateAccessRequested', certificateAccessCallback);

                (window as any).permissionsManager = permissionsManager;

                updateManagers({
                    walletManager: exampleWalletManager,
                    permissionsManager,
                    settingsManager
                });

                return permissionsManager;
            };

            // Here, we'd construct your new manager that uses the WAB. In the original code,
            // we still reference ExampleWalletManager, so let's preserve that naming for drop-in usage:
            const exampleWalletManager = new ExampleWalletManager(
                'admin.com',
                walletBuilder,
                inMemoryInteractor,
                recoveryKeySaver,
                passwordRetriever,
                wabUrl, // replaced SECRET_SERVER_URL with user-chosen WAB (some managers do need server URLs)
                undefined // we can pass no snapshot for now; see below
            );

            // Attempt to load a local snapshot
            if (localStorage.snap) {
                const snapArr = Utils.toArray(localStorage.snap, 'base64');
                try {
                    exampleWalletManager.loadSnapshot(snapArr).then(() => {
                        console.log("Snapshot loaded successfully");
                    }).catch((err) => {
                        console.error("Failed to load snapshot from localStorage", err);
                    });
                }
      }

            // Fire the parent callback
            onWalletReady(exampleWalletManager);

            // Update the context with the new manager
            updateManagers({ walletManager: exampleWalletManager });
        }
    }, [
        passwordRetriever,
        recoveryKeySaver,
        configComplete,
        managers.walletManager,
        wabUrl,
        selectedNetwork,
        selectedStorageUrl,
        selectedAuthMethod,
        onWalletReady,
        updateManagers,
        protocolPermissionCallback,
        basketAccessCallback,
        spendingAuthorizationCallback,
        certificateAccessCallback
    ]);

    // If the manager does not exist yet, we can show a minimal config form:
    const noManagerYet = !managers.walletManager;

    return (
        <WalletContext.Provider
            value={{
                managers,
                updateManagers,
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

                            {/* The original MUI handlers that set up passwordRetriever, etc. */}
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

                            {/* If we haven't created the manager yet, show a config form */}
                            {noManagerYet && (
                                <div style={{ padding: 20, maxWidth: 800, margin: '20px auto' }}>
                                    <h2>Configure Your Wallet</h2>

                                    <div style={{ margin: '10px 0' }}>
                                        <label>WAB Server URL: </label>
                                        <input
                                            type="text"
                                            value={wabUrl}
                                            onChange={(e) => setWabUrl(e.target.value)}
                                            style={{ width: "60%" }}
                                        />
                                        <button onClick={fetchWabInfo}>Fetch Info</button>
                                        {wabInfo && (
                                            <div style={{ marginTop: 10 }}>
                                                <p>Supported Methods: {wabInfo.supportedAuthMethods.join(", ")}</p>
                                                <p>Faucet: {wabInfo.faucetEnabled ? "Enabled" : "Disabled"} (Amount: {wabInfo.faucetAmount})</p>
                                            </div>
                                        )}
                                    </div>

                                    {wabInfo && (
                                        <div style={{ margin: '10px 0' }}>
                                            <label>Choose Auth Method: </label>
                                            <select
                                                value={selectedAuthMethod}
                                                onChange={(e) => onSelectAuthMethod(e.target.value)}
                                            >
                                                <option value="">(Select method)</option>
                                                {wabInfo.supportedAuthMethods.map((m) => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div style={{ margin: '10px 0' }}>
                                        <label>Chain/Network: </label>
                                        <select
                                            value={selectedNetwork}
                                            onChange={(e) => setSelectedNetwork(e.target.value)}
                                        >
                                            <option value="test">Testnet</option>
                                            <option value="main">Mainnet</option>
                                        </select>
                                    </div>

                                    <div style={{ margin: '10px 0' }}>
                                        <label>Storage URL: </label>
                                        <input
                                            type="text"
                                            value={selectedStorageUrl}
                                            onChange={(e) => setSelectedStorageUrl(e.target.value)}
                                            style={{ width: "60%" }}
                                        />
                                    </div>

                                    <button onClick={finalizeConfig}>
                                        Finalize Config & Create Manager
                                    </button>
                                    <hr />
                                    <p>
                                        Once your manager is created, you can proceed to the normal flow (Greeter, etc.).
                                    </p>
                                </div>
                            )}

                            {/* If manager is created, we show the normal routes (like the original code) */}
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

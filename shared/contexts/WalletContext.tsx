import React, { useState, useEffect, createContext, useMemo, useCallback, useContext } from 'react'
import {
    Wallet,
    WalletPermissionsManager,
    PrivilegedKeyManager,
    WalletStorageManager,
    WalletAuthenticationManager,
    OverlayUMPTokenInteractor,
    WalletSigner,
    Services,
    StorageClient,
    TwilioPhoneInteractor,
    WABClient,
    PermissionRequest
} from '@bsv/wallet-toolbox-client'
import {
    KeyDeriver,
    PrivateKey,
    SHIPBroadcaster,
    Utils,
    LookupResolver
} from '@bsv/sdk'
import { DEFAULT_SETTINGS, WalletSettings, WalletSettingsManager } from '@bsv/wallet-toolbox-client/out/src/WalletSettingsManager'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { walletBridgeAsyncListen } from './walletBridgeAsyncListen'
import { DEFAULT_WAB_URL, DEFAULT_STORAGE_URL, DEFAULT_CHAIN, ADMIN_ORIGINATOR } from './config'
import { UserContext } from './UserContext'
import getApps from './pages/Dashboard/Apps/getApps'
import isImageUrl from './utils/isImageUrl'
import parseAppManifest from './utils/parseAppManifest'

// -----
// Context Types
// -----

interface ManagerState {
    walletManager?: WalletAuthenticationManager;
    permissionsManager?: WalletPermissionsManager;
    settingsManager?: WalletSettingsManager;
}

type ConfigStatus = 'editing' | 'configured' | 'initial'

export interface WalletContextValue {
    // Managers:
    managers: ManagerState;
    updateManagers: (newManagers: ManagerState) => void;
    // Settings
    settings: WalletSettings;
    updateSettings: (newSettings: WalletSettings) => Promise<void>;
    network: 'mainnet' | 'testnet';
    // Logout
    logout: () => void;
    adminOriginator: string;
    setPasswordRetriever: (retriever: (reason: string, test: (passwordCandidate: string) => boolean) => Promise<string>) => void
    setRecoveryKeySaver: (saver: (key: number[]) => Promise<true>) => void
    snapshotLoaded: boolean
    basketRequests: BasketAccessRequest[]
    certificateRequests: CertificateAccessRequest[]
    protocolRequests: ProtocolAccessRequest[]
    spendingRequests: SpendingRequest[]
    advanceBasketQueue: () => void
    advanceCertificateQueue: () => void
    advanceProtocolQueue: () => void
    advanceSpendingQueue: () => void
    recentApps: any[]
    finalizeConfig: (wabConfig: WABConfig) => boolean
    setConfigStatus: (status: ConfigStatus) => void
    configStatus: ConfigStatus
}

export const WalletContext = createContext<WalletContextValue>({
    managers: {},
    updateManagers: () => { },
    settings: DEFAULT_SETTINGS,
    updateSettings: async () => { },
    network: 'mainnet',
    logout: () => { },
    adminOriginator: ADMIN_ORIGINATOR,
    setPasswordRetriever: () => { },
    setRecoveryKeySaver: () => { },
    snapshotLoaded: false,
    basketRequests: [],
    certificateRequests: [],
    protocolRequests: [],
    spendingRequests: [],
    advanceBasketQueue: () => { },
    advanceCertificateQueue: () => { },
    advanceProtocolQueue: () => { },
    advanceSpendingQueue: () => { },
    recentApps: [],
    finalizeConfig: () => false,
    setConfigStatus: () => { },
    configStatus: 'initial'
})

type PermissionType = 'identity' | 'protocol' | 'renewal' | 'basket';

type BasketAccessRequest = {
    requestID: string
    basket?: string
    originator: string
    reason?: string
    renewal?: boolean
}

type CertificateAccessRequest = {
    requestID: string
    certificate?: {
        certType?: string
        fields?: Record<string, any>
        verifier?: string
    }
    originator: string
    reason?: string
    renewal?: boolean
}

type ProtocolAccessRequest = {
    requestID: string
    protocolSecurityLevel: number
    protocolID: string
    counterparty?: string
    originator?: string
    description?: string
    renewal?: boolean
    type?: PermissionType
}

type SpendingRequest = {
    requestID: string
    originator: string
    description?: string
    transactionAmount: number
    totalPastSpending: number
    amountPreviouslyAuthorized: number
    authorizationAmount: number
    renewal?: boolean
    lineItems: any[]
}

export interface WABConfig {
    wabUrl: string;
    wabInfo: any;
    method: string;
    network: 'main' | 'test';
    storageUrl: string;
}

interface WalletContextProps {
    children?: React.ReactNode;
}

export const WalletContextProvider: React.FC<WalletContextProps> = ({
    children
}) => {
    const [managers, setManagers] = useState<ManagerState>({});
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [adminOriginator, setAdminOriginator] = useState(ADMIN_ORIGINATOR);
    const [recentApps, setRecentApps] = useState([])

    const { isFocused, onFocusRequested, onFocusRelinquished, setBasketAccessModalOpen, setCertificateAccessModalOpen, setProtocolAccessModalOpen, setSpendingAuthorizationModalOpen } = useContext(UserContext);

    // Track if we were originally focused
    const [wasOriginallyFocused, setWasOriginallyFocused] = useState(false)

    // Separate request queues for basket and certificate access
    const [basketRequests, setBasketRequests] = useState<BasketAccessRequest[]>([])
    const [certificateRequests, setCertificateRequests] = useState<CertificateAccessRequest[]>([])
    const [protocolRequests, setProtocolRequests] = useState<ProtocolAccessRequest[]>([])
    const [spendingRequests, setSpendingRequests] = useState<SpendingRequest[]>([])

    // Pop the first request from the basket queue, close if empty, relinquish focus if needed
    const advanceBasketQueue = () => {
        setBasketRequests(prev => {
            const newQueue = prev.slice(1)
            if (newQueue.length === 0) {
                setBasketAccessModalOpen(false)
                if (!wasOriginallyFocused) {
                    onFocusRelinquished()
                }
            }
            return newQueue
        })
    }

    // Pop the first request from the certificate queue, close if empty, relinquish focus if needed
    const advanceCertificateQueue = () => {
        setCertificateRequests(prev => {
            const newQueue = prev.slice(1)
            if (newQueue.length === 0) {
                setCertificateAccessModalOpen(false)
                if (!wasOriginallyFocused) {
                    onFocusRelinquished()
                }
            }
            return newQueue
        })
    }
    
    // Pop the first request from the protocol queue, close if empty, relinquish focus if needed
    const advanceProtocolQueue = () => {
        setProtocolRequests(prev => {
            const newQueue = prev.slice(1)
            if (newQueue.length === 0) {
                setProtocolAccessModalOpen(false)
                if (!wasOriginallyFocused) {
                    onFocusRelinquished()
                }
            }
            return newQueue
        })
    }

    // Pop the first request from the spending queue, close if empty, relinquish focus if needed
    const advanceSpendingQueue = () => {
        setSpendingRequests(prev => {
            const newQueue = prev.slice(1)
            if (newQueue.length === 0) {
                setSpendingAuthorizationModalOpen(false)
                if (!wasOriginallyFocused) {
                    onFocusRelinquished()
                }
            }
            return newQueue
        })
    }

    const updateSettings = useCallback(async (newSettings: WalletSettings) => {
        if (!managers.settingsManager) {
            throw new Error('The user must be logged in to update settings!')
        }
        await managers.settingsManager.set(newSettings);
        setSettings(newSettings);
    }, [managers.settingsManager]);

    // ---- Callbacks for password/recovery/etc.
    const [passwordRetriever, setPasswordRetriever] = useState<
        (reason: string, test: (passwordCandidate: string) => boolean) => Promise<string>
    >();
    const [recoveryKeySaver, setRecoveryKeySaver] = useState<
        (key: number[]) => Promise<true>
    >();


    // Provide a handler for basket-access requests that enqueues them
    const basketAccessCallback = useCallback((incomingRequest: PermissionRequest & {
        requestID: string
        basket?: string
        originator: string
        reason?: string
        renewal?: boolean
    }) => {
        // Enqueue the new request
        if(incomingRequest?.requestID) {
            setBasketRequests(prev => {
                const wasEmpty = prev.length === 0

                // If no requests were queued, handle focusing logic right away
                if (wasEmpty) {
                    isFocused().then(currentlyFocused => {
                        setWasOriginallyFocused(currentlyFocused)
                        if (!currentlyFocused) {
                            onFocusRequested()
                        }
                        setBasketAccessModalOpen(true)
                    })
                }

                return [
                    ...prev,
                    {
                        requestID: incomingRequest.requestID,
                        basket: incomingRequest.basket,
                        originator: incomingRequest.originator,
                        reason: incomingRequest.reason,
                        renewal: incomingRequest.renewal
                    }
                ]
            })
        }
    }, [isFocused, onFocusRequested])

    // Provide a handler for certificate-access requests that enqueues them
    const certificateAccessCallback = useCallback((incomingRequest: PermissionRequest & {
        requestID: string
        certificate?: {
            certType?: string
            fields?: Record<string, any>
            verifier?: string
        }
        originator: string
        reason?: string
        renewal?: boolean
    }) => {
        // Enqueue the new request
        if(incomingRequest?.requestID) {
            setCertificateRequests(prev => {
                const wasEmpty = prev.length === 0

                // If no requests were queued, handle focusing logic right away
                if (wasEmpty) {
                    isFocused().then(currentlyFocused => {
                        setWasOriginallyFocused(currentlyFocused)
                        if (!currentlyFocused) {
                            onFocusRequested()
                        }
                        setCertificateAccessModalOpen(true)
                    })
                }

                // Extract certificate data, safely handling potentially undefined values
                const certificate = incomingRequest.certificate as any
                const certType = certificate?.certType || ''
                const fields = certificate?.fields || {}

                // Extract field names as an array for the CertificateChip component
                const fieldsArray = fields ? Object.keys(fields) : []

                const verifier = certificate?.verifier || ''

                return [
                    ...prev,
                    {
                        requestID: incomingRequest.requestID,
                        originator: incomingRequest.originator,
                        verifierPublicKey: verifier,
                        certificateType: certType,
                        fieldsArray,
                        description: incomingRequest.reason,
                        renewal: incomingRequest.renewal
                    }
                ]
            })
        }
    }, [isFocused, onFocusRequested])

    // Provide a handler for protocol permission requests that enqueues them
    const protocolPermissionCallback = useCallback((args: PermissionRequest & { requestID: string }): Promise<void> => {
        const {
            requestID,
            counterparty,
            originator,
            reason,
            renewal,
            protocolID
        } = args
        
        if (!requestID || !protocolID) {
            return Promise.resolve()
        }
        
        const [protocolSecurityLevel, protocolNameString] = protocolID
        
        // Determine type of permission
        let permissionType: PermissionType = 'protocol'
        if (protocolNameString === 'identity resolution') {
            permissionType = 'identity'
        } else if (renewal) {
            permissionType = 'renewal'
        } else if (protocolNameString.includes('basket')) {
            permissionType = 'basket'
        }
        
        // Create the new permission request
        const newItem: ProtocolAccessRequest = {
            requestID,
            protocolSecurityLevel,
            protocolID: protocolNameString,
            counterparty,
            originator,
            description: reason,
            renewal,
            type: permissionType
        }
        
        // Enqueue the new request
        return new Promise<void>(resolve => {
            setProtocolRequests(prev => {
                const wasEmpty = prev.length === 0
                
                // If no requests were queued, handle focusing logic right away
                if (wasEmpty) {
                    isFocused().then(currentlyFocused => {
                        setWasOriginallyFocused(currentlyFocused)
                        if (!currentlyFocused) {
                            onFocusRequested()
                        }
                        setProtocolAccessModalOpen(true)
                    })
                }
                
                resolve()
                return [...prev, newItem]
            })
        })
    }, [isFocused, onFocusRequested])

    // Provide a handler for spending authorization requests that enqueues them
    const spendingAuthorizationCallback = useCallback(async (args: PermissionRequest & { requestID: string }): Promise<void> => {
        const {
            requestID,
            originator,
            reason,
            renewal,
            spending
        } = args
        
        if (!requestID || !spending) {
            return Promise.resolve()
        }
        
        let {
            satoshis,
            lineItems
        } = spending
        
        if (!lineItems) {
            lineItems = []
        }

        // TODO: support these
        const transactionAmount = 0
        const totalPastSpending = 0
        const amountPreviouslyAuthorized = 0

        // Create the new permission request
        const newItem: SpendingRequest = {
            requestID,
            originator,
            description: reason,
            transactionAmount,
            totalPastSpending,
            amountPreviouslyAuthorized,
            authorizationAmount: satoshis,
            renewal,
            lineItems
        }
        
        // Enqueue the new request
        return new Promise<void>(resolve => {
            setSpendingRequests(prev => {
                const wasEmpty = prev.length === 0
                
                // If no requests were queued, handle focusing logic right away
                if (wasEmpty) {
                    isFocused().then(currentlyFocused => {
                        setWasOriginallyFocused(currentlyFocused)
                        if (!currentlyFocused) {
                            onFocusRequested()
                        }
                        setSpendingAuthorizationModalOpen(true)
                    })
                }
                
                resolve()
                return [...prev, newItem]
            })
        })
    }, [isFocused, onFocusRequested])

    // ---- WAB + network + storage configuration ----
    const [wabUrl, setWabUrl] = useState<string>(DEFAULT_WAB_URL);
    const [wabInfo, setWabInfo] = useState<{
        supportedAuthMethods: string[];
        faucetEnabled: boolean;
        faucetAmount: number;
    } | null>(null);

    const [selectedAuthMethod, setSelectedAuthMethod] = useState<string>("");
    const [selectedNetwork, setSelectedNetwork] = useState<'main' | 'test'>(DEFAULT_CHAIN); // "test" or "main"
    const [selectedStorageUrl, setSelectedStorageUrl] = useState<string>(DEFAULT_STORAGE_URL);

    // Flag that indicates configuration is complete. For returning users,
    // if a snapshot exists we auto-mark configComplete.
    const [configStatus, setConfigStatus] = useState<ConfigStatus>('initial');
    // Used to trigger a re-render after snapshot load completes.
    const [snapshotLoaded, setSnapshotLoaded] = useState<boolean>(false);

    // Fetch WAB info for first-time configuration
    const fetchWabInfo = useCallback(async () => {
        try {
            const response = await fetch(`${wabUrl}/info`);
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
            }

            const info = await response.json();
            setWabInfo(info);

            // If there's only one auth method, auto-select it
            if (info.supportedAuthMethods && info.supportedAuthMethods.length === 1) {
                setSelectedAuthMethod(info.supportedAuthMethods[0]);
            }
            return info;
        } catch (error: any) {
            console.error("Error fetching WAB info", error);
            toast.error("Could not fetch WAB info: " + error.message);
            return null;
        }
    }, [wabUrl]);

    // Auto-fetch WAB info and apply default configuration when component mounts
    useEffect(() => {
        if (!localStorage.snap && configStatus === 'initial') {
            (async () => {
                try {
                    const info = await fetchWabInfo();
                    
                    if (info && info.supportedAuthMethods && info.supportedAuthMethods.length > 0) {
                        setSelectedAuthMethod(info.supportedAuthMethods[0]);
                        // Automatically apply default configuration
                        setConfigStatus('configured');
                    }
                } catch (error: any) {
                    console.error("Error in initial WAB setup", error);
                }
            })();
        }
    }, [wabUrl, configStatus, fetchWabInfo]);

    // For new users: mark configuration complete when WalletConfig is submitted.
    const finalizeConfig = (wabConfig: WABConfig) => {
        const { wabUrl, wabInfo, method, network, storageUrl } = wabConfig
        try {
            if (!wabUrl) {
                toast.error("WAB Server URL is required");
                return;
            }

            if (!wabInfo || !method) {
                toast.error("Auth Method selection is required");
                return;
            }

            if (!network) {
                toast.error("Network selection is required");
                return;
            }

            if (!storageUrl) {
                toast.error("Storage URL is required");
                return;
            }

            setWabUrl(wabUrl)
            setWabInfo(wabInfo)
            setSelectedAuthMethod(method)
            setSelectedNetwork(network)
            setSelectedStorageUrl(storageUrl)

            // Save the configuration
            toast.success("Configuration applied successfully!");
            setConfigStatus('configured');
            return true
        } catch (error: any) {
            console.error("Error applying configuration:", error);
            toast.error("Failed to apply configuration: " + (error.message || "Unknown error"));
            return false
        }
    }

    // Build wallet function
    const buildWallet = useCallback(async (
        primaryKey: number[],
        privilegedKeyManager: PrivilegedKeyManager
    ): Promise<any> => {
        try {
            const newManagers = {} as any;
            const chain = selectedNetwork;
            const keyDeriver = new KeyDeriver(new PrivateKey(primaryKey));
            const storageManager = new WalletStorageManager(keyDeriver.identityKey);
            const signer = new WalletSigner(chain, keyDeriver, storageManager);
            const services = new Services(chain);
            const wallet = new Wallet(signer, services, undefined, privilegedKeyManager);
            newManagers.settingsManager = wallet.settingsManager;

            // Use user-selected storage provider
            const client = new StorageClient(wallet, selectedStorageUrl);
            await client.makeAvailable();
            await storageManager.addWalletStorageProvider(client);

            // Setup permissions with provided callbacks.
            const permissionsManager = new WalletPermissionsManager(wallet, adminOriginator, {
                seekProtocolPermissionsForSigning: false,
                seekProtocolPermissionsForEncrypting: false,
                seekProtocolPermissionsForHMAC: false,
                seekPermissionsForPublicKeyRevelation: false,
                seekPermissionsForIdentityKeyRevelation: false,
                seekPermissionsForIdentityResolution: false,
            });

            if (protocolPermissionCallback) {
                permissionsManager.bindCallback('onProtocolPermissionRequested', protocolPermissionCallback);
            }
            if (basketAccessCallback) {
                permissionsManager.bindCallback('onBasketAccessRequested', basketAccessCallback);
            }
            if (spendingAuthorizationCallback) {
                permissionsManager.bindCallback('onSpendingAuthorizationRequested', spendingAuthorizationCallback);
            }
            if (certificateAccessCallback) {
                permissionsManager.bindCallback('onCertificateAccessRequested', certificateAccessCallback);
            }

            // Store in window for debugging
            (window as any).permissionsManager = permissionsManager;
            newManagers.permissionsManager = permissionsManager;

            setManagers(m => ({ ...m, ...newManagers }));

            return permissionsManager;
        } catch (error: any) {
            console.error("Error building wallet:", error);
            toast.error("Failed to build wallet: " + error.message);
            return null;
        }
    }, [
        selectedNetwork,
        selectedStorageUrl,
        adminOriginator,
        protocolPermissionCallback,
        basketAccessCallback,
        spendingAuthorizationCallback,
        certificateAccessCallback
    ]);

    // Load snapshot function
    const loadWalletSnapshot = useCallback(async (walletManager: WalletAuthenticationManager) => {
        if (localStorage.snap) {
            try {
                const snapArr = Utils.toArray(localStorage.snap, 'base64');
                await walletManager.loadSnapshot(snapArr);
                // We'll handle setting snapshotLoaded in a separate effect watching authenticated state
            } catch (err: any) {
                console.error("Error loading snapshot", err);
                localStorage.removeItem('snap'); // Clear invalid snapshot
                toast.error("Couldn't load saved data: " + err.message);
            }
        }
    }, []);

    // Watch for wallet authentication after snapshot is loaded
    useEffect(() => {
        if (managers?.walletManager?.authenticated && localStorage.snap) {
            setSnapshotLoaded(true);
        }
    }, [managers?.walletManager?.authenticated]);

    // ---- Build the wallet manager once all required inputs are ready.
    useEffect(() => {
        if (
            passwordRetriever &&
            recoveryKeySaver &&
            configStatus !== 'editing' && // either user configured or snapshot exists
            !managers.walletManager // build only once
        ) {
            try {
                // Create network service based on selected network
                const networkPreset = selectedNetwork === 'main' ? 'mainnet' : 'testnet';

                // Create a LookupResolver instance
                const resolver = new LookupResolver({
                    networkPreset
                });

                // Create a broadcaster with proper network settings
                const broadcaster = new SHIPBroadcaster(['tm_users'], {
                    networkPreset
                });

                // Create a WAB Client with proper URL
                const wabClient = new WABClient(wabUrl);

                // Create a phone interactor
                const phoneInteractor = new TwilioPhoneInteractor();

                // Create the wallet manager with proper error handling
                const walletManager = new WalletAuthenticationManager(
                    adminOriginator,
                    buildWallet,
                    new OverlayUMPTokenInteractor(
                        resolver,
                        broadcaster
                    ),
                    recoveryKeySaver,
                    passwordRetriever,
                    // Type assertions needed due to interface mismatch between our WABClient and the expected SDK client
                    wabClient,
                    phoneInteractor
                );

                // Store in window for debugging
                (window as any).walletManager = walletManager;

                // Set initial managers state to prevent null references
                setManagers(m => ({ ...m, walletManager }));

                // Load snapshot if available
                loadWalletSnapshot(walletManager);

            } catch (err: any) {
                console.error("Error initializing wallet manager:", err);
                toast.error("Failed to initialize wallet: " + err.message);
                // Reset configuration if wallet initialization fails
                setConfigStatus('editing');
            }
        }
    }, [
        passwordRetriever,
        recoveryKeySaver,
        configStatus,
        managers.walletManager,
        selectedNetwork,
        wabUrl,
        buildWallet,
        loadWalletSnapshot,
        adminOriginator
    ]);

    // When Settings manager becomes available, populate the user's settings
    useEffect(() => {
        const loadSettings = async () => {
            if (managers.settingsManager) {
                try {
                    const userSettings = await managers.settingsManager.get();
                    setSettings(userSettings);
                } catch (e) {
                    // Unable to load settings, defaults are already loaded.
                }
            }
        };
        
        loadSettings();
    }, [managers]);

    const logout = useCallback(() => {
        // Clear localStorage to prevent auto-login
        if (localStorage.snap) {
            localStorage.removeItem('snap');
        }

        // Reset manager state
        setManagers({});

        // Reset configuration state
        setConfigStatus('editing');
        setSnapshotLoaded(false);
    }, []);

    useEffect(() => {
        if (managers?.walletManager?.authenticated) {
            const wallet = managers.walletManager;
            let unlistenFn: (() => void) | undefined;
            
            const setupListener = async () => {
                unlistenFn = await walletBridgeAsyncListen(wallet);
            };
            
            setupListener();
            
            return () => {
                if (unlistenFn) {
                    unlistenFn();
                }
            };
        }
    }, [managers]);

    const resolveAppDataFromDomain = async ({ appDomains }) => {
        const dataPromises = appDomains.map(async (domain, index) => {
        let appIconImageUrl
        let appName = domain
        try {
            const url = domain.startsWith('http') ? domain : `https://${domain}/favicon.ico`
            if (await isImageUrl(url)) {
            appIconImageUrl = url
            }
            // Try to parse the app manifest to find the app info
            const manifest = await parseAppManifest({ domain })
            if (manifest && typeof manifest.name === 'string') {
            appName = manifest.name
            }
        } catch (e) {
            console.error(e)
        }

        return { appName, appIconImageUrl, domain }
        })
        return Promise.all(dataPromises)
    }

    useEffect(() => {
        (async () => {
            const storedApps = window.localStorage.getItem('recentApps')
            if (storedApps) {
                setRecentApps(JSON.parse(storedApps))
            }
            // Parse out the app data from the domains
            const appDomains = await getApps({ permissionsManager: managers.permissionsManager, adminOriginator })
            const parsedAppData = await resolveAppDataFromDomain({ appDomains })
            parsedAppData.sort((a, b) => a.appName.localeCompare(b.appName))
            setRecentApps(parsedAppData)

            // store for next app load
            window.localStorage.setItem('recentApps', JSON.stringify(parsedAppData))
        })()
    }, [adminOriginator, managers?.permissionsManager])

    const contextValue = useMemo<WalletContextValue>(() => ({
        managers,
        updateManagers: setManagers,
        settings,
        updateSettings,
        network: selectedNetwork === 'test' ? 'testnet' : 'mainnet',
        logout,
        adminOriginator,
        setPasswordRetriever,
        setRecoveryKeySaver,
        snapshotLoaded,
        basketRequests,
        certificateRequests,
        protocolRequests,
        spendingRequests,
        advanceBasketQueue,
        advanceCertificateQueue,
        advanceProtocolQueue,
        advanceSpendingQueue,
        recentApps,
        finalizeConfig,
        setConfigStatus,
        configStatus
    }), [
        managers,
        settings,
        updateSettings,
        selectedNetwork,
        logout,
        adminOriginator,
        setPasswordRetriever,
        setRecoveryKeySaver,
        snapshotLoaded,
        basketRequests,
        certificateRequests,
        protocolRequests,
        spendingRequests,
        advanceBasketQueue,
        advanceCertificateQueue,
        advanceProtocolQueue,
        advanceSpendingQueue,
        recentApps,
        finalizeConfig,
        setConfigStatus,
        configStatus,
    ]);

    return (
        <WalletContext.Provider value={contextValue}>
            {children}
        </WalletContext.Provider>
    )
}

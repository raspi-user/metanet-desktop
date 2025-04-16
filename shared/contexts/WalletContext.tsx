// shared/contexts/WalletContext.tsx
import React, { createContext, useMemo } from 'react';

export interface WalletContextValue {
  managers: any;
  updateManagers: (newManagers: any) => void;
  settings: any;
  updateSettings: (newSettings: any) => Promise<void>;
  network: 'mainnet' | 'testnet';
  logout: () => void;
  adminOriginator: string;
  setPasswordRetriever: (retriever: any) => void;
  setRecoveryKeySaver: (saver: any) => void;
  snapshotLoaded: boolean;
  basketRequests: any[];
  certificateRequests: any[];
  protocolRequests: any[];
  spendingRequests: any[];
  advanceBasketQueue: () => void;
  advanceCertificateQueue: () => void;
  advanceProtocolQueue: () => void;
  advanceSpendingQueue: () => void;
  recentApps: any[];
  finalizeConfig: (wabConfig: any) => boolean;
  setConfigStatus: (status: any) => void;
  configStatus: any;
}

export const WalletContext = createContext<WalletContextValue | undefined>(undefined);

interface WalletContextProps {
  children?: React.ReactNode;
}

export const WalletContextProvider: React.FC<WalletContextProps> = ({ children }) => {
  const contextValue = useMemo<WalletContextValue>(() => ({
    managers: {},
    updateManagers: () => console.log('Wallet updateManagers disabled'),
    settings: {},
    updateSettings: async () => console.log('Wallet updateSettings disabled'),
    network: 'mainnet',
    logout: () => console.log('Wallet logout disabled'),
    adminOriginator: '',
    setPasswordRetriever: () => console.log('Wallet setPasswordRetriever disabled'),
    setRecoveryKeySaver: () => console.log('Wallet setRecoveryKeySaver disabled'),
    snapshotLoaded: false,
    basketRequests: [],
    certificateRequests: [],
    protocolRequests: [],
    spendingRequests: [],
    advanceBasketQueue: () => console.log('Wallet advanceBasketQueue disabled'),
    advanceCertificateQueue: () => console.log('Wallet advanceCertificateQueue disabled'),
    advanceProtocolQueue: () => console.log('Wallet advanceProtocolQueue disabled'),
    advanceSpendingQueue: () => console.log('Wallet advanceSpendingQueue disabled'),
    recentApps: [],
    finalizeConfig: () => {
      console.log('Wallet finalizeConfig disabled');
      return true;
    },
    setConfigStatus: () => console.log('Wallet setConfigStatus disabled'),
    configStatus: 'configured'
  }), []);

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

import React, { useState, useEffect, createContext, ReactNode, useContext } from 'react'
import { createRoot } from 'react-dom/client'
import { listen, emit } from '@tauri-apps/api/event';
import { Wallet, WalletPermissionsManager, ExampleWalletManager, PrivilegedKeyManager, Services, StorageClient, WalletSigner, WalletStorageManager, UMPTokenInteractor } from '@cwi/wallet-toolbox-client'
import { KeyDeriver, PrivateKey, Utils, WalletInterface } from '@bsv/sdk'
import { message } from '@tauri-apps/plugin-dialog'
import smalltalk from 'smalltalk'

const SECRET_SERVER_URL = 'https://staging-secretserver.babbage.systems'
const STORAGE_URL = 'https://staging-dojo.babbage.systems'
const CHAIN = 'test'

interface ManagerState {
  walletManager?: ExampleWalletManager;
  permissionsManager?: WalletPermissionsManager;
}

interface WalletContextValue {
  managers: ManagerState;
  updateManagers: (newManagers: ManagerState) => void;
}

const WalletContext = createContext<WalletContextValue>({
  managers: {},
  updateManagers: () => { }
});

const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [managers, setManagers] = useState<ManagerState>({});

  const updateManagers = (newManagers: ManagerState) => {
    setManagers(newManagers);
  };

  return (
    <WalletContext.Provider value={{ managers, updateManagers }}>
      {children}
    </WalletContext.Provider>
  );
};

const UserInterface = ({ onWalletReady }: { onWalletReady: (wallet: WalletInterface) => void }) => {
  const { managers, updateManagers } = useContext(WalletContext);

  useEffect(() => {

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
        seekPermissionsForIdentityKeyRevelation: false
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

    const passwordRetriever = async (
      reason: string,
      test: (passwordCandidate: string) => boolean
    ): Promise<string> => {
      return new Promise(async (resolve) => {
        let pw
        while (true) {
          pw = await smalltalk.prompt('Question', `Enter a password because REASON:\n\n${reason}`, '10')
          // pw = window.prompt(`Enter a password because REASON:\n\n${reason}`)
          if (!pw) continue
          if (pw === 'abort') break
          let testResult = test(pw)
          if (testResult) break
          message('wrong pw. Enter "abort" to fail the operation.')
        }
        resolve(pw)
      })
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
  }, [])

  return (
    <div>
      <h1>test</h1>
      {managers.walletManager && (
        <h1>Authenticated: {String(managers.walletManager.authenticated)}</h1>
      )}
      <button onClick={(async () => {
        await managers.walletManager?.providePresentationKey(Array.from(new Uint8Array(32)));
        await managers.walletManager?.providePassword('test-pw');
      })}>Authenticate</button>
      <button onClick={(async () => {
        const { publicKey } = await managers.walletManager?.getPublicKey({ identityKey: true, privileged: true })!
        await message(publicKey)
      })}>Get privileged identity key</button>
    </div>
  )
}

const rootElement = document.getElementById('root')
const root = createRoot(rootElement!)

root.render(
  <React.StrictMode>
    <WalletProvider>
      <UserInterface
        onWalletReady={async (wallet: WalletInterface) => {
          console.log('THE INTERFACE IS UP! WALLET:', wallet);
          (window as any).externallyCallableWallet = wallet; // for debugging / testing

          ////// TODO: MATT AND JACKIE:
          // You are given a WalletInterface as a parameter.
          // Your task is to do the following:

          // Within this function you are already listening for HTTP requests and responses.
          // 
          // A request can come in over HTTP and it would be sent to you by the following code:
          // https://github.com/bitcoin-sv/ts-sdk/blob/master/src/wallet/substrates/HTTPWalletJSON.ts
          // 
          // When an HTTP request comes in, that came from the above-linked code (in that format),
          // call into the Wallet with the parameters provided by the request.
          // Then, wait for the response. If the wallet throws an Error, the HTTP response should be an error.
          // Otherwise, the response should be the return value from the Wallet, in the way that we would expect.
          //
          // Work exclusively within this function to parse out the HTTP requests, call into the Wallet, and get
          // the responses. Then send them back to the person who made the request over HTTP.
          // Currently, all methods will probably return "user is not authenticated" errors, but that is expected.
          // When the UI is finished, this will no longer be the case.

          const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
          // Listen for "http-request" events from the Rust backend.
          await listen('http-request', async (event) => {
            try {
              const req = JSON.parse(event.payload as string);
              console.log("Received HTTP request:");
              console.log("Method:", req.method);
              console.log("Path:", req.path);
              console.log("Headers:", req.headers);
              console.log("Body:", req.body);
              console.log("Request ID:", req.request_id);

              // In a production app you might show a UI to decide on the response.
              // For this demo, we automatically respond with a simple message.
              const response = {
                request_id: req.request_id,
                status: 200,
                body: `Hello from TypeScript! You requested ${req.path}`
              };

              // arbitrary wait time for testing concurrent requests
              await sleep(5000)

              // Emit the response back to Rust.
              emit('ts-response', response);
            } catch (e) {
              console.error("Error handling http-request event:", e);
            }
          });
        }}
      />
    </WalletProvider>
  </React.StrictMode >
);

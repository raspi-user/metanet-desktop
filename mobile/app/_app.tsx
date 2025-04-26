import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { Slot } from 'expo-router';
import { LogBox, YellowBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // Add this
import { UserContextProvider } from 'shared/contexts/UserContext';
import { WalletContextProvider } from 'shared/contexts/WalletContext';
import * as Crypto from 'expo-crypto';
import { Buffer } from 'buffer';
import 'react-native-get-random-values';
import * as CryptoJS from 'crypto-js';

// Suppress warnings (unchanged)
const warningsToIgnore = [
  'props.pointerEvents',
  'Route "./_entry.tsx"',
  'Route "./_app.tsx"',
  'Route "./(tabs)/_layout copy.tsx"',
  '[children]: Too many screens have been defined',
  'shadow',
  'findDOMNode',
  'resizeMode',
];

if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  const originalError = console.error;
  console.warn = (message, ...args) => {
    if (
      typeof message === 'string' &&
      warningsToIgnore.some(w => message.includes(w))
    ) {
      return;
    }
    originalWarn(message, ...args);
  };
  console.error = (message, ...args) => {
    if (
      typeof message === 'string' &&
      warningsToIgnore.some(w => message.includes(w))
    ) {
      return;
    }
    originalError(message, ...args);
  };
} else {
  LogBox.ignoreLogs(warningsToIgnore);
  YellowBox.ignoreWarnings(warningsToIgnore);
}

// Crypto polyfill (unchanged)
declare global {
  interface Crypto {
    randomBytes: (size: number) => Promise<Buffer>;
  }
}

try {
  if (!globalThis.crypto) {
    globalThis.crypto = {
      getRandomValues: <T extends ArrayBufferView>(array: T): T => {
        if (
          array instanceof Int8Array ||
          array instanceof Uint8Array ||
          array instanceof Int16Array ||
          array instanceof Uint16Array ||
          array instanceof Int32Array ||
          array instanceof Uint32Array ||
          array instanceof Uint8ClampedArray
        ) {
          try {
            return Crypto.getRandomValues(array) as T;
          } catch (e) {
            const bytes = CryptoJS.lib.WordArray.random(array.length).toString(
              CryptoJS.enc.Hex
            );
            const buffer = Buffer.from(bytes, 'hex');
            array.set(buffer);
            return array;
          }
        }
        throw new TypeError('Unsupported array type for getRandomValues');
      },
      randomBytes: async size => {
        try {
          return Buffer.from(await Crypto.getRandomBytesAsync(size));
        } catch (e) {
          const bytes = CryptoJS.lib.WordArray.random(size).toString(
            CryptoJS.enc.Hex
          );
          return Buffer.from(bytes, 'hex');
        }
      },
      subtle: {
        decrypt: () => {
          throw new Error('SubtleCrypto.decrypt is not implemented');
        },
        encrypt: () => {
          throw new Error('SubtleCrypto.encrypt is not implemented');
        },
        sign: () => {
          throw new Error('SubtleCrypto.sign is not implemented');
        },
        verify: () => {
          throw new Error('SubtleCrypto.verify is not implemented');
        },
        digest: () => {
          throw new Error('SubtleCrypto.digest is not implemented');
        },
        generateKey: () => {
          throw new Error('SubtleCrypto.generateKey is not implemented');
        },
        deriveKey: () => {
          throw new Error('SubtleCrypto.deriveKey is not implemented');
        },
        deriveBits: () => {
          throw new Error('SubtleCrypto.deriveBits is not implemented');
        },
        importKey: () => {
          throw new Error('SubtleCrypto.importKey is not implemented');
        },
        exportKey: () => {
          throw new Error('SubtleCrypto.exportKey is not implemented');
        },
        wrapKey: () => {
          throw new Error('SubtleCrypto.wrapKey is not implemented');
        },
        unwrapKey: () => {
          throw new Error('SubtleCrypto.unwrapKey is not implemented');
        },
      } as SubtleCrypto,
      randomUUID: () => {
        throw new Error('randomUUID is not implemented');
      },
    };
  }
} catch (error) {
  console.error('Failed to initialize crypto polyfill:', error);
}
globalThis.Buffer = globalThis.Buffer || require('buffer').Buffer;
globalThis.process =
  globalThis.process || ({ env: {}, versions: {} } as NodeJS.Process);

export default function App() {
  useEffect(() => {
    console.log('App mounted');
    globalThis.crypto
      .randomBytes(32)
      .then(bytes => {
        console.log('Random bytes:', bytes.toString('hex'));
      })
      .catch(err => {
        console.error('Crypto error:', err);
      });
    const testArray = new Uint8Array(16);
    globalThis.crypto.getRandomValues(testArray);
    console.log('getRandomValues:', testArray);
    try {
      globalThis.crypto.randomUUID();
    } catch (err) {
      console.log('randomUUID stub:', err.message);
    }
    try {
      globalThis.crypto.subtle.digest('SHA-256', new Uint8Array(16));
    } catch (err) {
      console.log('subtle stub:', err.message);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <UserContextProvider>
        <WalletContextProvider>
          <Slot />
        </WalletContextProvider>
      </UserContextProvider>
    </SafeAreaProvider>
  );
}
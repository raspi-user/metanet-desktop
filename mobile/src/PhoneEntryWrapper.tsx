import React, { Suspense, lazy } from 'react';
import { Platform, View } from 'react-native';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

const cache = createCache({ key: 'mui' });

interface PhoneEntryProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  sx?: any;
}

const LazyPhoneEntry = lazy(() => import('shared/components/PhoneEntry'));
import PhoneEntryWebView from './PhoneEntryWebView';

const PhoneEntryWrapper: React.FC<PhoneEntryProps> = (props) => {
  return (
    <CacheProvider value={cache}>
      {Platform.OS === 'web' ? (
        <Suspense fallback={<View style={{ padding: 16 }}><div>Loading...</div></View>}>
          <LazyPhoneEntry {...props} />
        </Suspense>
      ) : (
        <PhoneEntryWebView {...props} />
      )}
    </CacheProvider>
  );
};

export default PhoneEntryWrapper;
import React, { Suspense, lazy } from 'react';
import { Platform } from 'react-native';

// Define props for PhoneEntry
interface PhoneEntryProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  sx?: any;
}

// Web: Lazy load PhoneEntry
const LazyPhoneEntry = lazy(() => import('shared/components/PhoneEntry'));

// Android: Use WebView (non-lazy)
import PhoneEntryWebView from './PhoneEntryWebView';

const PhoneEntryWrapper: React.FC<PhoneEntryProps> = (props) => {
  if (Platform.OS === 'web') {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <LazyPhoneEntry {...props} />
      </Suspense>
    );
  }
  return <PhoneEntryWebView {...props} />;
};

export default PhoneEntryWrapper;
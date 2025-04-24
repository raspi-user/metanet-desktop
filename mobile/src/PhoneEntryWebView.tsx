import React from 'react';
import { WebView } from 'react-native-webview';
import { Platform } from 'react-native';

interface PhoneEntryProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  sx?: any;
}

const PhoneEntryWebView: React.FC<PhoneEntryProps> = (props) => {
  if (Platform.OS === 'web') {
    // Fallback for web (unlikely to be used due to PhoneEntryWrapper)
    const PhoneEntry = require('shared/components/PhoneEntry').default;
    return <PhoneEntry {...props} />;
  }
  return (
    <WebView
      source={{ uri: 'http://10.0.2.2:3000/phone-entry' }} // Adjust port if needed
      style={{ flex: 1 }}
      onMessage={(event) => {
        const { data } = event.nativeEvent;
        if (data) props.onChange(data);
      }}
    />
  );
};

export default PhoneEntryWebView;
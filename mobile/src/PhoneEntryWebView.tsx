import React, { useState } from 'react';
import { WebView } from 'react-native-webview';
import { Text, View } from 'react-native';

interface PhoneEntryProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  sx?: any;
}

const PhoneEntryWebView: React.FC<PhoneEntryProps> = ({ value, onChange, error, required, disabled }) => {
  const [loading, setLoading] = useState(true);
  const [webViewError, setWebViewError] = useState<string | null>(null);

  const webViewSource = { uri: 'http://10.0.2.2:8084/phone' }; // Adjust for physical device

  const fallbackHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        <script src="https://unpkg.com/@mui/material@5/umd/mui.min.js"></script>
        <script src="https://unpkg.com/@emotion/react@11/umd/emotion-react.min.js"></script>
        <script src="https://unpkg.com/@emotion/cache@11/dist/cache.umd.min.js"></script>
      </head>
      <body>
        <div id="root"></div>
        <script>
          const { CacheProvider } = window.emotionReact;
          const { TextField, Typography } = window.mui;
          const cache = window.emotionCache.createCache({ key: 'mui' });

          function App() {
            const [value, setValue] = React.useState('${value}');
            return (
              <CacheProvider value={cache}>
                <Typography variant="h6">Phone Number</Typography>
                <TextField
                  label="Phone Number"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'change', value: e.target.value }));
                  }}
                  error=${!!error}
                  helperText="${error || ''}"
                  required=${required}
                  disabled=${disabled}
                  fullWidth
                />
              </CacheProvider>
            );
          }

          ReactDOM.render(<App />, document.getElementById('root'));
        </script>
      </body>
    </html>
  `;

  return (
    <View style={{ flex: 1 }}>
      {loading && <Text>Loading WebView...</Text>}
      {webViewError && <Text>Error: {webViewError}</Text>}
      <WebView
        source={webViewSource}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          setWebViewError(nativeEvent.description);
          setLoading(false);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          setWebViewError(`HTTP Error: ${nativeEvent.statusCode}`);
          setLoading(false);
        }}
        onMessage={(event) => {
          try {
            const parsedData = JSON.parse(event.nativeEvent.data);
            if (parsedData.type === 'change') {
              onChange(parsedData.value);
            }
          } catch (e) {
            console.error('WebView message error:', e);
          }
        }}
        onLoadProgress={({ nativeEvent }) => {
          if (nativeEvent.progress === 0 && nativeEvent.loading === false) {
            return { html: fallbackHtml };
          }
        }}
      />
    </View>
  );
};

export default PhoneEntryWebView;
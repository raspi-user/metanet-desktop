import React from 'react';
import { WebView } from 'react-native-webview'; // Add this import

const injectedJavaScript = `
    window.addEventListener('load', () => {
        console.log('WebView: Page loaded');
        window.ReactNativeWebView.postMessage('WebView: Page loaded');
        setTimeout(() => {
            document.body.style.display = 'none';
            setTimeout(() => {
                document.body.style.display = 'block';
            }, 0);
        }, 1000);
    });
    setTimeout(() => {
        console.log('WebView: DOM after 2s: Elements present');
        window.ReactNativeWebView.postMessage('WebView: DOM after 2s: Elements present');
    }, 2000);
`;

const PhoneEntryWebView = () => {
    return (
        <WebView
            source={{ uri: 'file:///android_asset/index.html' }}
            style={{ flex: 1 }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowUniversalAccessFromFileURLs={true}
            allowFileAccess={true}
            mixedContentMode="always"
            injectedJavaScript={injectedJavaScript}
            onMessage={(event) => {
                console.log('WebView received message:', event.nativeEvent.data);
                if (event.nativeEvent.data === 'WebView: Page loaded') {
                    console.log('WebView: Confirmed page loaded');
                }
                if (event.nativeEvent.data === 'WebView: React is NOT loaded') {
                    console.log('WebView: React is NOT loaded');
                }
            }}
        />
    );
};

export default PhoneEntryWebView;
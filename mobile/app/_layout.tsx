import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserContextProvider } from 'shared/contexts/UserContext';

export default function RootLayout() {
  return (
    <UserContextProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="recovery" options={{ title: 'Recovery' }} />
        </Stack>
      </SafeAreaView>
    </UserContextProvider>
  );
}
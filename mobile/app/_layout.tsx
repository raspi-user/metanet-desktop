import React from 'react';
import { Stack } from 'expo-router';
import { UserContextProvider } from 'shared/contexts/UserContext';

export default function RootLayout() {
  return (
    <UserContextProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="recovery" options={{ title: 'Recovery' }} />
      </Stack>
    </UserContextProvider>
  );
}
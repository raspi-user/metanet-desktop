import React from 'react';
import { Stack } from 'expo-router';
import { UserContextProvider } from 'shared/contexts/UserContext';

export default function RootLayout() {
  return (
    <UserContextProvider>
      <Stack />
    </UserContextProvider>
  );
}

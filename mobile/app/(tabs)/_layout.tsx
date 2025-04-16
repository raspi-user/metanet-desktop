import React from 'react';
import { Tabs } from 'expo-router';
import { UserContextProvider } from 'shared/contexts/UserContext';

export default function Layout() {
  return (
    <UserContextProvider>
      <Tabs>
        <Tabs.Screen name="phone" options={{ title: 'Phone Entry' }} />
        <Tabs.Screen name="index" options={{ title: 'Welcome' }} />
        <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      </Tabs>
    </UserContextProvider>
  );
}

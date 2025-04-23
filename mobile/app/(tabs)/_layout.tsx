import React from 'react';
import { Tabs } from 'expo-router';
import { UserContextProvider } from 'shared/contexts/UserContext';
import { Platform } from 'react-native';

export default function Layout() {
  return (
    <UserContextProvider>
      <Tabs
        screenOptions={{
          headerStyle: {
            // Override default header shadow styles
            ...(Platform.OS === 'web'
              ? { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }
              : Platform.OS === 'android'
              ? { elevation: 4 }
              : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }),
          },
          headerBackgroundContainerStyle: {
            // Override header background shadow styles
            ...(Platform.OS === 'web'
              ? { boxShadow: 'none' }
              : Platform.OS === 'android'
              ? { elevation: 0 }
              : { shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0 }),
          },
          tabBarStyle: {
            // Ensure tab bar is also shadow-free
            ...(Platform.OS === 'web'
              ? { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }
              : Platform.OS === 'android'
              ? { elevation: 4 }
              : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }),
          },
        }}
      >
        <Tabs.Screen name="phone" options={{ title: 'Phone Entry' }} />
        <Tabs.Screen name="index" options={{ title: 'Welcome' }} />
        <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      </Tabs>
    </UserContextProvider>
  );
}

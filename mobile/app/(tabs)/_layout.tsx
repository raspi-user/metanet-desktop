import React from 'react';
import { Platform } from 'react-native';
import { UserContextProvider } from 'shared/contexts/UserContext';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import PhonePage from './phone';
import GreeterPage from './index';
import Dashboard from './dashboard';

const Drawer = createDrawerNavigator();

export default function Layout() {
  return (
    <UserContextProvider>
      <NavigationContainer independent={true}>
        <Drawer.Navigator
          screenOptions={{
            headerStyle: {
              ...(Platform.OS === 'web'
                ? { boxShadow: 'none' }
                : Platform.OS === 'android'
                ? { elevation: 0 }
                : { shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0 }),
            },
            headerBackgroundContainerStyle: {
              ...(Platform.OS === 'web'
                ? { boxShadow: 'none' }
                : Platform.OS === 'android'
                ? { elevation: 0 }
                : { shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0 }),
            },
            drawerStyle: {
              backgroundColor: '#fff',
              width: 250,
            },
          }}
        >
          <Drawer.Screen
            name="phone"
            component={PhonePage}
            options={{ title: 'Phone Entry' }}
          />
          <Drawer.Screen
            name="index"
            component={GreeterPage}
            options={{ title: 'Welcome' }}
          />
          <Drawer.Screen
            name="dashboard"
            component={Dashboard}
            options={{ title: 'Dashboard' }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </UserContextProvider>
  );
}
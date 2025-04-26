import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer independent={true}>
          <Drawer.Navigator
            screenOptions={{
              headerStyle: { boxShadow: 'none', elevation: 0, shadowOpacity: 0 },
              headerBackgroundContainerStyle: { boxShadow: 'none', elevation: 0, shadowOpacity: 0 },
              drawerStyle: { backgroundColor: '#fff', width: 250 },
            }}
          >
            <Drawer.Screen name="phone" component={PhonePage} options={{ title: 'Phone Entry' }} />
            <Drawer.Screen name="index" component={GreeterPage} options={{ title: 'Welcome' }} />
            <Drawer.Screen name="dashboard" component={Dashboard} options={{ title: 'Dashboard' }} />
          </Drawer.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </UserContextProvider>
  );
}
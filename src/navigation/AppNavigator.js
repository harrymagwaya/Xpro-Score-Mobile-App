import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import { linking } from '../config/linking';
import { useAuth } from '../context/AuthContext';
import ScreenLoader from '../components/ScreenLoader';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import UnitScreen from '../screens/UnitScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function TenantTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 12,
          height: 72,
          borderRadius: 24,
          backgroundColor: '#0B1220',
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#8FA3BF'
      }}
    >
      {['Home', 'Payments', 'Unit', 'Profile'].map((name) => (
        <Tabs.Screen
          key={name}
          name={name}
          component={{ Home: HomeScreen, Payments: PaymentsScreen, Unit: UnitScreen, Profile: ProfileScreen }[name]}
          options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontWeight: '800' }}>{name.slice(0, 1)}</Text> }}
        />
      ))}
    </Tabs.Navigator>
  );
}

export default function AppNavigator() {
  const { booting, isAuthenticated } = useAuth();

  if (booting) return <ScreenLoader label="Restoring your tenant session..." />;

  return (
    <NavigationContainer linking={linking} theme={{ colors: { background: colors.canvas, card: '#fff', text: colors.text, border: colors.line, primary: colors.primary, notification: colors.danger } }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="TenantTabs" component={TenantTabs} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

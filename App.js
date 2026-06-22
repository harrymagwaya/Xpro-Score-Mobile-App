import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider } from './src/theme/ThemeProvider';
import AppSplashScreen from './src/components/AppSplashScreen';
import { ToastProvider } from './src/components/ToastProvider';
import { AuthProvider } from './src/context/AuthContext';
import { NetworkProvider } from './src/context/NetworkContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ToastProvider>
            <NetworkProvider>
              <AuthProvider>
                <AppSplashScreen>
                  <StatusBar style="light" />
                  <AppNavigator />
                </AppSplashScreen>
              </AuthProvider>
            </NetworkProvider>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

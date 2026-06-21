import React, { createContext, useContext, useMemo } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';

const NetworkContext = createContext(null);

export function NetworkProvider({ children }) {
  const netInfo = useNetInfo();
  const value = useMemo(
    () => ({
      isConnected: netInfo.isConnected !== false,
      isInternetReachable: netInfo.isInternetReachable !== false,
      details: netInfo.details
    }),
    [netInfo.details, netInfo.isConnected, netInfo.isInternetReachable]
  );

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  return useContext(NetworkContext);
}

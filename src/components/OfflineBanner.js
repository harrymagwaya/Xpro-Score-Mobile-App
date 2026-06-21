import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useNetwork } from '../context/NetworkContext';
import { colors } from '../theme/colors';

export default function OfflineBanner() {
  const { isConnected, isInternetReachable } = useNetwork();
  if (isConnected && isInternetReachable) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>You are offline. Recent data stays visible, but new requests may fail.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.warning,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center'
  }
});

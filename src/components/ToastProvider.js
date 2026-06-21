import React, { createContext, useContext, useMemo, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const show = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  const value = useMemo(() => ({ show }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View style={[styles.toast, { backgroundColor: palette[toast.type] || palette.info }]}>
          <Text style={styles.text}>{toast.message}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const palette = {
  error: colors.danger,
  success: colors.success,
  warning: colors.warning,
  info: colors.primaryDeep
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 54,
    left: 16,
    right: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 8
  },
  text: {
    color: '#fff',
    fontWeight: '700'
  }
});

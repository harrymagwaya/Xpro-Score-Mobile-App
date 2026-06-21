import React, { createContext, useContext, useMemo } from 'react';
import { colors } from './colors';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const value = useMemo(() => ({ colors }), []);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

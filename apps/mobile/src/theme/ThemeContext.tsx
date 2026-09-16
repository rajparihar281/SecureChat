import React, { createContext, useContext, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { ColorPalette, darkPalette, lightPalette } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface Theme {
  colors: ColorPalette;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const defaultTheme: Theme = {
  colors: darkPalette,
  typography,
  spacing,
  borderRadius,
  isDark: true,
  mode: 'dark',
  setMode: () => {},
};

export const ThemeContext = createContext<Theme>(defaultTheme);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('dark'); // Dark mode first design

  const isDark = mode === 'system' ? systemScheme !== 'light' : mode === 'dark';
  const colors = isDark ? darkPalette : lightPalette;

  const value = useMemo(
    () => ({
      colors,
      typography,
      spacing,
      borderRadius,
      isDark,
      mode,
      setMode,
    }),
    [colors, isDark, mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

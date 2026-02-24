import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';

const STORAGE_KEYS = {
  mode: 'mqs_theme_mode',
  primaryColor: 'mqs_primary_color',
  sidebarCollapsed: 'mqs_sidebar_collapsed',
} as const;

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  primaryColor: string;
  sidebarCollapsed: boolean;
  setMode: (mode: ThemeMode) => void;
  setPrimaryColor: (color: string) => void;
  toggleSidebar: () => void;
  toggleMode: () => void;
}

const defaultPrimary = '#3e4a21';

const ThemeContext = createContext<ThemeContextValue | null>(null);

function loadStored<T>(key: string, fallback: T, parse: (s: string) => T): T {
  try {
    const s = localStorage.getItem(key);
    if (s != null) return parse(s);
  } catch (_) { }
  return fallback;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() =>
    loadStored(STORAGE_KEYS.mode, 'light', (s) => (s === 'dark' ? 'dark' : 'light'))
  );
  const [primaryColor, setPrimaryColorState] = useState<string>(() =>
    loadStored(STORAGE_KEYS.primaryColor, defaultPrimary, (s) => s || defaultPrimary)
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() =>
    loadStored(STORAGE_KEYS.sidebarCollapsed, false, (s) => s === 'true')
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.mode, mode);
  }, [mode]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.primaryColor, primaryColor);
  }, [primaryColor]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.sidebarCollapsed, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const setMode = useCallback((m: ThemeMode) => setModeState(m), []);
  const setPrimaryColor = useCallback((c: string) => setPrimaryColorState(c || defaultPrimary), []);
  const toggleSidebar = useCallback(() => setSidebarCollapsed((p) => !p), []);
  const toggleMode = useCallback(() => setModeState((p) => (p === 'light' ? 'dark' : 'light')), []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      primaryColor,
      sidebarCollapsed,
      setMode,
      setPrimaryColor,
      toggleSidebar,
      toggleMode,
    }),
    [mode, primaryColor, sidebarCollapsed, setMode, setPrimaryColor, toggleSidebar, toggleMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export const PRESET_COLORS = [
  '#3e4a21',
  '#1565c0',
  '#2e7d32',
  '#c62828',
  '#6a1b9a',
  '#ef6c00',
  '#00838f',
] as const;

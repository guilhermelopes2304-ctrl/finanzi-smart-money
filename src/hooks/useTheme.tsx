import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "finanzzi-theme";

interface ThemeState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const LIGHT_THEME: Theme = "light";

const ThemeContext = createContext<ThemeState>({
  theme: LIGHT_THEME,
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(LIGHT_THEME);

  useEffect(() => {
    // A direção visual atual é clara em toda a experiência principal.
    localStorage.setItem(STORAGE_KEY, LIGHT_THEME);
    setThemeState(LIGHT_THEME);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }, [theme]);

  const setTheme = useCallback((_next: Theme) => {
    localStorage.setItem(STORAGE_KEY, LIGHT_THEME);
    setThemeState(LIGHT_THEME);
  }, []);

  const toggleTheme = useCallback(() => {
    // Mantém a assinatura pública do contexto sem criar uma segunda identidade visual.
    localStorage.setItem(STORAGE_KEY, LIGHT_THEME);
    setThemeState(LIGHT_THEME);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

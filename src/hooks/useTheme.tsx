import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "finanzzi-theme";

interface ThemeState {
  theme: "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function getInitialTheme(): "dark" {
  return "dark";
}

const ThemeContext = createContext<ThemeState>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

function applyTheme() {
  const root = document.documentElement;
  root.classList.add("dark");
  root.style.colorScheme = "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<"dark">(getInitialTheme);

  useEffect(() => {
    applyTheme();
    localStorage.setItem(STORAGE_KEY, "dark");
  }, [theme]);

  const setTheme = useCallback((_next: Theme) => {
    setThemeState("dark");
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState("dark");
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

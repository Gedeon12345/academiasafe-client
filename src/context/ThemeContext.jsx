import { createContext, useContext, useEffect, useState } from 'react';

const Ctx = createContext({ dark: false, toggle: () => {} });
export const useTheme = () => useContext(Ctx);

// Thème clair ou sombre : suit le réglage de l'appareil tant que l'utilisateur n'a pas choisi.
export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); }, [dark]);
  const toggle = () => setDark((d) => { localStorage.setItem('as_theme', d ? 'light' : 'dark'); return !d; });
  return <Ctx.Provider value={{ dark, toggle }}>{children}</Ctx.Provider>;
}

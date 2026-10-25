import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button onClick={toggle} aria-label={dark ? 'Passer au thème clair' : 'Passer au thème sombre'} title={dark ? 'Thème clair' : 'Thème sombre'}
      className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-slate-100">
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

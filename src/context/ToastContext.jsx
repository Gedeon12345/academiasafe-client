import { createContext, useCallback, useContext, useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';

const Ctx = createContext(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, type = 'success') => {
    const id = Math.random();
    setItems((l) => [...l, { id, message, type }]);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 4500);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-16 z-[60] flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div key={t.id} role="status" className="pointer-events-auto flex max-w-md animate-pop items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white shadow-lg">
            {t.type === 'error' ? <AlertCircle size={18} className="flex-none text-red-300" /> : <Check size={18} className="flex-none text-emerald-300" />}
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

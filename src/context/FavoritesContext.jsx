import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const Ctx = createContext({ isFavorite: () => false, toggle: async () => {}, count: 0, loaded: false });
export const useFavorites = () => useContext(Ctx);

// Favoris : liste personnelle de l'étudiant (différente des « j'aime » publics).
export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setIds(new Set()); setLoaded(false);
    if (user?.role !== 'student') return;
    api.get('/favorites/ids').then((d) => { setIds(new Set(d.ids)); setLoaded(true); }).catch(() => {});
  }, [user?._id, user?.role]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = async (id) => {
    const has = ids.has(id);
    if (has) await api.del(`/favorites/${id}`); else await api.post(`/favorites/${id}`);
    setIds((s) => { const n = new Set(s); has ? n.delete(id) : n.add(id); return n; });
    return !has;
  };
  return <Ctx.Provider value={{ isFavorite: (id) => ids.has(id), toggle, count: ids.size, loaded }}>{children}</Ctx.Provider>;
}

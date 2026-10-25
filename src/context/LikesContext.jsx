import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const Ctx = createContext({ isLiked: () => false, toggle: async () => ({}) });
export const useLikes = () => useContext(Ctx);

export function LikesProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState(new Set());

  // Charge les « j'aime » de l'utilisateur dès qu'il est connecté.
  useEffect(() => {
    if (!user) return setIds(new Set());
    api.get('/likes/ids').then((d) => setIds(new Set(d.ids))).catch(() => {});
  }, [user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = async (id) => {
    const r = ids.has(id) ? await api.del(`/likes/${id}`) : await api.post(`/likes/${id}`);
    setIds((s) => { const n = new Set(s); r.liked ? n.add(id) : n.delete(id); return n; });
    return r;
  };
  return <Ctx.Provider value={{ isLiked: (id) => ids.has(id), toggle, count: ids.size }}>{children}</Ctx.Provider>;
}

import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from '../lib/api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

// Page d'atterrissage de chaque rôle (aucun rôle ne voit les pages d'un autre).
export const homeFor = (role) =>
  ({ student: '/compte', landlord: '/bailleur/annonces', admin: '/admin' }[role] || '/');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken()); // true tant que /auth/me n'a pas répondu
  const [modal, setModal] = useState(null);             // { reason, role, onSuccess }

  // Au chargement : si un jeton existe, on récupère le profil réel auprès de l'API.
  useEffect(() => {
    if (!getToken()) return;
    api.get('/auth/me').then((d) => setUser(d.user)).catch(() => setToken(null)).finally(() => setLoading(false));
  }, []);

  const refreshUser = () => api.get('/auth/me').then((d) => setUser(d.user)).catch(() => {});
  const logout = () => { setToken(null); setUser(null); };
  useEffect(() => {
    window.addEventListener('as:unauthorized', logout);
    return () => window.removeEventListener('as:unauthorized', logout);
  }, []);

  const finish = (data) => {
    setToken(data.token);
    setUser(data.user);
    if (modal?.onSuccess && [].concat(modal.role).includes(data.user.role)) modal.onSuccess();
    setModal(null);
    return data.user;
  };
  const login = async (email, password) => finish(await api.post('/auth/login', { email, password }));
  const register = async (fields) => finish(await api.post('/auth/register', fields));

  // Barrière d'action : invité -> modale de connexion ; mauvais rôle -> action refusée.
  const requireAuth = (reason, action, role = 'student') => {
    if (!user) { setModal({ reason, role, onSuccess: action }); return false; }
    if (![].concat(role).includes(user.role)) return false; // role : un rôle ou une liste de rôles
    action();
    return true;
  };

  return (
    <Ctx.Provider value={{ user, loading, refreshUser, login, register, logout, modal, closeModal: () => setModal(null), requireAuth }}>
      {children}
    </Ctx.Provider>
  );
}

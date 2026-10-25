import { Link } from 'react-router-dom';
import { Heart, Users, CalendarCheck, LogOut, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { Button } from '../../components/ui';

export default function Account() {
  const { user, logout } = useAuth();
  const { count } = useFavorites();
  const tiles = [
    [Heart, 'Mes favoris', `${count} logement${count > 1 ? 's' : ''} enregistré${count > 1 ? 's' : ''}`, '/favoris'],
    [CalendarCheck, 'Mes réservations', 'Réservations et reçus PDF', '/reservations'],
    [Users, 'Mon profil colocataire', 'Budget, mode de vie, affinités', '/profil-colocataire'],
    [MessageCircle, 'Mes messages', 'Échanges avec les bailleurs et colocataires', '/messages'],
  ];
  return (
    <div className="px-4 py-5 md:px-6 md:py-8 xl:px-10">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-xl font-extrabold text-white" aria-hidden="true">{user.name.slice(0, 2).toUpperCase()}</div>
        <div><h1 className="text-2xl font-extrabold md:text-3xl">Bonjour {user.name.split(' ')[0]}</h1><p className="text-slate-600">{user.email}</p></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map(([Icon, title, text, to]) => (
          <Link key={to} to={to} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 hover:border-brand">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-blue-50 text-brand"><Icon aria-hidden="true" /></span>
            <span><b className="block">{title}</b><span className="text-sm text-slate-600">{text}</span></span>
          </Link>
        ))}
      </div>
      <Button variant="outline" className="mt-8" onClick={logout}><LogOut size={18} className="mr-2" aria-hidden="true" />Se déconnecter</Button>
    </div>
  );
}

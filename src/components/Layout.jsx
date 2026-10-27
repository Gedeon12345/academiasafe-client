import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth, homeFor } from '../context/AuthContext';
import AuthModal from './AuthModal';
import ThemeToggle from './ThemeToggle';
import { api } from '../lib/api';
import { Button } from './ui';

const PUBLIC = [['/logements', 'Logements'], ['/colocataires', 'Colocataires'], ['/faq', 'Sécurité et FAQ'], ['/about', 'À propos']];

// Liens propres au rôle : un lien n'apparaît que si la page est accessible à ce rôle.
function roleLinks(user, unread = 0) {
  const msg = ['/messages', unread > 0 ? `Mes messages (${unread})` : 'Mes messages'];
  if (user?.role === 'student') return [['Étudiant', [['/favoris', 'Mes favoris'], ['/reservations', 'Mes réservations'], ['/profil-colocataire', 'Mon profil colocataire'], ['/litiges', 'Mes signalements'], msg]]];
  if (user?.role === 'landlord') return [['Bailleur', [['/bailleur/annonces', 'Mes annonces'], ['/bailleur/annonces/nouvelle', 'Déposer une annonce'], ['/bailleur/reservations', 'Réservations reçues'], ['/bailleur/certification', 'Certification'], ['/litiges', 'Mes signalements'], msg]]];
  if (user?.role === 'admin') return [['Administration', [['/admin', 'Tableau de bord'], ['/admin/annonces', 'Annonces'], ['/admin/verifications', 'Certifications'], ['/admin/litiges', 'Litiges'], ['/admin/utilisateurs', 'Utilisateurs']]]];
  return [];
}

const desktopLink = ({ isActive }) =>
  `flex h-11 items-center px-1 text-[15px] font-semibold ${isActive ? 'text-brand' : 'text-slate-700 hover:text-brand'}`;

export default function Layout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const on = () => setSlow(true), off = () => setSlow(false);
    window.addEventListener('as:slow', on); window.addEventListener('as:ok', off);
    return () => { window.removeEventListener('as:slow', on); window.removeEventListener('as:ok', off); };
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  // Nombre de messages non lus (étudiant et bailleur), rafraîchi à chaque page et à la lecture des messages.
  useEffect(() => {
    const load = () => (user && ['student', 'landlord'].includes(user.role) ? api.get('/chat/unread').then((d) => setUnread(d.count)).catch(() => {}) : setUnread(0));
    load();
    const timer = setInterval(() => document.visibilityState === 'visible' && load(), 20000); // messages non lus, quasi en direct
    window.addEventListener('as:messages-read', load);
    return () => { clearInterval(timer); window.removeEventListener('as:messages-read', load); };
  }, [user?._id, pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const groups = [...roleLinks(user, unread), ['Plateforme', PUBLIC]];
  const tabs = [['/', 'Accueil'], ['/logements', 'Logements'], ['/colocataires', 'Colocs'], [user ? homeFor(user.role) : '/login', 'Compte']];

  return (
    <div className="flex min-h-screen flex-col">
      {/* En-tête : menu burger < md, navigation complète >= md */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-[60px] max-w-[1920px] items-center gap-6 px-4 md:px-8">
          <Link to="/" className="text-xl font-extrabold text-brand">AcademiaSafe</Link>
          <nav aria-label="Navigation principale" className="hidden flex-1 items-center gap-6 md:flex">
            {PUBLIC.map(([to, label]) => <NavLink key={to} to={to} className={desktopLink}>{label}</NavLink>)}
          </nav>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            {user ? (
              <>
                <span className="hidden text-sm text-slate-600 lg:inline">{user.name}</span>
                <Button variant="outline" className="hidden h-11 text-sm md:inline-flex" onClick={logout}>Se déconnecter</Button>
              </>
            ) : (
              <Link to="/login" className="flex h-11 items-center rounded-xl border-2 border-brand px-4 text-sm font-bold text-brand">Se connecter</Link>
            )}
            <ThemeToggle />
            <button aria-label="Menu" onClick={() => setOpen(true)} className="flex h-11 w-11 items-center justify-center md:hidden"><Menu /></button>
          </div>
        </div>
        {/* Barre secondaire du rôle (ordinateur et tablette) */}
        {user && (
          <div className="hidden border-t border-slate-100 bg-slate-50 md:block">
            <nav aria-label="Mon espace" className="mx-auto flex h-11 max-w-[1920px] items-center gap-6 px-4 md:px-8">
              {roleLinks(user, unread)[0][1].map(([to, label]) => <NavLink key={to} to={to} className={desktopLink}>{label}</NavLink>)}
            </nav>
          </div>
        )}
      </header>
      {slow && <div role="status" className="bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-900">Le serveur se réveille (version gratuite) : patientez environ 30 secondes, la page va s'afficher.</div>}

      <main className="mx-auto w-full max-w-[1920px] flex-1 pb-20 md:px-4 md:pb-8 xl:px-8"><Outlet /></main>

      <footer className="hidden border-t border-slate-200 bg-white md:block">
        <div className="mx-auto grid max-w-[1920px] gap-8 px-8 py-10 md:grid-cols-4">
          <div className="md:col-span-2"><b className="text-xl text-brand">AcademiaSafe</b><p className="mt-2 max-w-md text-sm text-slate-600">Trouvez un logement étudiant vérifié, comparez le trajet vers votre campus et réservez en toute sécurité.</p></div>
          <nav aria-label="Explorer"><b className="text-sm">Explorer</b><ul className="mt-2 space-y-1 text-sm text-slate-600">
            <li><Link to="/logements" className="hover:text-brand">Logements</Link></li><li><Link to="/colocataires" className="hover:text-brand">Colocataires</Link></li></ul></nav>
          <nav aria-label="Aide"><b className="text-sm">Aide</b><ul className="mt-2 space-y-1 text-sm text-slate-600">
            <li><Link to="/faq" className="hover:text-brand">Sécurité et FAQ</Link></li><li><Link to="/about" className="hover:text-brand">À propos</Link></li>
            <li><Link to="/conditions" className="hover:text-brand">Conditions d'utilisation</Link></li><li><Link to="/confidentialite" className="hover:text-brand">Confidentialité</Link></li></ul></nav>
        </div>
        <p className="border-t border-slate-200 py-4 text-center text-xs text-slate-600">© {new Date().getFullYear()} AcademiaSafe</p>
      </footer>

      {/* Barre du bas : mobile uniquement */}
      <nav aria-label="Navigation mobile" className="fixed inset-x-0 bottom-0 z-30 flex h-16 border-t border-slate-200 bg-white md:hidden">
        {tabs.map(([to, label]) => (
          <NavLink key={label} to={to} end={to === '/'}
            className={({ isActive }) => `flex flex-1 items-center justify-center border-t-[3px] text-[13px] font-semibold ${isActive ? 'border-brand text-brand' : 'border-transparent text-slate-600'}`}>
            {label}
          </NavLink>
        ))}
      </nav>

      {open && (
        <div className="fixed inset-0 z-40 bg-ink/60 md:hidden" onClick={() => setOpen(false)}>
          <aside onClick={(e) => e.stopPropagation()} className="ml-auto flex h-full w-[300px] max-w-[85vw] flex-col overflow-y-auto bg-white p-2">
            <button aria-label="Fermer le menu" onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center self-end"><X /></button>
            {groups.map(([title, links]) => (
              <div key={title}>
                <div className="px-3 pb-1 pt-3 text-[13px] font-bold text-slate-600">{title}</div>
                {links.map(([to, label]) => <Link key={to} to={to} className="flex h-12 items-center px-3 font-semibold">{label}</Link>)}
              </div>
            ))}
            <div className="mt-auto p-3">
              <p className="mb-3 flex flex-wrap gap-x-4 text-xs text-slate-600"><Link to="/conditions" className="py-2 underline">Conditions</Link><Link to="/confidentialite" className="py-2 underline">Confidentialité</Link></p>
              {user ? <Button variant="outline" className="w-full" onClick={logout}>Se déconnecter</Button>
                    : <Link to="/login" className="flex h-12 items-center justify-center rounded-xl bg-brand font-bold text-white">Se connecter</Link>}
            </div>
          </aside>
        </div>
      )}
      <AuthModal />
    </div>
  );
}

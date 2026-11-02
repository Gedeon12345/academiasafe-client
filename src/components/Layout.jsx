import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Building2, House, Menu, MessageSquarePlus, User, Users, X } from 'lucide-react';
import { useAuth, homeFor } from '../context/AuthContext';
import { BadgeContext } from '../context/BadgeContext';
import AuthModal from './AuthModal';
import ThemeToggle from './ThemeToggle';
import { api } from '../lib/api';
import { NAV } from '../lib/nav';
import { Button } from './ui';

const TITLES = [[/^\/$/, 'Logement étudiant vérifié'], [/^\/logements\/[^/]+/, 'Logement'], [/^\/logements/, 'Logements'], [/^\/colocataires/, 'Colocataires'], [/^\/faq/, 'Sécurité et FAQ'], [/^\/about/, 'À propos'],
  [/^\/messages/, 'Messagerie'], [/^\/favoris/, 'Mes favoris'], [/^\/reservations/, 'Mes réservations'], [/^\/admin/, 'Administration'], [/^\/bailleur/, 'Espace bailleur'], [/^\/avis-site/, 'Donner mon avis'],
  [/^\/conditions/, "Conditions d'utilisation"], [/^\/confidentialite/, 'Confidentialité'], [/^\/login/, 'Connexion'], [/^\/litiges/, 'Mes signalements'], [/^\/compte/, 'Mon espace']];

const PUBLIC = [['/logements', 'Logements'], ['/colocataires', 'Colocataires'], ['/faq', 'Sécurité et FAQ'], ['/about', 'À propos']];
const IN_DASHBOARD = /^\/(admin|bailleur|compte|favoris|reservations|profil-colocataire|messages|litiges)(\/|$)/;

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="AcademiaSafe, accueil">
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="#1E40AF" />
        <path d="M6 16 16 7l10 9v9a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z" fill="#fff" />
        <rect x="13.5" y="18" width="5" height="8" rx="1" fill="#1E40AF" />
        <circle cx="25" cy="8" r="5" fill="#059669" /><path d="m22.7 8 1.6 1.6 3-3.2" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="font-display text-xl font-extrabold tracking-tight">AcademiaSafe</span>
    </Link>
  );
}

const desktopLink = ({ isActive }) =>
  `relative flex h-[60px] items-center px-1 text-[15px] font-semibold transition-colors ${isActive ? 'text-brand after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-brand' : 'text-slate-700 hover:text-brand'}`;

export default function Layout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [slow, setSlow] = useState(false);
  const inDash = !!user && IN_DASHBOARD.test(pathname);

  useEffect(() => {
    const on = () => setSlow(true), off = () => setSlow(false);
    window.addEventListener('as:slow', on); window.addEventListener('as:ok', off);
    return () => { window.removeEventListener('as:slow', on); window.removeEventListener('as:ok', off); };
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => { const t = TITLES.find(([re]) => re.test(pathname))?.[1]; document.title = t ? `${t} · AcademiaSafe` : 'AcademiaSafe'; }, [pathname]);
  // Pastille : messages non lus (étudiant, bailleur) ou avis du site à lire (admin), rafraîchie régulièrement.
  useEffect(() => {
    const load = () => {
      if (!user) return setUnread(0);
      if (user.role === 'admin') return api.get('/admin/feedback/count').then((d) => setUnread(d.new)).catch(() => {});
      if (['student', 'landlord'].includes(user.role)) return api.get('/chat/unread').then((d) => setUnread(d.count)).catch(() => {});
      setUnread(0);
    };
    load();
    const timer = setInterval(() => document.visibilityState === 'visible' && load(), 20000);
    window.addEventListener('as:messages-read', load);
    return () => { clearInterval(timer); window.removeEventListener('as:messages-read', load); };
  }, [user?._id, pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const showFab = !/^\/(messages|avis-site|logements\/|admin)/.test(pathname);
  const tabs = [['/', 'Accueil', House], ['/logements', 'Logements', Building2], ['/colocataires', 'Colocs', Users], [user ? homeFor(user.role) : '/login', user ? 'Mon espace' : 'Compte', User]];
  const roleGroups = user ? NAV[user.role] || [] : [];

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-3 focus:font-bold focus:text-white">Aller au contenu</a>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-[60px] max-w-[1920px] items-center gap-8 px-4 md:px-8">
          <Logo />
          <nav aria-label="Navigation principale" className="hidden flex-1 items-center gap-7 md:flex">
            {PUBLIC.map(([to, label]) => <NavLink key={to} to={to} className={desktopLink}>{label}</NavLink>)}
          </nav>
          <div className="ml-auto flex items-center gap-1.5 md:ml-0">
            {user ? (
              <Link to={homeFor(user.role)} className="hidden h-11 items-center gap-2 rounded-full border border-slate-300 py-1 pl-1 pr-4 text-sm font-bold hover:border-brand md:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-display font-extrabold text-white" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span>
                Mon espace{unread > 0 && <span className="rounded-full bg-brand px-1.5 text-[11px] text-white" aria-label={`${unread} à lire`}>{unread}</span>}
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden h-11 items-center px-3 text-sm font-bold text-slate-700 hover:text-brand md:flex">Se connecter</Link>
                <Link to="/login" className="flex h-11 items-center rounded-xl bg-brand px-4 text-sm font-bold text-white hover:bg-brand-dark">S'inscrire</Link>
              </>
            )}
            <ThemeToggle />
            <button aria-label="Menu" onClick={() => setOpen(true)} className="relative flex h-11 w-11 items-center justify-center md:hidden">
              <Menu />{unread > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-600" aria-label={`${unread} à lire`} />}
            </button>
          </div>
        </div>
      </header>
      {slow && <div role="status" className="bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-900">Le serveur se réveille (version gratuite) : patientez environ 30 secondes, la page va s'afficher.</div>}

      <main id="contenu" tabIndex={-1} className={`w-full flex-1 outline-none ${inDash ? 'pb-20 md:pb-8' : 'mx-auto max-w-[1920px] pb-20 md:px-4 md:pb-8 xl:px-8'}`}>
        <BadgeContext.Provider value={{ unread }}><Outlet /></BadgeContext.Provider>
      </main>

      {!inDash && (
        <footer className="hidden bg-ink text-slate-300 md:block">
          <div className="mx-auto grid max-w-[1920px] gap-10 px-8 py-12 md:grid-cols-[1.6fr_1fr_1fr]">
            <div><p className="font-display text-2xl font-extrabold text-white">AcademiaSafe</p><p className="mt-3 max-w-sm leading-relaxed">Des logements étudiants contrôlés, le trajet vers votre campus calculé d'avance, et un reçu vérifiable à chaque réservation.</p></div>
            <nav aria-label="Explorer"><b className="text-white">Explorer</b><ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/logements" className="hover:text-white">Logements</Link></li><li><Link to="/colocataires" className="hover:text-white">Colocataires</Link></li><li><Link to="/bailleur/annonces/nouvelle" className="hover:text-white">Publier une annonce</Link></li></ul></nav>
            <nav aria-label="Aide"><b className="text-white">Aide et informations</b><ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/faq" className="hover:text-white">Sécurité et FAQ</Link></li><li><Link to="/avis-site" className="hover:text-white">Donner votre avis</Link></li><li><Link to="/about" className="hover:text-white">À propos</Link></li>
              <li><Link to="/conditions" className="hover:text-white">Conditions d'utilisation</Link></li><li><Link to="/confidentialite" className="hover:text-white">Confidentialité</Link></li></ul></nav>
          </div>
          <p className="border-t border-white/10 py-4 text-center text-xs text-slate-400">© {new Date().getFullYear()} AcademiaSafe</p>
        </footer>
      )}

      <nav aria-label="Navigation mobile" className="fixed inset-x-0 bottom-0 z-30 flex h-16 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        {tabs.map(([to, label, Icon]) => (
          <NavLink key={label} to={to} end={to === '/'}
            className={({ isActive }) => `flex flex-1 flex-col items-center justify-center gap-0.5 text-[12px] font-semibold ${isActive ? 'text-brand' : 'text-slate-600'}`}>
            <Icon size={21} aria-hidden="true" />{label}
          </NavLink>
        ))}
      </nav>

      {open && (
        <div className="fixed inset-0 z-40 bg-ink/60 md:hidden" onClick={() => setOpen(false)}>
          <aside onClick={(e) => e.stopPropagation()} className="ml-auto flex h-full w-[300px] max-w-[85vw] flex-col overflow-y-auto bg-white p-2">
            <button aria-label="Fermer le menu" onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center self-end"><X /></button>
            {roleGroups.map((g) => (
              <div key={g.title}>
                <div className="px-3 pb-1 pt-3 text-[13px] font-bold text-slate-600">{g.title}</div>
                {g.items.map((it) => <Link key={it.to} to={it.to} className="flex h-12 items-center gap-3 px-3 font-semibold"><it.icon size={19} aria-hidden="true" />{it.label}{it.badge && unread > 0 && <span className="ml-auto rounded-full bg-brand px-2 text-xs font-bold text-white">{unread}</span>}</Link>)}
              </div>
            ))}
            <div>
              <div className="px-3 pb-1 pt-3 text-[13px] font-bold text-slate-600">Plateforme</div>
              {[...PUBLIC, ['/avis-site', 'Donner mon avis']].map(([to, label]) => <Link key={to} to={to} className="flex h-12 items-center px-3 font-semibold">{label}</Link>)}
            </div>
            <div className="mt-auto p-3">
              <p className="mb-3 flex flex-wrap gap-x-4 text-xs text-slate-600"><Link to="/conditions" className="py-2 underline">Conditions</Link><Link to="/confidentialite" className="py-2 underline">Confidentialité</Link></p>
              {user ? <Button variant="outline" className="w-full" onClick={logout}>Se déconnecter</Button>
                    : <Link to="/login" className="flex h-12 items-center justify-center rounded-xl bg-brand font-bold text-white">Se connecter</Link>}
            </div>
          </aside>
        </div>
      )}
      {showFab && (
        <Link to="/avis-site" state={{ from: pathname }} className="fixed bottom-20 left-3 z-30 flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-bold text-white shadow-lg md:bottom-6 md:left-auto md:right-6">
          <MessageSquarePlus size={18} aria-hidden="true" />Votre avis
        </Link>
      )}
      <AuthModal />
    </div>
  );
}

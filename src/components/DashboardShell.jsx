import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBadges } from '../context/BadgeContext';
import { NAV, ROLE_LABEL, isActive } from '../lib/nav';

// Mise en page des espaces connectés : barre latérale à gauche sur ordinateur, bande de navigation en haut sur téléphone.
export default function DashboardShell() {
  const { user, logout } = useAuth();
  const { unread } = useBadges();
  const { pathname } = useLocation();
  const groups = NAV[user.role] || [];
  const badge = (it) => it.badge && unread > 0 && (
    <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white" aria-label={`${unread} à lire`}>{unread}</span>
  );

  return (
    <div className="mx-auto flex w-full max-w-[1920px] items-start lg:gap-6 lg:px-6 lg:py-6 xl:px-8">
      <aside aria-label="Navigation de mon espace" className="sticky top-[76px] hidden max-h-[calc(100vh-100px)] w-64 flex-none flex-col overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 lg:flex">
        <div className="flex items-center gap-3 rounded-xl bg-brand-soft p-3">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-brand font-display text-lg font-extrabold text-white" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span>
          <span className="min-w-0"><b className="block truncate">{user.name}</b><span className="text-xs text-slate-600">{ROLE_LABEL[user.role]}</span></span>
        </div>
        <nav className="mt-3 flex-1 space-y-4">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="px-3 pb-1 text-xs font-bold text-slate-600">{g.title}</p>
              <ul className="space-y-0.5">
                {g.items.map((it) => {
                  const on = isActive(it, pathname);
                  return (
                    <li key={it.to}>
                      <Link to={it.to} aria-current={on ? 'page' : undefined}
                        className={`flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold transition-colors ${on ? 'bg-brand-soft text-brand shadow-[inset_3px_0_0_0_#1E40AF]' : 'text-slate-700 hover:bg-slate-100'}`}>
                        <it.icon size={19} aria-hidden="true" />{it.label}{badge(it)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="mt-3 space-y-0.5 border-t border-slate-200 pt-3">
          <Link to="/" className="flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold text-slate-700 hover:bg-slate-100"><ArrowUpRight size={19} aria-hidden="true" />Voir le site</Link>
          <button onClick={logout} className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[15px] font-semibold text-red-700 hover:bg-red-50"><LogOut size={19} aria-hidden="true" />Se déconnecter</button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <nav aria-label="Navigation de mon espace" className="sticky top-[60px] z-20 flex gap-2 overflow-x-auto border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur lg:hidden">
          {groups.flatMap((g) => g.items).map((it) => {
            const on = isActive(it, pathname);
            return (
              <Link key={it.to} to={it.to} aria-current={on ? 'page' : undefined}
                className={`flex h-10 flex-none items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold ${on ? 'bg-brand text-white' : 'bg-slate-100 text-slate-700'}`}>
                <it.icon size={16} aria-hidden="true" />{it.label}{it.badge && unread > 0 && <span className="ml-1 rounded-full bg-white px-1.5 text-[11px] font-bold text-brand">{unread}</span>}
              </Link>
            );
          })}
        </nav>
        <Outlet />
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { BadgeCheck, Building2, CalendarCheck, Check, Eye, Heart, Plus } from 'lucide-react';
import { useApi } from '../../lib/useApi';
import { fcfa } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';
import { ButtonLink } from '../../components/ui';
import { ErrorState, PageLoader } from '../../components/feedback';
import PageHeader from '../../components/PageHeader';

const date = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

export default function LandlordOverview() {
  const { user } = useAuth();
  const [s, reload] = useApi('/landlord/stats');
  if (s.loading) return <PageLoader label="Chargement de votre activité…" />;
  if (s.error) return <div className="px-4 py-12"><ErrorState message={s.error} onRetry={reload} /></div>;
  const d = s.data;
  const tiles = [
    [Building2, 'Annonces publiées', d.listings.approved, d.listings.pending ? `${d.listings.pending} en attente` : 'Toutes traitées', '/bailleur/annonces'],
    [Eye, 'Vues', d.views, 'Une vue par visiteur', '/bailleur/annonces'],
    [Heart, "J'aime", d.likes, 'Sur toutes vos annonces', '/bailleur/annonces'],
    [CalendarCheck, 'Réservations', d.bookings.count, d.bookings.count ? `${fcfa(d.bookings.amount)} d'acomptes` : 'Aucune pour l’instant', '/bailleur/reservations'],
  ];
  const steps = [
    [d.listings.total > 0, 'Publier votre première annonce', '/bailleur/annonces/nouvelle', 'Créer une annonce'],
    [user.isIdentityVerified, 'Faire certifier votre compte', '/bailleur/certification', 'Envoyer mes pièces'],
    [d.bookings.count > 0, 'Recevoir une première réservation', '/bailleur/annonces', 'Voir mes annonces'],
  ];

  return (
    <div className="px-4 py-5 md:px-6 md:py-8 xl:px-10">
      <PageHeader title={`Bonjour ${user.name.split(' ')[0]}`} text="Voici où en sont vos annonces et vos réservations."
        actions={<ButtonLink to="/bailleur/annonces/nouvelle"><Plus size={18} aria-hidden="true" />Nouvelle annonce</ButtonLink>} />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {tiles.map(([Icon, label, n, sub, to]) => (
          <Link key={label} to={to} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand">
            <Icon className="text-brand" size={22} aria-hidden="true" />
            <p className="mt-3 font-display text-4xl font-extrabold">{n}</p>
            <p className="font-semibold">{label}</p><p className="text-sm text-slate-600">{sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5" aria-labelledby="rec">
          <div className="mb-3 flex items-center justify-between"><h2 id="rec" className="text-lg font-extrabold">Dernières réservations</h2><Link to="/bailleur/reservations" className="text-sm font-bold text-brand">Tout voir</Link></div>
          {d.recent.length === 0 ? <p className="py-6 text-center text-slate-600">Les réservations payées apparaîtront ici, avec le reçu de chaque étudiant.</p> : (
            <ul className="divide-y divide-slate-200">
              {d.recent.map((r) => <li key={r._id} className="flex items-center justify-between gap-3 py-3"><span className="min-w-0"><b className="block truncate">{r.title}</b><span className="text-sm text-slate-600">{r.student} · {date(r.paidAt)}</span></span><b className="flex-none text-brand">{fcfa(r.amount)}</b></li>)}
            </ul>
          )}
          {d.top && <p className="mt-4 rounded-xl bg-brand-soft p-3 text-sm">Votre annonce la plus vue : <b>{d.top.title}</b> ({d.top.viewsCount} vues, {d.top.likesCount} j'aime).</p>}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5" aria-labelledby="go">
          <h2 id="go" className="mb-3 text-lg font-extrabold">Pour avancer</h2>
          <ul className="space-y-3">
            {steps.map(([done, label, to, cta]) => (
              <li key={label} className="flex items-center gap-3">
                <span className={`flex h-8 w-8 flex-none items-center justify-center rounded-full ${done ? 'bg-safe-dark text-white' : 'bg-slate-200 text-slate-600'}`}>{done ? <Check size={16} strokeWidth={3} aria-label="Fait" /> : <BadgeCheck size={16} aria-hidden="true" />}</span>
                <span className="min-w-0 flex-1"><span className={`block font-semibold ${done ? 'text-slate-600 line-through' : ''}`}>{label}</span>{!done && <Link to={to} className="text-sm font-bold text-brand">{cta}</Link>}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

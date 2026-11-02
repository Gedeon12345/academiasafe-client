import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, Heart, MessageCircle, Search, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBadges } from '../../context/BadgeContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useApi } from '../../lib/useApi';
import { fcfa } from '../../lib/format';
import { ButtonLink } from '../../components/ui';
import PageHeader from '../../components/PageHeader';

export default function Account() {
  const { user } = useAuth();
  const { count } = useFavorites();
  const { unread } = useBadges();
  const [b] = useApi('/bookings/mine');
  const paid = (b.data?.data || []).filter((x) => x.paymentStatus === 'success');
  const tiles = [
    [Heart, 'Favoris', count, 'logements enregistrés', '/favoris'],
    [CalendarCheck, 'Réservations', paid.length, 'confirmées', '/reservations'],
    [MessageCircle, 'Messages', unread, unread > 1 ? 'non lus' : 'non lu', '/messages'],
    [Users, 'Colocation', '→', 'mon profil', '/profil-colocataire'],
  ];
  const next = [
    count === 0 && ['Enregistrez vos logements préférés', 'Touchez le marque-page sur une annonce pour la retrouver ici et la comparer aux autres.', '/logements', 'Parcourir les logements'],
    paid.length === 0 && ['Réservez pour bloquer un logement', "L'acompte par Mobile Money bloque le logement à votre nom et produit un reçu PDF vérifiable.", '/logements', 'Trouver un logement'],
    ['Cherchez un colocataire compatible', "Créez votre profil : chaque étudiant affiche son taux d'affinité avec vous.", '/profil-colocataire', 'Mon profil colocataire'],
  ].filter(Boolean).slice(0, 2);

  return (
    <div className="px-4 py-5 md:px-6 md:py-8 xl:px-10">
      <PageHeader title={`Bonjour ${user.name.split(' ')[0]}`} text="Votre recherche de logement, au même endroit." actions={<ButtonLink to="/logements"><Search size={18} aria-hidden="true" />Chercher un logement</ButtonLink>} />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {tiles.map(([Icon, label, n, sub, to]) => (
          <Link key={label} to={to} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand">
            <Icon className="text-brand" size={22} aria-hidden="true" /><p className="mt-3 font-display text-4xl font-extrabold">{n}</p><p className="font-semibold">{label}</p><p className="text-sm text-slate-600">{sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5" aria-labelledby="mr">
          <div className="mb-3 flex items-center justify-between"><h2 id="mr" className="text-lg font-extrabold">Mes dernières réservations</h2><Link to="/reservations" className="text-sm font-bold text-brand">Tout voir</Link></div>
          {paid.length === 0 ? <p className="py-6 text-center text-slate-600">Aucune réservation pour l'instant.</p> : (
            <ul className="divide-y divide-slate-200">
              {paid.slice(0, 3).map((r) => <li key={r._id}><Link to={`/reservations/${r._id}`} className="flex items-center justify-between gap-3 py-3 hover:text-brand"><span className="min-w-0"><b className="block truncate">{r.snapshot?.title}</b><span className="text-sm text-slate-600">Reçu n° {r.receiptNumber}</span></span><b className="flex-none">{fcfa(r.amountPaid)}</b></Link></li>)}
            </ul>
          )}
        </section>
        <section className="rounded-2xl bg-brand p-5 text-white" aria-labelledby="nx">
          <h2 id="nx" className="text-lg font-extrabold">Pour continuer</h2>
          <ul className="mt-3 space-y-4">
            {next.map(([t, d, to, cta]) => (
              <li key={t}><p className="font-bold">{t}</p><p className="text-sm leading-relaxed text-blue-100">{d}</p><Link to={to} className="mt-1 inline-flex h-10 items-center gap-1 font-bold text-taxi">{cta}<ArrowRight size={16} aria-hidden="true" /></Link></li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Building2, FileSearch, ShieldAlert, Users, Wallet } from 'lucide-react';
import { useApi } from '../../lib/useApi';
import { fcfa } from '../../lib/format';
import { ErrorState, PageLoader } from '../../components/feedback';
import { when } from '../../components/admin';

const LABEL = { 'listing.approve': 'Annonce approuvée', 'listing.reject': 'Annonce refusée', 'listing.certify': 'Badge attribué', 'listing.uncertify': 'Badge retiré', 'user.suspend': 'Compte suspendu', 'user.reactivate': 'Compte réactivé',
  'verification.approve': 'Bailleur certifié', 'verification.reject': 'Dossier refusé', 'verification.view': 'Pièce consultée', 'dispute.in_review': 'Litige pris en charge', 'dispute.resolved': 'Litige résolu', 'dispute.rejected': 'Litige clos' };

export default function Dashboard() {
  const [s, reload] = useApi('/admin/stats');
  if (s.loading) return <PageLoader label="Chargement du tableau de bord…" />;
  if (s.error) return <div className="px-4 py-12"><ErrorState message={s.error} onRetry={reload} /></div>;
  const d = s.data;
  const todo = [
    [Building2, 'Annonces à valider', d.listings.pending, '/admin/annonces'],
    [FileSearch, 'Dossiers bailleurs à vérifier', d.verificationsPending, '/admin/verifications'],
    [ShieldAlert, 'Litiges ouverts', d.disputesOpen, '/admin/litiges'],
  ];
  const stats = [['Annonces publiées', d.listings.approved], ['Cités certifiées', d.listings.certified], ['Étudiants', d.users.students], ['Bailleurs', d.users.landlords], ['Réservations payées', d.bookings.count], ['Avis', d.reviews]];

  return (
    <div className="px-4 py-5 md:px-6 md:py-8 xl:px-10">
      <h1 className="text-2xl font-extrabold md:text-3xl">Tableau de bord</h1>

      <h2 className="mb-3 mt-6 font-bold">À traiter</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {todo.map(([Icon, label, n, to]) => (
          <Link key={to} to={to} className={`flex items-center gap-4 rounded-2xl border bg-white p-5 hover:border-brand ${n > 0 ? 'border-amber-400' : 'border-slate-200'}`}>
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-blue-50 text-brand"><Icon aria-hidden="true" /></span>
            <span><b className="block text-3xl">{n}</b><span className="text-sm text-slate-600">{label}</span></span>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 mt-8 font-bold">La plateforme</h2>
      <dl className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stats.map(([k, v]) => <div key={k} className="rounded-2xl border border-slate-200 bg-white p-4"><dd className="text-2xl font-extrabold text-brand">{v}</dd><dt className="text-sm text-slate-600">{k}</dt></div>)}
      </dl>
      <div className="mt-4 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5"><Wallet className="text-safe" aria-hidden="true" />
        <p><b className="text-xl">{fcfa(d.bookings.amount)}</b> <span className="text-slate-600">d'acomptes encaissés</span></p></div>
      {d.users.suspended > 0 && <p className="mt-3 flex items-center gap-2 text-sm text-slate-600"><Users size={16} aria-hidden="true" />{d.users.suspended} compte(s) suspendu(s)</p>}

      <h2 className="mb-3 mt-8 font-bold">Activité récente</h2>
      {d.activity.length === 0 ? <p className="text-slate-600">Aucune action pour le moment.</p> : (
        <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {d.activity.map((a) => <li key={a._id} className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm"><span><b>{LABEL[a.action] || a.action}</b>{a.details && <span className="text-slate-600"> · {a.details}</span>}</span><span className="text-slate-600">{a.admin} · {when(a.createdAt)}</span></li>)}
        </ul>
      )}
    </div>
  );
}

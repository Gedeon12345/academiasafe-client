import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { fcfa } from '../../lib/format';
import { ButtonLink } from '../../components/ui';
import { EmptyState, ErrorState, PageLoader } from '../../components/feedback';

export const STATUS = {
  success: ['Confirmée', 'bg-safe-soft text-safe-dark'],
  pending: ['En attente de paiement', 'bg-amber-100 text-amber-900'],
  failed: ['Échec du paiement', 'bg-red-50 text-red-700'],
};
const date = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

export default function Reservations() {
  const [state, setState] = useState({ loading: true, data: [], error: '' });
  const [tries, setTries] = useState(0);
  useEffect(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    api.get('/bookings/mine').then((d) => setState({ loading: false, data: d.data, error: '' })).catch((e) => setState({ loading: false, data: [], error: e.message }));
  }, [tries]);

  if (state.loading) return <PageLoader label="Chargement de vos réservations…" />;
  if (state.error) return <div className="px-4 py-12"><ErrorState message={state.error} onRetry={() => setTries((t) => t + 1)} /></div>;

  return (
    <div className="px-4 py-5 md:px-6 md:py-8 xl:px-10">
      <h1 className="mb-5 text-2xl font-extrabold md:text-3xl">Mes réservations</h1>
      {state.data.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="Aucune réservation" text="Quand vous réserverez un logement, votre reçu PDF apparaîtra ici."
          actions={<ButtonLink to="/logements">Trouver un logement</ButtonLink>} />
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {state.data.map((b) => {
            const [label, cls] = STATUS[b.paymentStatus];
            return (
              <Link key={b._id} to={`/reservations/${b._id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 hover:border-brand">
                <div className="min-w-0">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${cls}`}>{label}</span>
                  <h2 className="mt-1.5 truncate font-bold">{b.snapshot?.title}</h2>
                  <p className="text-sm text-slate-600">{b.snapshot?.neighborhood} · {date(b.paidAt || b.createdAt)}</p>
                </div>
                <b className="flex-none text-brand">{fcfa(b.amountDue)}</b>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

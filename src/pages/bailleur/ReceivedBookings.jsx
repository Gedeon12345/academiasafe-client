import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarCheck, Download, MessageCircle } from 'lucide-react';
import { api, download } from '../../lib/api';
import { fcfa } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button, ButtonLink } from '../../components/ui';
import { EmptyState, ErrorState, PageLoader } from '../../components/feedback';
import DisputeDialog from '../../components/DisputeDialog';

const date = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

export default function ReceivedBookings() {
  const { user } = useAuth();
  const toast = useToast();
  const [state, setState] = useState({ loading: true, data: [], error: '' });
  const [tries, setTries] = useState(0);
  const [reportFor, setReportFor] = useState(null);
  const navigate = useNavigate();
  const openChat = async (b) => {
    try { const d = await api.post('/chat/conversations', { kind: 'booking', bookingId: b._id }); navigate(`/messages/${d.conversation._id}`); }
    catch (e) { toast(e.message, 'error'); }
  };
  useEffect(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    api.get('/bookings/received').then((d) => setState({ loading: false, data: d.data, error: '' })).catch((e) => setState({ loading: false, data: [], error: e.message }));
  }, [tries]);

  if (state.loading) return <PageLoader label="Chargement des réservations…" />;
  if (state.error) return <div className="px-4 py-12"><ErrorState message={state.error} onRetry={() => setTries((t) => t + 1)} /></div>;
  const total = state.data.reduce((n, b) => n + b.amountPaid, 0);

  return (
    <div className="px-4 py-5 md:px-6 md:py-8 xl:px-10">
      <h1 className="text-2xl font-extrabold md:text-3xl">Réservations reçues</h1>
      {state.data.length === 0 ? (
        <div className="mt-6"><EmptyState icon={CalendarCheck} title="Aucune réservation pour l'instant" text="Quand un étudiant paie l'acompte d'un de vos logements, il apparaît ici avec son reçu, et vous pouvez lui écrire dans la messagerie."
          actions={<ButtonLink to="/bailleur/annonces">Mes annonces</ButtonLink>} /></div>
      ) : (
        <>
          <p className="mb-5 mt-1 text-slate-600">{state.data.length} réservation{state.data.length > 1 ? 's' : ''} · {fcfa(total)} d'acomptes encaissés</p>
          <div className="grid gap-3 xl:grid-cols-2">
            {state.data.map((b) => (
              <article key={b._id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div><h2 className="font-bold">{b.snapshot?.title}</h2><p className="text-sm text-slate-600">Reçu n° {b.receiptNumber} · payé le {date(b.paidAt)}</p></div>
                  <b className="text-brand">{fcfa(b.amountPaid)}</b>
                </div>
                <p className="mt-3 text-sm"><b>{b.student?.name}</b></p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button className="h-11 text-sm" onClick={() => openChat(b)}><MessageCircle size={16} className="mr-2" aria-hidden="true" />Écrire à l'étudiant</Button>
                  {b.hasReceipt && <Button variant="outline" className="h-11 text-sm" onClick={() => download(`/bookings/${b._id}/receipt`, `recu-${b.receiptNumber}.pdf`).catch((e) => toast(e.message, 'error'))}><Download size={16} className="mr-2" aria-hidden="true" />Reçu PDF</Button>}
                  <Link to={`/logements/${b.listing}`} className="flex h-11 items-center px-2 text-sm font-bold text-brand">Voir l'annonce</Link>
                  <button type="button" onClick={() => setReportFor(b._id)} className="h-11 px-2 text-sm font-bold text-red-700">Signaler un problème</button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
      <DisputeDialog open={!!reportFor} onClose={() => setReportFor(null)} bookingId={reportFor} />
    </div>
  );
}

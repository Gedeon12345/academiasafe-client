import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Download, SearchX, XCircle } from 'lucide-react';
import { api, download } from '../../lib/api';
import { fcfa } from '../../lib/format';
import { useToast } from '../../context/ToastContext';
import { Button, ButtonLink } from '../../components/ui';
import DisputeDialog from '../../components/DisputeDialog';
import { EmptyState, ErrorState, PageLoader } from '../../components/feedback';

const date = (d) => new Date(d).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' });
const OPERATOR = { mtn: 'MTN Mobile Money', orange: 'Orange Money' };

export default function ReservationDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [state, setState] = useState({ loading: true, booking: null, error: '' });
  const [tries, setTries] = useState(0);
  const [busy, setBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    api.get(`/bookings/${id}`).then((d) => setState({ loading: false, booking: d.booking, error: '' }))
      .catch((e) => setState({ loading: false, booking: null, error: e.status === 404 ? '404' : e.message }));
  }, [id, tries]);

  if (state.loading) return <PageLoader label="Chargement de la réservation…" />;
  if (state.error === '404') return <div className="px-4 py-12"><EmptyState icon={SearchX} title="Réservation introuvable" actions={<ButtonLink to="/reservations">Mes réservations</ButtonLink>} /></div>;
  if (state.error) return <div className="px-4 py-12"><ErrorState message={state.error} onRetry={() => setTries((t) => t + 1)} /></div>;

  const b = state.booking;
  const s = b.snapshot || {};
  const getReceipt = async () => {
    setBusy(true);
    try { await download(`/bookings/${b._id}/receipt`, `recu-${b.receiptNumber}.pdf`); } catch (e) { toast(e.message, 'error'); } finally { setBusy(false); }
  };

  if (b.paymentStatus !== 'success') {
    const pending = b.paymentStatus === 'pending';
    return (
      <div className="px-4 py-12">
        <EmptyState icon={XCircle} title={pending ? 'Paiement en attente' : "Le paiement n'a pas abouti"} text={pending ? 'Validez le paiement sur votre téléphone, ou reprenez la réservation.' : b.failureReason}
          actions={<><ButtonLink to={`/logements/${b.listing}/reserver`}>{pending ? 'Reprendre le paiement' : 'Réessayer'}</ButtonLink><ButtonLink to="/reservations" variant="outline">Mes réservations</ButtonLink></>} />
      </div>
    );
  }

  const rows = [['Logement', s.title], ['Adresse', [s.addressLabel, s.neighborhood].filter(Boolean).join(', ')], ['Acompte payé', fcfa(b.amountPaid)],
    ['Moyen de paiement', OPERATOR[b.operator]], ['Référence', b.transactionReference], ['Reçu n°', b.receiptNumber], ['Payé le', date(b.paidAt)]];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 md:py-10">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-safe text-white"><Check size={34} strokeWidth={3} aria-hidden="true" /></div>
        <h1 className="mt-3 text-2xl font-extrabold md:text-3xl">Réservation confirmée</h1>
        <p className="text-slate-600">Le logement est bloqué à votre nom. Le bailleur a été prévenu.</p>
      </div>
      <dl className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-4">
        {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-3 text-sm"><dt className="text-slate-600">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>)}
      </dl>
      <div className="mt-5 flex flex-wrap gap-3">
        {b.hasReceipt
          ? <Button onClick={getReceipt} disabled={busy} className="flex-1"><Download size={18} className="mr-2" aria-hidden="true" />{busy ? 'Téléchargement…' : 'Télécharger le reçu PDF'}</Button>
          : <Button variant="outline" className="flex-1" onClick={() => setTries((t) => t + 1)}>Reçu en préparation, actualiser</Button>}
        <ButtonLink to="/reservations" variant="outline" className="flex-1">Mes réservations</ButtonLink>
      </div>
      <p className="mt-4 text-center text-sm text-slate-600"><Link to={`/logements/${b.listing}`} className="font-bold text-brand">Revoir l'annonce</Link></p>
      <div className="mt-2 text-center"><button type="button" onClick={() => setReportOpen(true)} className="h-11 text-sm font-bold text-red-700">Signaler un problème</button></div>
      <DisputeDialog open={reportOpen} onClose={() => setReportOpen(false)} bookingId={b._id} />
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Smartphone, SearchX, XCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { fcfa } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button, ButtonLink } from '../../components/ui';
import { EmptyState, ErrorState, Loader, PageLoader } from '../../components/feedback';

const OPERATORS = [['mtn', 'MTN Mobile Money'], ['orange', 'Orange Money']];
const input = 'mt-1 h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base';

export default function Reserve() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [load, setLoad] = useState({ loading: true, listing: null, error: '' });
  const [operator, setOperator] = useState('mtn');
  const [phone, setPhone] = useState(user?.phone || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null); // paiement lancé
  const [demo, setDemo] = useState(false);
  const [failed, setFailed] = useState('');
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    api.get(`/listings/${id}`).then((d) => setLoad({ loading: false, listing: d.listing, error: '' }))
      .catch((e) => setLoad({ loading: false, listing: null, error: e.status === 404 ? '404' : e.message }));
  }, [id]);

  // Attente de la validation sur le téléphone : on interroge le serveur toutes les 3 secondes.
  useEffect(() => {
    if (!booking || failed) return;
    const t = setInterval(async () => {
      try {
        const d = await api.get(`/bookings/${booking._id}`);
        if (d.booking.paymentStatus === 'success') { toast('Réservation confirmée'); navigate(`/reservations/${booking._id}`, { replace: true }); }
        if (d.booking.paymentStatus === 'failed') setFailed(d.booking.failureReason || 'Le paiement a échoué.');
      } catch { /* on réessaie au prochain passage */ }
    }, 3000);
    return () => clearInterval(t);
  }, [booking, failed]); // eslint-disable-line react-hooks/exhaustive-deps

  if (load.loading) return <PageLoader label="Préparation de la réservation…" />;
  if (load.error === '404') return <div className="px-4 py-12"><EmptyState icon={SearchX} title="Logement introuvable" actions={<ButtonLink to="/logements">Voir les logements</ButtonLink>} /></div>;
  if (load.error) return <div className="px-4 py-12"><ErrorState message={load.error} onRetry={() => { fetched.current = false; setLoad({ loading: true, listing: null, error: '' }); window.location.reload(); }} /></div>;

  const l = load.listing;
  const amount = l.pricing.deposit > 0 ? l.pricing.deposit : l.pricing.price; // même règle que le serveur
  if (l.status !== 'available') {
    return <div className="px-4 py-12"><EmptyState icon={XCircle} title="Ce logement est déjà réservé" text="Un autre étudiant a été plus rapide. D'autres logements vous attendent."
      actions={<ButtonLink to="/logements">Voir les logements</ButtonLink>} /></div>;
  }

  const pay = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const d = await api.post('/bookings', { listingId: l._id, operator, phone });
      setBooking(d.booking); setDemo(d.demo);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  const simulate = async (outcome) => {
    try {
      const d = await api.post(`/bookings/${booking._id}/simulate`, { outcome });
      if (d.booking.paymentStatus === 'success') { toast('Réservation confirmée'); navigate(`/reservations/${booking._id}`, { replace: true }); }
      else setFailed(d.booking.failureReason || 'Le paiement a échoué.');
    } catch (err) { toast(err.message, 'error'); }
  };

  const summary = (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
      <h2 className="font-bold">{l.title}</h2>
      <p className="text-sm text-slate-600">{l.neighborhood}</p>
      <div className="mt-3 flex items-baseline justify-between border-t border-slate-200 pt-3">
        <span className="text-slate-600">Acompte pour bloquer le logement</span><b className="text-xl text-brand">{fcfa(amount)}</b>
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-5 md:py-10">
      <h1 className="mb-4 text-2xl font-extrabold md:text-3xl">Payer l'acompte</h1>
      {summary}

      {!booking && (
        <form onSubmit={pay} className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
          <fieldset>
            <legend className="mb-2 font-bold">Opérateur Mobile Money</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {OPERATORS.map(([v, label]) => (
                <label key={v} className={`flex h-14 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 font-semibold ${operator === v ? 'border-brand bg-blue-50' : 'border-slate-300'}`}>
                  <input type="radio" name="op" value={v} checked={operator === v} onChange={() => setOperator(v)} />{label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block text-sm font-semibold">Numéro qui paie
            <input className={input} type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="677 12 34 56" autoComplete="tel" />
          </label>
          <p className="text-sm text-slate-600">Vous validerez le paiement sur votre téléphone. Le reçu PDF est créé dès que le paiement réussit.</p>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Envoi…' : `Payer ${fcfa(amount)}`}</Button>
        </form>
      )}

      {booking && !failed && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <Loader label="En attente de votre validation…" />
          <p className="mt-4 flex items-center justify-center gap-2 font-semibold"><Smartphone size={18} aria-hidden="true" />Confirmez le paiement sur votre téléphone ({OPERATORS.find(([v]) => v === operator)[1]}).</p>
          <p className="mt-1 text-sm text-slate-600">Cette page se met à jour toute seule. Ne la fermez pas.</p>
          {demo && (
            <div className="mt-5 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-4">
              <p className="mb-3 text-sm font-bold text-amber-900">Mode démonstration : aucun vrai paiement.</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => simulate('success')}>Simuler un paiement réussi</Button>
                <Button variant="outline" onClick={() => simulate('failed')}>Simuler un échec</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {failed && (
        <div className="mt-4"><EmptyState icon={XCircle} title="Le paiement n'a pas abouti" text={failed}
          actions={<Button onClick={() => { setFailed(''); setBooking(null); }}>Réessayer</Button>} /></div>
      )}
    </div>
  );
}

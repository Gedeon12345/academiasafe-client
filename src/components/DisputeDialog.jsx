import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from './ui';

const REASONS = {
  student: [['listing_mismatch', "Le logement ne correspond pas à l'annonce"], ['landlord_unreachable', 'Bailleur injoignable'], ['deposit_issue', "Problème d'acompte ou de caution"], ['fraud_suspicion', "Suspicion d'arnaque"], ['other', 'Autre']],
  landlord: [['tenant_unreachable', 'Étudiant injoignable'], ['deposit_issue', "Problème d'acompte ou de caution"], ['fraud_suspicion', "Suspicion d'arnaque"], ['other', 'Autre']],
};

// Signalement d'un problème sur une réservation payée : examiné par l'équipe, qui prévient les deux parties.
export default function DisputeDialog({ open, onClose, bookingId }) {
  const { user } = useAuth();
  const toast = useToast();
  const list = REASONS[user?.role] || REASONS.student;
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (open) { setReason(list[0][0]); setDescription(''); setError(''); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!open) return null;

  const send = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try { await api.post('/disputes', { bookingId, reason, description }); toast('Signalement envoyé. Notre équipe vous répond rapidement.'); onClose(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 sm:items-center sm:p-4" onClick={onClose}>
      <form onSubmit={send} role="dialog" aria-modal="true" aria-labelledby="dd-title" onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full animate-pop overflow-y-auto rounded-t-2xl bg-white p-5 sm:max-w-lg sm:rounded-2xl">
        <h2 id="dd-title" className="text-xl font-extrabold">Signaler un problème</h2>
        <p className="mt-1 text-sm text-slate-600">Notre équipe examine le signalement et prévient les deux parties de sa décision.</p>
        <label className="mt-4 block text-sm font-semibold">Motif
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base">{list.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </label>
        <label className="mt-3 block text-sm font-semibold">Description
          <textarea required minLength={10} maxLength={1500} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 h-36 w-full rounded-lg border border-slate-300 p-3 text-base" placeholder="Que s'est-il passé ? Dates, échanges, éléments utiles…" />
        </label>
        {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
        <div className="mt-4 flex gap-3"><Button type="button" variant="outline" className="flex-1" onClick={onClose}>Annuler</Button><Button type="submit" className="flex-1" disabled={busy}>{busy ? 'Envoi…' : 'Envoyer'}</Button></div>
      </form>
    </div>
  );
}

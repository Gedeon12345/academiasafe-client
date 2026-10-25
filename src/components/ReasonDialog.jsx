import { useEffect, useState } from 'react';
import { Button } from './ui';

// Demande un motif écrit avant une action qui touche quelqu'un (refus, suspension, décision).
export default function ReasonDialog({ open, title, text, confirmLabel = 'Confirmer', danger, busy, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  useEffect(() => { if (open) setReason(''); }, [open]);
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-4 sm:items-center" onClick={onCancel}>
      <form onSubmit={(e) => { e.preventDefault(); onConfirm(reason.trim()); }} role="dialog" aria-modal="true" aria-labelledby="rd-title" onClick={(e) => e.stopPropagation()} className="w-full max-w-md animate-pop rounded-2xl bg-white p-5">
        <h2 id="rd-title" className="text-lg font-extrabold">{title}</h2>
        {text && <p className="mt-1 text-sm text-slate-600">{text}</p>}
        <label className="mt-3 block text-sm font-semibold">Motif (envoyé à la personne concernée)
          <textarea required minLength={5} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 h-28 w-full rounded-lg border border-slate-300 p-3 text-base" />
        </label>
        <div className="mt-4 flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={busy}>Annuler</Button>
          <button type="submit" disabled={busy} className={`h-12 flex-1 rounded-xl font-bold text-white disabled:opacity-50 ${danger ? 'bg-red-700' : 'bg-brand'}`}>{busy ? '…' : confirmLabel}</button>
        </div>
      </form>
    </div>
  );
}

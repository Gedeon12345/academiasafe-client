import { useEffect } from 'react';
import { Button } from './ui';

export default function ConfirmDialog({ open, title, text, confirmLabel = 'Confirmer', busy, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-4 sm:items-center" onClick={onCancel}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="cd-title" onClick={(e) => e.stopPropagation()} className="w-full max-w-sm animate-pop rounded-2xl bg-white p-5">
        <h2 id="cd-title" className="text-lg font-extrabold">{title}</h2>
        <p className="mt-2 text-slate-600">{text}</p>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={busy}>Annuler</Button>
          <button onClick={onConfirm} disabled={busy} className="h-12 flex-1 rounded-xl bg-red-700 font-bold text-white disabled:opacity-50">{busy ? '…' : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

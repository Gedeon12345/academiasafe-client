import { useEffect, useState } from 'react';
import { Send, X } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Button } from './ui';

// Écrire à un bailleur ou à un colocataire. Le message est enregistré, puis la personne est prévenue par WhatsApp ou SMS.
export default function ContactDialog({ open, onClose, endpoint, title, hint }) {
  const toast = useToast();
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setBody(''); setError('');
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!open) return null;

  const send = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try { await api.post(endpoint, { body }); toast('Message envoyé. La personne a été prévenue.'); onClose(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 sm:items-center sm:p-4" onClick={onClose}>
      <form onSubmit={send} role="dialog" aria-modal="true" aria-labelledby="ct-title" onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full animate-pop overflow-y-auto rounded-t-2xl bg-white p-5 sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <h2 id="ct-title" className="text-xl font-extrabold">{title}</h2>
          <button type="button" aria-label="Fermer" onClick={onClose} className="-mr-2 -mt-2 flex h-11 w-11 items-center justify-center"><X /></button>
        </div>
        {hint && <p className="mt-1 text-sm text-slate-600">{hint}</p>}
        <label className="mt-4 block text-sm font-semibold">Votre message
          <textarea required minLength={5} maxLength={1000} value={body} onChange={(e) => setBody(e.target.value)} className="mt-1 h-36 w-full rounded-lg border border-slate-300 p-3 text-base"
            placeholder="Bonjour, le logement est-il toujours disponible ? Peut-on le visiter cette semaine ?" />
          <span className="block text-right text-xs font-normal text-slate-600">{body.length} / 1000</span>
        </label>
        <p className="mt-1 text-xs text-slate-600">Votre nom et votre numéro de téléphone seront transmis pour que la personne puisse vous répondre.</p>
        {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
        <Button type="submit" className="mt-4 w-full" disabled={busy}><Send size={18} className="mr-2" aria-hidden="true" />{busy ? 'Envoi…' : 'Envoyer le message'}</Button>
      </form>
    </div>
  );
}

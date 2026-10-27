import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, X } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Button } from './ui';

// Premier message à un bailleur ou à un colocataire : il ouvre une discussion dans la messagerie de l'application.
// `start` décrit le sujet, par exemple { kind: 'listing', listingId } ou { kind: 'roommate', profileId }.
export default function ContactDialog({ open, onClose, start, title, hint }) {
  const toast = useToast();
  const navigate = useNavigate();
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
  if (!open || !start) return null;

  const send = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const d = await api.post('/chat/conversations', { ...start, body });
      toast('Message envoyé');
      onClose();
      navigate(`/messages/${d.conversation._id}`);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
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
          <textarea required maxLength={1000} value={body} onChange={(e) => setBody(e.target.value)} className="mt-1 h-36 w-full rounded-lg border border-slate-300 p-3 text-base"
            placeholder="Bonjour, le logement est-il toujours disponible ? Peut-on le visiter cette semaine ?" />
          <span className="block text-right text-xs font-normal text-slate-600">{body.length} / 1000</span>
        </label>
        <p className="mt-1 text-xs text-slate-600">La discussion se poursuit dans votre messagerie. Votre numéro de téléphone n'est pas communiqué.</p>
        {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
        <Button type="submit" className="mt-4 w-full" disabled={busy}><Send size={18} className="mr-2" aria-hidden="true" />{busy ? 'Envoi…' : 'Envoyer le message'}</Button>
      </form>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, Check, FileText, Hourglass, Lock, XCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui';
import { ErrorState, PageLoader } from '../../components/feedback';

const TYPES = ['identity', 'ownership', 'address'];
const HELP = { identity: 'Recto et verso sur le même fichier si possible.', ownership: 'Titre foncier, attestation de propriété, bail principal ou mandat de gestion.', address: 'Facture d’eau ou d’électricité récente, ou attestation de domicile.' };

export default function Certification() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [state, setState] = useState({ loading: true, v: null, types: {}, error: '' });
  const [busyType, setBusyType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tries, setTries] = useState(0);
  const inputs = useRef({});

  useEffect(() => {
    api.get('/verification/mine').then((d) => { setState({ loading: false, v: d.verification, types: d.types, error: '' }); if (d.verification.status === 'approved' && !user.isIdentityVerified) refreshUser(); })
      .catch((e) => setState({ loading: false, v: null, types: {}, error: e.message }));
  }, [tries]); // eslint-disable-line react-hooks/exhaustive-deps

  if (state.loading) return <PageLoader label="Chargement de votre dossier…" />;
  if (state.error) return <div className="px-4 py-12"><ErrorState message={state.error} onRetry={() => setTries((t) => t + 1)} /></div>;
  const { v, types } = state;
  const locked = ['pending', 'approved'].includes(v.status);
  const doc = (t) => v.documents.find((d) => d.type === t);
  const complete = TYPES.every(doc);

  const upload = async (type, file) => {
    if (!file) return;
    setBusyType(type);
    try { const fd = new FormData(); fd.append('type', type); fd.append('file', file); const d = await api.post('/verification/documents', fd); setState((s) => ({ ...s, v: d.verification })); toast('Pièce enregistrée'); }
    catch (e) { toast(e.message, 'error'); } finally { setBusyType(''); if (inputs.current[type]) inputs.current[type].value = ''; }
  };
  const submit = async () => {
    setSubmitting(true);
    try { const d = await api.post('/verification/submit', {}); setState((s) => ({ ...s, v: d.verification })); toast('Dossier envoyé à notre équipe'); }
    catch (e) { toast(e.message, 'error'); } finally { setSubmitting(false); }
  };

  const banner = {
    draft: [Lock, 'bg-blue-50 text-brand', 'Complétez les 3 pièces ci-dessous, puis envoyez votre dossier.'],
    pending: [Hourglass, 'bg-amber-100 text-amber-900', 'Dossier en cours d’examen. Vous serez prévenu par WhatsApp ou SMS.'],
    approved: [BadgeCheck, 'bg-safe-soft text-safe-dark', 'Compte certifié : le badge « identité vérifiée » apparaît sur vos annonces.'],
    rejected: [XCircle, 'bg-red-50 text-red-700', `Dossier refusé : ${v.rejectionReason}. Remplacez les pièces concernées puis renvoyez-le.`],
  }[v.status];
  const Icon = banner[0];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10">
      <h1 className="text-2xl font-extrabold md:text-3xl">Certification de mon compte</h1>
      <p className="mt-1 text-slate-600">Un bailleur certifié rassure les étudiants et reçoit plus de demandes. Vos pièces ne sont jamais publiques : seule notre équipe les consulte.</p>
      <p className={`mt-5 flex items-start gap-3 rounded-2xl p-4 font-semibold ${banner[1]}`}><Icon className="mt-0.5 flex-none" aria-hidden="true" />{banner[2]}</p>

      <ul className="mt-5 space-y-3">
        {TYPES.map((t) => {
          const d = doc(t);
          return (
            <li key={t} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full ${d ? 'bg-safe-dark text-white' : 'bg-slate-200 text-slate-600'}`}>{d ? <Check size={16} strokeWidth={3} aria-label="Fourni" /> : <FileText size={16} aria-hidden="true" />}</span>
                <div className="min-w-0 flex-1"><b>{types[t]}</b><p className="text-sm text-slate-600">{HELP[t]}</p>{d && <p className="mt-1 truncate text-sm font-semibold text-safe-dark">{d.originalName}</p>}</div>
              </div>
              {!locked && (
                <label className="mt-3 flex h-11 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-400 text-sm font-bold text-brand">
                  {busyType === t ? 'Envoi…' : d ? 'Remplacer le fichier' : 'Choisir un fichier'}
                  <input ref={(el) => (inputs.current[t] = el)} type="file" accept="image/jpeg,image/png,application/pdf" className="sr-only" disabled={!!busyType} onChange={(e) => upload(t, e.target.files[0])} />
                </label>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-slate-600">JPG, PNG ou PDF, 5 Mo maximum par fichier.</p>
      {!locked && <Button className="mt-5 w-full sm:w-auto sm:px-10" disabled={!complete || submitting} onClick={submit}>{submitting ? 'Envoi…' : 'Envoyer mon dossier'}</Button>}
    </div>
  );
}

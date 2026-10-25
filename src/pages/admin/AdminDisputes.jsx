import { useState } from 'react';
import { Scale } from 'lucide-react';
import { api } from '../../lib/api';
import { fcfa } from '../../lib/format';
import { useApi } from '../../lib/useApi';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui';
import { EmptyState, ErrorState, PageLoader } from '../../components/feedback';
import { Tabs, when } from '../../components/admin';

const ROLE = { student: 'Étudiant', landlord: 'Bailleur' };

function Card({ d, onDone }) {
  const toast = useToast();
  const [status, setStatus] = useState(d.status === 'open' ? 'in_review' : d.status);
  const [resolution, setResolution] = useState(d.resolution || '');
  const [busy, setBusy] = useState(false);
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api.patch(`/admin/disputes/${d._id}`, { status, resolution }); toast('Décision enregistrée, les deux parties sont prévenues'); onDone(); }
    catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  };
  const party = (u, label) => <p className="text-sm"><span className="text-slate-600">{label} : </span><b>{u?.name}</b> ({ROLE[u?.role]}) · {u?.phone}</p>;
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-600">{when(d.createdAt)} · reçu n° {d.booking?.receiptNumber}</p>
      <h2 className="font-bold">{d.reasonLabel}</h2>
      <p className="text-sm text-slate-600">{d.booking?.snapshot?.title} · acompte {fcfa(d.booking?.amountPaid || 0)}</p>
      <p className="mt-2 whitespace-pre-line rounded-xl bg-slate-50 p-3 text-sm">{d.description}</p>
      <div className="mt-2">{party(d.openedBy, 'Signalé par')}{party(d.against, 'Concerne')}</div>
      <form onSubmit={save} className="mt-3 space-y-2 border-t border-slate-200 pt-3">
        <label className="block text-sm font-semibold">Statut
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-slate-300 bg-white px-3">
            <option value="in_review">En cours d'examen</option><option value="resolved">Résolu</option><option value="rejected">Clos sans suite</option>
          </select>
        </label>
        {status !== 'in_review' && <label className="block text-sm font-semibold">Décision (envoyée aux deux parties)<textarea required minLength={5} maxLength={500} value={resolution} onChange={(e) => setResolution(e.target.value)} className="mt-1 h-24 w-full rounded-lg border border-slate-300 p-3" /></label>}
        <Button type="submit" className="h-11 w-full text-sm" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</Button>
      </form>
    </article>
  );
}

export default function AdminDisputes() {
  const [status, setStatus] = useState('open');
  const [s, reload] = useApi(`/admin/disputes?status=${status}`);
  return (
    <div className="px-4 py-5 md:px-6 md:py-8 xl:px-10">
      <h1 className="mb-4 text-2xl font-extrabold md:text-3xl">Litiges</h1>
      <Tabs value={status} onChange={setStatus} items={[['open', 'Ouverts'], ['in_review', 'En cours'], ['resolved', 'Résolus'], ['rejected', 'Clos']]} />
      {s.loading && <PageLoader label="Chargement des litiges…" />}
      {s.error && <ErrorState message={s.error} onRetry={reload} />}
      {s.data && (s.data.data.length === 0
        ? <EmptyState icon={Scale} title="Aucun litige ici" text="Les signalements des étudiants et des bailleurs apparaîtront dans cette liste." />
        : <div className="grid gap-4 xl:grid-cols-2">{s.data.data.map((d) => <Card key={d._id} d={d} onDone={reload} />)}</div>)}
    </div>
  );
}

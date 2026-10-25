import { useState } from 'react';
import { FileText, ShieldCheck } from 'lucide-react';
import { api, viewFile } from '../../lib/api';
import { useApi } from '../../lib/useApi';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui';
import { EmptyState, ErrorState, PageLoader } from '../../components/feedback';
import ReasonDialog from '../../components/ReasonDialog';
import { Tabs, when } from '../../components/admin';

export default function AdminVerifications() {
  const toast = useToast();
  const [status, setStatus] = useState('pending');
  const [s, reload] = useApi(`/admin/verifications?status=${status}`);
  const [rejecting, setRejecting] = useState(null);
  const [busy, setBusy] = useState(false);

  const decide = async (v, action, reason) => {
    setBusy(true);
    try { await api.patch(`/admin/verifications/${v._id}`, { action, reason }); toast(action === 'approve' ? 'Bailleur certifié' : 'Dossier refusé'); setRejecting(null); reload(); }
    catch (e) { toast(e.message, 'error'); } finally { setBusy(false); }
  };
  const open = (v, d) => viewFile(`/admin/verifications/${v._id}/documents/${d._id}`).catch((e) => toast(e.message, 'error'));

  return (
    <div className="px-4 py-5 md:px-6 md:py-8 xl:px-10">
      <h1 className="text-2xl font-extrabold md:text-3xl">Certification des bailleurs</h1>
      <p className="mb-4 mt-1 text-slate-600">Contrôlez chaque pièce avant de certifier. Chaque consultation est enregistrée.</p>
      <Tabs value={status} onChange={setStatus} items={[['pending', 'À vérifier'], ['approved', 'Certifiés'], ['rejected', 'Refusés']]} />
      {s.loading && <PageLoader label="Chargement des dossiers…" />}
      {s.error && <ErrorState message={s.error} onRetry={reload} />}
      {s.data && (s.data.data.length === 0
        ? <EmptyState icon={ShieldCheck} title="Aucun dossier ici" text={status === 'pending' ? 'Aucun bailleur n’attend de vérification.' : 'Rien dans cette catégorie.'} />
        : (
          <div className="grid gap-4 xl:grid-cols-2">
            {s.data.data.map((v) => (
              <article key={v._id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <h2 className="font-bold">{v.landlord?.name}</h2>
                <p className="text-sm text-slate-600">{v.landlord?.phone} · {v.landlord?.email}</p>
                <p className="text-sm text-slate-600">Envoyé le {v.submittedAt && when(v.submittedAt)}</p>
                <ul className="mt-3 space-y-2">
                  {v.documents.map((d) => (
                    <li key={d._id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2">
                      <span className="flex min-w-0 items-center gap-2 text-sm"><FileText size={16} className="flex-none text-brand" aria-hidden="true" /><span className="min-w-0"><b className="block">{v.docLabels[d.type]}</b><span className="block truncate text-xs text-slate-600">{d.originalName}</span></span></span>
                      <Button variant="outline" className="h-11 flex-none text-sm" onClick={() => open(v, d)}>Ouvrir</Button>
                    </li>
                  ))}
                </ul>
                {v.rejectionReason && <p className="mt-2 text-sm font-semibold text-red-700">Motif du refus : {v.rejectionReason}</p>}
                {status === 'pending' && (
                  <div className="mt-3 flex gap-2"><Button className="h-11 flex-1 text-sm" disabled={busy} onClick={() => decide(v, 'approve')}>Certifier ce bailleur</Button><Button variant="outline" className="h-11 flex-1 text-sm" onClick={() => setRejecting(v)}>Refuser</Button></div>
                )}
              </article>
            ))}
          </div>
        ))}
      <ReasonDialog open={!!rejecting} danger busy={busy} title="Refuser ce dossier ?" text="Le bailleur sera prévenu et pourra corriger ses pièces." confirmLabel="Refuser" onConfirm={(r) => decide(rejecting, 'reject', r)} onCancel={() => setRejecting(null)} />
    </div>
  );
}

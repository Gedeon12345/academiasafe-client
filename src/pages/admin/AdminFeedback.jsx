import { useState } from 'react';
import { Download, MessageSquareText, Trash2 } from 'lucide-react';
import { api, download, viewFile } from '../../lib/api';
import { useApi } from '../../lib/useApi';
import { useToast } from '../../context/ToastContext';
import { Button, Stars } from '../../components/ui';
import { EmptyState, ErrorState, PageLoader } from '../../components/feedback';
import ExpandableText from '../../components/ExpandableText';
import ConfirmDialog from '../../components/ConfirmDialog';
import ProtectedImage from '../../components/ProtectedImage';
import { Pager, Pill, Tabs, when } from '../../components/admin';

const TYPE = { compliment: ['Compliment', 'bg-safe-soft text-safe-dark'], suggestion: ['Suggestion', 'bg-blue-50 text-brand'], bug: ['Problème', 'bg-red-50 text-red-700'], critique: ['Critique', 'bg-amber-100 text-amber-900'] };
const ROLE = { student: 'Étudiant', landlord: 'Bailleur', admin: 'Admin' };

function Card({ f, onChange, onDelete }) {
  const toast = useToast();
  const [note, setNote] = useState(f.adminNote || '');
  const [busy, setBusy] = useState(false);
  const save = async (patch, ok) => {
    setBusy(true);
    try { await api.patch(`/admin/feedback/${f._id}`, patch); toast(ok); onChange(); } catch (e) { toast(e.message, 'error'); } finally { setBusy(false); }
  };
  const [label, cls] = TYPE[f.type];
  const photoPath = (id) => `/admin/feedback/${f._id}/photos/${id}`;
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Pill cls={cls}>{label}</Pill>{f.rating && <Stars value={f.rating} />}
        <span className="ml-auto text-xs text-slate-600">{when(f.createdAt)}</span>
      </div>
      <div className="mt-3"><ExpandableText text={f.message} /></div>
      {f.photos.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {f.photos.map((id) => <ProtectedImage key={id} path={photoPath(id)} className="h-24 w-24 rounded-xl object-cover" onClick={() => viewFile(photoPath(id)).catch((e) => toast(e.message, 'error'))} />)}
        </div>
      )}
      <dl className="mt-3 space-y-0.5 text-sm text-slate-600">
        <div><dt className="inline font-semibold">De : </dt><dd className="inline">{f.name || 'Visiteur anonyme'}{f.role && ` (${ROLE[f.role]})`}{f.email && <> · <a href={`mailto:${f.email}?subject=${encodeURIComponent('Votre avis sur AcademiaSafe')}`} className="font-bold text-brand">{f.email}</a></>}</dd></div>
        {f.page && <div><dt className="inline font-semibold">Page : </dt><dd className="inline">{f.page}</dd></div>}
        {f.screen && <div><dt className="inline font-semibold">Écran : </dt><dd className="inline">{f.screen}</dd></div>}
      </dl>
      <label className="mt-3 block text-sm font-semibold">Note interne
        <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} className="mt-1 h-16 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm font-normal" placeholder="Ce que vous comptez en faire…" />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        {note !== (f.adminNote || '') && <Button variant="outline" className="h-11 text-sm" disabled={busy} onClick={() => save({ adminNote: note }, 'Note enregistrée')}>Enregistrer la note</Button>}
        {f.status === 'new' && <Button className="h-11 text-sm" disabled={busy} onClick={() => save({ status: 'read' }, 'Marqué comme lu')}>Marquer comme lu</Button>}
        {f.status !== 'done' && <Button variant={f.status === 'new' ? 'outline' : 'primary'} className="h-11 text-sm" disabled={busy} onClick={() => save({ status: 'done' }, 'Marqué comme traité')}>Traité</Button>}
        {f.status !== 'new' && <Button variant="outline" className="h-11 text-sm" disabled={busy} onClick={() => save({ status: 'new' }, 'Remis dans les nouveaux')}>Remettre en nouveau</Button>}
        <button type="button" aria-label="Supprimer cet avis" onClick={() => onDelete(f)} className="ml-auto flex h-11 w-11 items-center justify-center rounded-lg text-red-700 hover:bg-red-50"><Trash2 size={20} /></button>
      </div>
    </article>
  );
}

export default function AdminFeedback() {
  const toast = useToast();
  const [status, setStatus] = useState('new');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [s, reload] = useApi(`/admin/feedback?status=${status}&type=${type}&page=${page}`);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try { await api.del(`/admin/feedback/${toDelete._id}`); toast('Avis supprimé'); setToDelete(null); reload(); } catch (e) { toast(e.message, 'error'); } finally { setBusy(false); }
  };

  return (
    <div className="px-4 py-5 md:px-6 md:py-8 xl:px-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold md:text-3xl">Avis sur le site</h1>
        <Button variant="outline" className="h-11 text-sm" onClick={() => download('/admin/feedback/export.csv', 'avis-academiasafe.csv').catch((e) => toast(e.message, 'error'))}><Download size={16} className="mr-2" aria-hidden="true" />Exporter (Excel)</Button>
      </div>
      <Tabs value={status} onChange={(v) => { setStatus(v); setPage(1); }} items={[['new', 'Nouveaux'], ['read', 'Lus'], ['done', 'Traités']]} />
      <select aria-label="Filtrer par type" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="mb-5 h-12 rounded-lg border border-slate-300 bg-white px-3">
        <option value="">Tous les types</option><option value="compliment">Compliments</option><option value="suggestion">Suggestions</option><option value="bug">Problèmes</option><option value="critique">Critiques</option>
      </select>
      {s.loading && <PageLoader label="Chargement des avis…" />}
      {s.error && <ErrorState message={s.error} onRetry={reload} />}
      {s.data && (s.data.data.length === 0
        ? <EmptyState icon={MessageSquareText} title="Aucun avis ici" text={status === 'new' ? "Tous les avis ont été lus. Partagez le lien de la page « Donner mon avis » avec vos testeurs !" : 'Rien dans cette catégorie.'} />
        : <div className="grid gap-4 xl:grid-cols-2">{s.data.data.map((f) => <Card key={f._id} f={f} onChange={reload} onDelete={setToDelete} />)}</div>)}
      {s.data && <Pager page={page} pages={s.data.pages} onChange={setPage} />}
      <ConfirmDialog open={!!toDelete} busy={busy} title="Supprimer cet avis ?" text="Le message et ses photos seront supprimés définitivement." confirmLabel="Supprimer" onConfirm={remove} onCancel={() => setToDelete(null)} />
    </div>
  );
}

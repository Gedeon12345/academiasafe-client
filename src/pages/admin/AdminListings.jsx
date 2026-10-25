import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, BadgeCheck } from 'lucide-react';
import { api, assetUrl } from '../../lib/api';
import { priceLabel } from '../../lib/format';
import { useApi } from '../../lib/useApi';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui';
import { EmptyState, ErrorState, PageLoader } from '../../components/feedback';
import ExpandableText from '../../components/ExpandableText';
import ReasonDialog from '../../components/ReasonDialog';
import { Pager, Pill, Tabs } from '../../components/admin';

const TABS = [['pending', 'En attente'], ['approved', 'Publiées'], ['rejected', 'Refusées'], ['suspended', 'Suspendues']];

export default function AdminListings() {
  const toast = useToast();
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [s, reload] = useApi(`/admin/listings?status=${status}&page=${page}&q=${encodeURIComponent(q)}`);
  const [rejecting, setRejecting] = useState(null);
  const [busy, setBusy] = useState(false);

  const act = async (fn, ok) => { setBusy(true); try { await fn(); toast(ok); setRejecting(null); reload(); } catch (e) { toast(e.message, 'error'); } finally { setBusy(false); } };
  const approve = (l) => act(() => api.patch(`/admin/listings/${l._id}/moderate`, { action: 'approve' }), 'Annonce publiée');
  const reject = (reason) => act(() => api.patch(`/admin/listings/${rejecting._id}/moderate`, { action: 'reject', reason }), 'Annonce refusée');
  const certify = (l, on) => act(() => api.patch(`/admin/listings/${l._id}/certify`, { certified: on }), on ? 'Badge attribué' : 'Badge retiré');

  return (
    <div className="px-4 py-5 md:px-6 md:py-8 xl:px-10">
      <h1 className="text-2xl font-extrabold md:text-3xl">Annonces</h1>
      <div className="mb-4 mt-4"><Tabs value={status} onChange={(v) => { setStatus(v); setPage(1); }} items={TABS} /></div>
      <input type="search" aria-label="Rechercher une annonce" placeholder="Rechercher par titre…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="mb-5 h-12 w-full max-w-md rounded-lg border border-slate-300 bg-white px-3" />

      {s.loading && <PageLoader label="Chargement des annonces…" />}
      {s.error && <ErrorState message={s.error} onRetry={reload} />}
      {s.data && (s.data.data.length === 0
        ? <EmptyState icon={Check} title="Rien à afficher ici" text={status === 'pending' ? 'Toutes les annonces ont été traitées. Beau travail !' : 'Aucune annonce dans cette catégorie.'} />
        : (
          <div className="grid gap-4 xl:grid-cols-2">
            {s.data.data.map((l) => (
              <article key={l._id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
                <div className="h-40 w-full flex-none overflow-hidden rounded-xl bg-blue-100 sm:h-auto sm:w-44">{l.images?.[0] && <img src={assetUrl(l.images[0])} alt="" className="h-full w-full object-cover" />}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">{l.isCertified && <Pill cls="bg-safe-dark text-white">Certifiée</Pill>}{l.landlord?.isIdentityVerified && <Pill cls="bg-safe-soft text-safe-dark">Bailleur vérifié</Pill>}<span className="text-xs text-slate-600">{l.images?.length || 0} photo(s)</span></div>
                  <h2 className="mt-1 font-bold">{l.title}</h2>
                  <p className="text-sm text-slate-600">{priceLabel(l.pricing)} · {l.neighborhood} · {String(l.distanceToCampusKm).replace('.', ',')} km de {l.campusTarget}</p>
                  <p className="text-sm text-slate-600">Bailleur : {l.landlord?.name} · {l.landlord?.phone}</p>
                  {l.description && <div className="mt-2 text-sm"><ExpandableText text={l.description} /></div>}
                  {l.amenities?.length > 0 && <p className="mt-1 text-xs text-slate-600">{l.amenities.join(' · ')}</p>}
                  {l.rejectionReason && <p className="mt-2 text-sm font-semibold text-red-700">Motif : {l.rejectionReason}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {status !== 'approved' && status !== 'suspended' && <Button className="h-11 text-sm" disabled={busy} onClick={() => approve(l)}>{status === 'rejected' ? 'Réapprouver' : 'Approuver'}</Button>}
                    {status === 'pending' && <Button variant="outline" className="h-11 text-sm" onClick={() => setRejecting(l)}>Refuser</Button>}
                    {status === 'approved' && (<>
                      <Button variant={l.isCertified ? 'outline' : 'primary'} className="h-11 text-sm" disabled={busy} onClick={() => certify(l, !l.isCertified)}><BadgeCheck size={16} className="mr-2" aria-hidden="true" />{l.isCertified ? 'Retirer le badge' : 'Attribuer le badge'}</Button>
                      <Button variant="outline" className="h-11 text-sm" onClick={() => setRejecting(l)}>Retirer de la vente</Button>
                      <Link to={`/logements/${l._id}`} className="flex h-11 items-center px-2 text-sm font-bold text-brand">Voir</Link>
                    </>)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ))}
      {s.data && <Pager page={page} pages={s.data.pages} onChange={setPage} />}
      <ReasonDialog open={!!rejecting} danger busy={busy} title="Refuser cette annonce ?" text={rejecting?.title} confirmLabel="Refuser" onConfirm={reject} onCancel={() => setRejecting(null)} />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Eye, Heart, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { api, assetUrl } from '../../lib/api';
import { priceLabel } from '../../lib/format';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { ButtonLink } from '../../components/ui';
import { EmptyState, ErrorState, PageLoader } from '../../components/feedback';
import ConfirmDialog from '../../components/ConfirmDialog';

const APPROVAL = {
  approved: ['Publiée', 'bg-safe-soft text-safe-dark'],
  pending: ["En attente d'approbation", 'bg-amber-100 text-amber-900'],
  rejected: ['Refusée', 'bg-red-50 text-red-700'],
  suspended: ['Suspendue', 'bg-red-50 text-red-700'],
};
const Pill = ({ cls, children }) => <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${cls}`}>{children}</span>;

export default function MyListings() {
  const toast = useToast();
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, data: [], error: '' });
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setState({ loading: true, data: [], error: '' });
    api.get('/listings/mine').then((d) => setState({ loading: false, data: d.data, error: '' }))
      .catch((e) => setState({ loading: false, data: [], error: e.message }));
  };
  useEffect(load, []);

  const setStatus = async (l, status) => {
    try {
      const d = await api.patch(`/listings/${l._id}`, { status });
      setState((s) => ({ ...s, data: s.data.map((x) => (x._id === l._id ? d.listing : x)) }));
      toast('Disponibilité mise à jour');
    } catch (e) { toast(e.message, 'error'); }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await api.del(`/listings/${toDelete._id}`);
      setState((s) => ({ ...s, data: s.data.filter((x) => x._id !== toDelete._id) }));
      toast('Annonce supprimée');
      setToDelete(null);
    } catch (e) { toast(e.message, 'error'); } finally { setBusy(false); }
  };

  if (state.loading) return <PageLoader label="Chargement de vos annonces…" />;
  if (state.error) return <div className="px-4 py-12"><ErrorState message={state.error} onRetry={load} /></div>;

  const { data } = state;
  const views = data.reduce((n, l) => n + l.viewsCount, 0);
  const rated = data.filter((l) => l.reviewsCount > 0);
  const avg = rated.length ? (rated.reduce((n, l) => n + l.averageRating, 0) / rated.length).toFixed(1).replace('.', ',') : '–';

  return (
    <div className="px-4 py-5 md:px-6 md:py-8 xl:px-10">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold md:text-3xl">Mes annonces</h1>
        {data.length > 0 && <ButtonLink to="/bailleur/annonces/nouvelle"><Plus size={18} aria-hidden="true" />Nouvelle annonce</ButtonLink>}
      </div>

      {!user.isIdentityVerified && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/40 bg-blue-50 p-4">
          <p className="font-semibold">Faites certifier votre compte : le badge « identité vérifiée » rassure les étudiants.</p>
          <ButtonLink to="/bailleur/certification">Certifier mon compte</ButtonLink>
        </div>
      )}

      {data.length === 0 ? (
        <EmptyState icon={Building2} title="Votre vitrine est vide"
          text="Publiez votre première annonce : les étudiants autour de votre campus la verront tout de suite."
          actions={<ButtonLink to="/bailleur/annonces/nouvelle"><Plus size={18} aria-hidden="true" />Créer ma première annonce</ButtonLink>} />
      ) : (
        <>
          <dl className="mb-5 grid grid-cols-3 gap-3">
            {[['Annonces', data.length], ['Vues', views], ['Note moyenne', avg]].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-slate-200 bg-white p-3 text-center md:p-4">
                <dd className="text-2xl font-extrabold text-brand">{v}</dd><dt className="text-xs font-semibold text-slate-600 md:text-sm">{k}</dt>
              </div>
            ))}
          </dl>

          <div className="grid gap-3 xl:grid-cols-2">
            {data.map((l) => {
              const [label, cls] = APPROVAL[l.approvalStatus];
              return (
                <article key={l._id} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
                  <div className="relative h-24 w-24 flex-none overflow-hidden rounded-xl bg-blue-100 sm:h-28 sm:w-36">
                    {l.images?.[0] && <img src={assetUrl(l.images[0])} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5"><Pill cls={cls}>{label}</Pill>{l.isCertified && <Pill cls="bg-safe-dark text-white">Certifiée</Pill>}</div>
                    <h2 className="mt-1 truncate font-bold">{l.title}</h2>
                    {l.approvalStatus === 'rejected' && l.rejectionReason && <p className="mt-1 text-sm font-semibold text-red-700">Motif : {l.rejectionReason}</p>}
                    <p className="text-sm text-slate-600">{priceLabel(l.pricing)} · {l.neighborhood}</p>
                    <p className="mt-1 flex items-center gap-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1"><Eye size={15} aria-hidden="true" />{l.viewsCount}</span>
                      <span className="flex items-center gap-1"><Heart size={15} aria-hidden="true" />{l.likesCount}</span>
                      <span className="flex items-center gap-1"><Star size={15} aria-hidden="true" />{l.reviewsCount ? String(l.averageRating).replace('.', ',') : '–'}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <select aria-label="Disponibilité" value={l.status === 'reserved' ? 'reserved' : l.status} onChange={(e) => setStatus(l, e.target.value)}
                        className="h-11 rounded-lg border border-slate-300 bg-white px-2 text-sm font-semibold">
                        <option value="available">Disponible</option>
                        {l.status === 'reserved' && <option value="reserved" disabled>Réservé</option>}
                        <option value="rented">Loué</option>
                      </select>
                      <Link to={`/bailleur/annonces/${l._id}/modifier`} className="flex h-11 items-center gap-1.5 rounded-lg border-2 border-brand px-3 text-sm font-bold text-brand"><Pencil size={16} aria-hidden="true" />Modifier</Link>
                      {l.approvalStatus === 'approved' && <Link to={`/logements/${l._id}`} className="flex h-11 items-center px-2 text-sm font-bold text-brand">Voir</Link>}
                      <button aria-label={`Supprimer ${l.title}`} onClick={() => setToDelete(l)} className="ml-auto flex h-11 w-11 items-center justify-center rounded-lg text-red-700 hover:bg-red-50"><Trash2 size={20} /></button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      <ConfirmDialog open={!!toDelete} busy={busy} title="Supprimer cette annonce ?" confirmLabel="Supprimer"
        text={toDelete ? `« ${toDelete.title} » et ses photos seront supprimées définitivement.` : ''}
        onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  );
}

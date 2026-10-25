import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarCheck, SearchX } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Button, ButtonLink, Stars } from '../../components/ui';
import { EmptyState, ErrorState, PageLoader } from '../../components/feedback';
import ConfirmDialog from '../../components/ConfirmDialog';

const LABELS = ['', 'Décevant', 'Passable', 'Correct', 'Très bien', 'Excellent'];

export default function ReviewForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [state, setState] = useState({ loading: true, data: null, error: '' });
  const [tries, setTries] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [askDelete, setAskDelete] = useState(false);

  useEffect(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    api.get(`/listings/${id}/reviews/mine`).then((d) => {
      setState({ loading: false, data: d, error: '' });
      if (d.review) { setRating(d.review.rating); setComment(d.review.comment || ''); }
    }).catch((e) => setState({ loading: false, data: null, error: e.status === 404 ? '404' : e.message }));
  }, [id, tries]);

  if (state.loading) return <PageLoader label="Chargement…" />;
  if (state.error === '404') return <div className="px-4 py-12"><EmptyState icon={SearchX} title="Logement introuvable" actions={<ButtonLink to="/logements">Voir les logements</ButtonLink>} /></div>;
  if (state.error) return <div className="px-4 py-12"><ErrorState message={state.error} onRetry={() => setTries((t) => t + 1)} /></div>;

  const { listing, canReview, review } = state.data;
  if (!canReview && !review) {
    return (
      <div className="px-4 py-12">
        <EmptyState icon={CalendarCheck} title="Réservez d'abord ce logement" text="Pour garder des avis fiables, seuls les étudiants ayant une réservation confirmée peuvent noter un logement."
          actions={<><ButtonLink to={`/logements/${id}/reserver`}>Réserver</ButtonLink><ButtonLink to={`/logements/${id}`} variant="outline">Retour à l'annonce</ButtonLink></>} />
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return setError('Choisissez une note de 1 à 5 étoiles.');
    setError(''); setBusy(true);
    try {
      if (review) await api.patch(`/reviews/${review._id}`, { rating, comment }); else await api.post(`/listings/${id}/reviews`, { rating, comment });
      toast(review ? 'Avis mis à jour' : 'Merci pour votre avis !');
      navigate(`/logements/${id}`);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try { await api.del(`/reviews/${review._id}`); toast('Avis supprimé'); navigate(`/logements/${id}`); }
    catch (err) { toast(err.message, 'error'); setBusy(false); setAskDelete(false); }
  };

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-2xl px-4 py-6 md:py-10">
      <h1 className="text-2xl font-extrabold md:text-3xl">{review ? 'Modifier mon avis' : 'Donner mon avis'}</h1>
      <p className="mb-5 text-slate-600">{listing.title}</p>
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
        <div>
          <p className="font-bold">Votre note</p>
          <div className="flex items-center gap-3"><Stars value={rating} onChange={setRating} /><span className="font-semibold text-amber-700">{LABELS[rating]}</span></div>
        </div>
        <label className="block text-sm font-semibold">Votre commentaire
          <textarea className="mt-1 h-36 w-full rounded-lg border border-slate-300 bg-white p-3 text-base" maxLength={1000} value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder="Propreté, eau, sécurité, voisinage, relation avec le bailleur…" />
          <span className="block text-right text-xs font-normal text-slate-600">{comment.length} / 1000</span>
        </label>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" className="flex-1" disabled={busy}>{busy ? 'Envoi…' : review ? 'Enregistrer' : "Publier l'avis"}</Button>
          <ButtonLink to={`/logements/${id}`} variant="outline">Annuler</ButtonLink>
          {review && <button type="button" onClick={() => setAskDelete(true)} className="h-12 px-3 font-bold text-red-700">Supprimer</button>}
        </div>
      </div>
      <ConfirmDialog open={askDelete} busy={busy} title="Supprimer votre avis ?" text="La note moyenne du logement sera recalculée." confirmLabel="Supprimer" onConfirm={remove} onCancel={() => setAskDelete(false)} />
    </form>
  );
}

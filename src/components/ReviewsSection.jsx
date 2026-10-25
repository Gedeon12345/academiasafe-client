import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquareText } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button, Stars } from './ui';
import { EmptyState } from './feedback';

const month = (d) => new Date(d).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

// Avis des étudiants : note moyenne, répartition, liste, et bouton adapté à la situation de la personne.
export default function ReviewsSection({ listing, className = '' }) {
  const { user, requireAuth } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, data: [], page: 1, pages: 1, summary: null, error: '' });
  const [moreBusy, setMoreBusy] = useState(false);
  const [mine, setMine] = useState(null); // { canReview, review } pour un étudiant

  const load = (page = 1) => api.get(`/listings/${listing._id}/reviews?page=${page}`).then((d) => {
    setState((s) => ({ loading: false, error: '', summary: d.summary, page: d.page, pages: d.pages, data: page === 1 ? d.data : [...s.data, ...d.data] }));
  }).catch((e) => setState((s) => ({ ...s, loading: false, error: e.message })));

  useEffect(() => { load(1); }, [listing._id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (user?.role !== 'student') return setMine(null);
    api.get(`/listings/${listing._id}/reviews/mine`).then(setMine).catch(() => setMine(null));
  }, [listing._id, user?._id, user?.role]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = () => requireAuth('Connectez-vous pour laisser un avis', () => navigate(`/logements/${listing._id}/avis`), 'student');
  const sm = state.summary;

  let action = null;
  if (!user) action = <Button variant="outline" className="h-11 text-sm" onClick={go}>Laisser un avis</Button>;
  else if (user.role === 'student' && mine?.review) action = <Button variant="outline" className="h-11 text-sm" onClick={go}>Modifier mon avis</Button>;
  else if (user.role === 'student' && mine?.canReview) action = <Button className="h-11 text-sm" onClick={go}>Laisser un avis</Button>;

  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-4 md:p-6 ${className}`} aria-labelledby="avis">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 id="avis" className="text-lg font-bold">Avis des étudiants</h2>
        {action}
      </div>
      <p className="mt-1 text-sm text-slate-600">Seuls les étudiants ayant une réservation confirmée peuvent publier un avis.</p>
      {user?.role === 'student' && mine && !mine.canReview && !mine.review && <p className="mt-1 text-sm font-semibold text-slate-700">Réservez ce logement pour pouvoir donner votre avis.</p>}

      {state.loading && <p role="status" className="py-6 text-center text-slate-600">Chargement des avis…</p>}
      {state.error && <p role="alert" className="py-4 font-semibold text-red-700">{state.error} <button className="font-bold text-brand underline" onClick={() => load(1)}>Réessayer</button></p>}

      {sm && sm.count === 0 && (
        <div className="mt-4"><EmptyState icon={MessageSquareText} title="Pas encore d'avis" text="Les avis apparaîtront ici après les premiers séjours. Les étudiants qui ont réservé pourront noter ce logement." /></div>
      )}

      {sm && sm.count > 0 && (
        <div className="mt-4 grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
          <div>
            <p className="text-4xl font-extrabold text-brand">{String(sm.average).replace('.', ',')}<span className="text-lg font-bold text-slate-500"> / 5</span></p>
            <Stars value={sm.average} />
            <p className="mb-3 text-sm text-slate-600">{sm.count} avis</p>
            {[5, 4, 3, 2, 1].map((n) => (
              <div key={n} className="flex items-center gap-2 text-sm">
                <span className="w-6 text-slate-700">{n} ★</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"><span className="block h-full bg-amber-500" style={{ width: `${(sm.distribution[n] / sm.count) * 100}%` }} /></span>
                <span className="w-6 text-right text-slate-600">{sm.distribution[n]}</span>
              </div>
            ))}
          </div>
          <div>
            <ul className="divide-y divide-slate-200">
              {state.data.map((r) => (
                <li key={r._id} className="py-4 first:pt-0">
                  <div className="flex flex-wrap items-center gap-x-3"><Stars value={r.rating} /><b>{r.author}</b><span className="text-sm text-slate-600">{month(r.createdAt)}{r.edited && ' · modifié'}</span></div>
                  {r.comment && <p className="mt-1.5 whitespace-pre-line leading-relaxed text-slate-700">{r.comment}</p>}
                </li>
              ))}
            </ul>
            {state.page < state.pages && (
              <Button variant="outline" className="mt-2" disabled={moreBusy} onClick={async () => { setMoreBusy(true); await load(state.page + 1); setMoreBusy(false); }}>
                {moreBusy ? 'Chargement…' : 'Voir plus d’avis'}
              </Button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

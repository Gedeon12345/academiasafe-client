import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { UserPlus, Users } from 'lucide-react';
import { api, qs } from '../lib/api';
import { fcfa } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { Button, ButtonLink } from '../components/ui';
import { EmptyState, ErrorState, CardSkeleton } from '../components/feedback';
import AffinityRing from '../components/AffinityRing';
import ContactDialog from '../components/ContactDialog';

const field = 'mt-1 h-11 w-full rounded-lg border border-slate-300 bg-white px-3';
const LABEL = { calm: 'Calme', party: 'Festif', early: 'Se couche tôt', late: 'Se couche tard' };
const FILTERS = ['q', 'maxBudget', 'noise', 'smoker', 'sleep'];
const tag = 'rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700';

export default function Roommates() {
  const { user, requireAuth } = useAuth();
  const [sp, setSp] = useSearchParams();
  const p = Object.fromEntries(sp);
  const hasFilters = FILTERS.some((k) => p[k]);
  const [state, setState] = useState({ loading: true, data: [], pages: 1, total: 0, hasProfile: false, error: '' });
  const [tries, setTries] = useState(0);
  const [target, setTarget] = useState(null);
  const page = Number(p.page) || 1;

  useEffect(() => {
    let off = false;
    setState((s) => ({ ...s, loading: true, error: '' }));
    api.get('/roommates' + qs({ q: p.q, maxBudget: p.maxBudget, noise: p.noise, smoker: p.smoker, sleep: p.sleep, page: p.page }))
      .then((d) => !off && setState({ loading: false, data: d.data, pages: d.pages, total: d.total, hasProfile: d.hasProfile, error: '' }))
      .catch((e) => !off && setState((s) => ({ ...s, loading: false, error: e.message })));
    return () => { off = true; };
  }, [sp, tries, user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const apply = (e) => { e.preventDefault(); const n = {}; for (const [k, v] of new FormData(e.currentTarget).entries()) if (v) n[k] = v; setSp(n); };
  const contact = (pr) => requireAuth('Connectez-vous pour contacter ce colocataire', () => setTarget(pr), 'student');
  const canContact = !user || user.role === 'student';

  return (
    <div className="px-4 py-5 md:px-6 md:py-8 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8 xl:px-10">
      <form onSubmit={apply} key={sp.toString()} className="mb-5 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-24 lg:mb-0 lg:self-start">
        <h1 className="text-xl font-extrabold">Colocataires</h1>
        <label className="block text-sm font-semibold">Filière ou campus<input name="q" defaultValue={p.q} className={field} /></label>
        <label className="block text-sm font-semibold">Budget max jusqu'à (FCFA)<input name="maxBudget" inputMode="numeric" defaultValue={p.maxBudget} className={field} /></label>
        <label className="block text-sm font-semibold">Ambiance
          <select name="noise" defaultValue={p.noise || ''} className={field}><option value="">Indifférent</option><option value="calm">Calme</option><option value="party">Festif</option></select></label>
        <label className="block text-sm font-semibold">Tabac
          <select name="smoker" defaultValue={p.smoker || ''} className={field}><option value="">Indifférent</option><option value="false">Non-fumeur</option><option value="true">Fumeur</option></select></label>
        <label className="block text-sm font-semibold">Sommeil
          <select name="sleep" defaultValue={p.sleep || ''} className={field}><option value="">Indifférent</option><option value="early">Se couche tôt</option><option value="late">Se couche tard</option></select></label>
        <Button type="submit" className="w-full">Appliquer</Button>
        {hasFilters && <button type="button" onClick={() => setSp({})} className="h-11 w-full text-sm font-bold text-brand">Réinitialiser les filtres</button>}
      </form>

      <section aria-live="polite">
        {user?.role === 'student' && !state.loading && !state.hasProfile && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/40 bg-blue-50 p-4">
            <p className="font-semibold">Créez votre profil pour voir votre taux d'affinité avec chaque étudiant.</p>
            <ButtonLink to="/profil-colocataire"><UserPlus size={18} aria-hidden="true" />Créer mon profil</ButtonLink>
          </div>
        )}
        {state.loading && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}</div>}
        {state.error && <ErrorState message={state.error} onRetry={() => setTries((t) => t + 1)} />}
        {!state.loading && !state.error && (state.data.length === 0 ? (
          <EmptyState icon={Users} title={hasFilters ? 'Aucun colocataire ne correspond' : 'Aucun profil pour le moment'}
            text={hasFilters ? 'Élargissez le budget ou retirez un critère de mode de vie.' : 'Soyez le premier : créez votre profil et laissez les autres vous trouver.'}
            actions={<>{hasFilters && <Button onClick={() => setSp({})}>Réinitialiser les filtres</Button>}<ButtonLink to="/profil-colocataire" variant={hasFilters ? 'outline' : 'primary'}>Créer mon profil</ButtonLink></>} />
        ) : (
          <>
            <p className="mb-3 text-sm text-slate-600">{state.total} profil{state.total > 1 ? 's' : ''}{state.hasProfile && ' · triés par affinité'}</p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {state.data.map((r) => (
                <article key={r._id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-brand font-extrabold text-white" aria-hidden="true">{r.name.slice(0, 1)}</div>
                    <div className="min-w-0 flex-1"><h2 className="truncate font-bold">{r.name}</h2><p className="truncate text-sm text-slate-600">{[r.field, r.campus].filter(Boolean).join(' · ') || 'Étudiant'}</p></div>
                    {r.affinity != null && <AffinityRing value={r.affinity} />}
                  </div>
                  <p className="mt-3 text-sm font-semibold">Budget max : <span className="text-brand">{fcfa(r.budgetMax)}</span></p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className={tag}>{LABEL[r.lifestyle.noise]}</span><span className={tag}>{r.lifestyle.smoker ? 'Fumeur' : 'Non-fumeur'}</span><span className={tag}>{LABEL[r.lifestyle.sleep]}</span>
                  </div>
                  {r.bio && <p className="mt-3 text-sm leading-relaxed text-slate-700">{r.bio}</p>}
                  {canContact && <Button variant="outline" className="mt-4 h-11 text-sm" onClick={() => contact(r)}>Contacter</Button>}
                </article>
              ))}
            </div>
            {state.pages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button variant="outline" disabled={page <= 1} onClick={() => setSp({ ...p, page: page - 1 })}>Précédent</Button>
                <span className="text-sm">Page {page} / {state.pages}</span>
                <Button variant="outline" disabled={page >= state.pages} onClick={() => setSp({ ...p, page: page + 1 })}>Suivant</Button>
              </div>
            )}
          </>
        ))}
        {!user && <p className="mt-6 text-center text-sm text-slate-600">Vous consultez les profils sans compte. <Link to="/login" className="font-bold text-brand">Connectez-vous</Link> pour contacter quelqu'un.</p>}
      </section>

      <ContactDialog open={!!target} onClose={() => setTarget(null)} endpoint={target ? `/messages/roommate/${target._id}` : ''} title={`Écrire à ${target?.name || ''}`}
        hint="Présentez-vous et dites ce que vous cherchez (quartier, budget, date d'arrivée)." />
    </div>
  );
}

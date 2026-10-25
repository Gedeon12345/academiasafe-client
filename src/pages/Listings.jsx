import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { api, qs } from '../lib/api';
import ListingCard from '../components/ListingCard';
import { Button, ButtonLink } from '../components/ui';
import { EmptyState, ErrorState, ListingSkeletonGrid } from '../components/feedback';

const field = 'mt-1 h-11 w-full rounded-lg border border-slate-300 bg-white px-3';
const FILTERS = ['campus', 'max', 'period', 'certified'];

export default function Listings() {
  const [sp, setSp] = useSearchParams();
  const [state, setState] = useState({ loading: true, data: [], pages: 1, total: 0, error: '' });
  const [tries, setTries] = useState(0);
  const p = Object.fromEntries(sp);
  const hasFilters = FILTERS.some((k) => p[k]);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: '' }));
    api.get('/listings' + qs({ campus: p.campus, maxPrice: p.max, period: p.period, certified: p.certified, sort: p.sort, page: p.page, limit: 12 }))
      .then((d) => !cancelled && setState({ loading: false, data: d.data, pages: d.pages, total: d.total, error: '' }))
      .catch((e) => !cancelled && setState((s) => ({ ...s, loading: false, error: e.message })));
    return () => { cancelled = true; };
  }, [sp, tries]); // eslint-disable-line react-hooks/exhaustive-deps

  const apply = (e) => {
    e.preventDefault();
    const next = {};
    for (const [k, v] of new FormData(e.currentTarget).entries()) if (v) next[k] = v;
    setSp(next);
  };
  const page = Number(p.page) || 1;
  const goto = (n) => { setSp({ ...p, page: n }); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="px-4 py-5 md:py-8 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
      <form onSubmit={apply} key={sp.toString()} className="mb-5 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-24 lg:mb-0 lg:self-start">
        <h1 className="text-xl font-extrabold">Logements</h1>
        <label className="block text-sm font-semibold">Campus<input name="campus" defaultValue={p.campus} className={field} /></label>
        <label className="block text-sm font-semibold">Budget maximum (FCFA)<input name="max" inputMode="numeric" defaultValue={p.max} className={field} /></label>
        <label className="block text-sm font-semibold">Période
          <select name="period" defaultValue={p.period || ''} className={field}>
            <option value="">Toutes</option><option value="daily">Jour</option><option value="weekly">Semaine</option>
            <option value="monthly">Mois</option><option value="yearly">An</option>
          </select>
        </label>
        <label className="block text-sm font-semibold">Trier par
          <select name="sort" defaultValue={p.sort || ''} className={field}>
            <option value="">Plus récents</option><option value="price_asc">Prix croissant</option><option value="price_desc">Prix décroissant</option>
            <option value="rating">Mieux notés</option><option value="views">Plus vus</option>
          </select>
        </label>
        <label className="flex h-11 items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="certified" value="true" defaultChecked={p.certified === 'true'} className="h-5 w-5" /> Cités certifiées seulement
        </label>
        <Button type="submit" className="w-full">Appliquer</Button>
        {hasFilters && <button type="button" onClick={() => setSp({})} className="h-11 w-full text-sm font-bold text-brand">Réinitialiser les filtres</button>}
      </form>

      <section aria-live="polite">
        {state.loading && <ListingSkeletonGrid n={8} />}
        {state.error && <ErrorState message={state.error} onRetry={() => setTries((t) => t + 1)} />}
        {!state.loading && !state.error && (
          <>
            <p className="mb-3 text-sm text-slate-600">{state.total} logement{state.total > 1 ? 's' : ''}</p>
            {state.data.length === 0 ? (
              <EmptyState icon={SearchX}
                title={hasFilters ? 'Aucun logement ne correspond' : 'Aucun logement pour le moment'}
                text={hasFilters ? 'Essayez un budget plus large, une autre période ou retirez un filtre.' : 'Les premières annonces arrivent bientôt. Revenez nous voir !'}
                actions={<>
                  {hasFilters && <Button onClick={() => setSp({})}>Réinitialiser les filtres</Button>}
                  <ButtonLink to="/" variant={hasFilters ? 'outline' : 'primary'}>Retour à l'accueil</ButtonLink>
                </>} />
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4">{state.data.map((l) => <ListingCard key={l._id} listing={l} photoHeight="h-36" />)}</div>
            )}
            {state.pages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button variant="outline" disabled={page <= 1} onClick={() => goto(page - 1)}>Précédent</Button>
                <span className="text-sm">Page {page} / {state.pages}</span>
                <Button variant="outline" disabled={page >= state.pages} onClick={() => goto(page + 1)}>Suivant</Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

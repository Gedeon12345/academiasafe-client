import { lazy, Suspense, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutGrid, Map as MapIcon, Search, SearchX, X } from 'lucide-react';
import { api, qs } from '../lib/api';
import ListingCard from '../components/ListingCard';
import { Button, ButtonLink } from '../components/ui';
import { EmptyState, ErrorState, Loader, ListingSkeletonGrid } from '../components/feedback';

const ListingsMap = lazy(() => import('../components/ListingsMap')); // Leaflet ne se charge que pour la vue carte

const field = 'mt-1 h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base';
const EQUIP = ['Eau 24h', 'Wi-Fi', 'Meublé', 'Gardien', 'Climatisation', 'Compteur prépayé'];
const PERIODS = { daily: 'Au jour', weekly: 'À la semaine', monthly: 'Au mois', yearly: "À l'année" };

export default function Listings() {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const p = Object.fromEntries(sp);
  const view = p.view === 'map' ? 'map' : 'list';
  const amen = (p.amenities || '').split(',').filter(Boolean);
  const [state, setState] = useState({ loading: true, data: [], pages: 1, total: 0, error: '' });
  const [tries, setTries] = useState(0);

  // Modifie un ou plusieurs filtres de l'adresse ; chaque changement relance la recherche.
  const set = (patch) => {
    const n = { ...p, ...patch, page: undefined };
    Object.keys(n).forEach((k) => (n[k] === undefined || n[k] === '' || n[k] === null) && delete n[k]);
    setSp(n);
  };
  const toggleAmenity = (a) => set({ amenities: (amen.includes(a) ? amen.filter((x) => x !== a) : [...amen, a]).join(',') });

  useEffect(() => {
    let off = false;
    setState((s) => ({ ...s, loading: true, error: '' }));
    api.get('/listings' + qs({ campus: p.campus, maxPrice: p.max, period: p.period, certified: p.certified, amenities: p.amenities, sort: p.sort, page: view === 'map' ? undefined : p.page, limit: view === 'map' ? 50 : 12 }))
      .then((d) => !off && setState({ loading: false, data: d.data, pages: d.pages, total: d.total, error: '' }))
      .catch((e) => !off && setState((s) => ({ ...s, loading: false, error: e.message })));
    return () => { off = true; };
  }, [sp, tries]); // eslint-disable-line react-hooks/exhaustive-deps

  const chips = [p.campus && ['campus', `Campus : ${p.campus}`], p.max && ['max', `Jusqu'à ${Number(p.max).toLocaleString('fr-FR')} FCFA`], p.period && ['period', PERIODS[p.period]],
    p.certified === 'true' && ['certified', 'Cités certifiées'], ...amen.map((a) => [`am:${a}`, a])].filter(Boolean);
  const removeChip = (k) => (k.startsWith('am:') ? toggleAmenity(k.slice(3)) : set({ [k]: undefined }));
  const page = Number(p.page) || 1;
  const goto = (n) => { setSp({ ...p, page: n }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const submit = (e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); set({ campus: fd.get('campus'), max: fd.get('max') }); };

  const cards = <div className={view === 'map' ? 'grid gap-4' : 'grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5'}>{state.data.map((l) => <ListingCard key={l._id} listing={l} photoHeight={view === 'map' ? 'h-40' : 'h-44'} />)}</div>;
  const toggle = (v, label, Icon) => (
    <button type="button" aria-pressed={view === v} onClick={() => set({ view: v === 'map' ? 'map' : undefined })}
      className={`flex h-11 items-center gap-2 px-4 text-sm font-bold ${view === v ? 'bg-brand text-white' : 'bg-white text-slate-700'}`}><Icon size={17} aria-hidden="true" />{label}</button>
  );

  return (
    <div className="px-4 py-5 md:px-6 md:py-8 xl:px-10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-3xl font-extrabold md:text-5xl">Logements étudiants</h1><p className="mt-1 text-slate-600" aria-live="polite">{state.loading ? 'Recherche…' : `${state.total} logement${state.total > 1 ? 's' : ''}`}</p></div>
        <div className="flex flex-wrap items-center gap-3">
          <select aria-label="Trier" value={p.sort || ''} onChange={(e) => set({ sort: e.target.value })} className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold">
            <option value="">Plus récents</option><option value="price_asc">Prix croissant</option><option value="price_desc">Prix décroissant</option><option value="rating">Mieux notés</option><option value="views">Plus vus</option><option value="likes">Plus aimés</option>
          </select>
          <div className="flex overflow-hidden rounded-lg border border-slate-300" role="group" aria-label="Affichage">{toggle('list', 'Liste', LayoutGrid)}{toggle('map', 'Carte', MapIcon)}</div>
        </div>
      </div>

      <form onSubmit={submit} key={`${p.campus || ''}|${p.max || ''}`} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-end">
        <label className="block text-sm font-semibold">Campus<input name="campus" defaultValue={p.campus} className={field} placeholder="Université de Douala" /></label>
        <label className="block text-sm font-semibold">Budget maximum (FCFA)<input name="max" inputMode="numeric" defaultValue={p.max} className={field} placeholder="50000" /></label>
        <label className="block text-sm font-semibold">Période
          <select value={p.period || ''} onChange={(e) => set({ period: e.target.value })} className={field}><option value="">Toutes</option>{Object.entries(PERIODS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </label>
        <Button type="submit" className="h-12"><Search size={18} className="mr-2" aria-hidden="true" />Chercher</Button>
      </form>

      <div className="mb-4 mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Filtres rapides">
        <button type="button" aria-pressed={p.certified === 'true'} onClick={() => set({ certified: p.certified === 'true' ? undefined : 'true' })}
          className={`h-10 rounded-full border px-4 text-sm font-bold ${p.certified === 'true' ? 'border-safe-dark bg-safe-soft text-safe-dark' : 'border-slate-300 bg-white text-slate-700'}`}>✓ Certifiées</button>
        {EQUIP.map((a) => <button key={a} type="button" aria-pressed={amen.includes(a)} onClick={() => toggleAmenity(a)} className={`h-10 rounded-full border px-4 text-sm font-semibold ${amen.includes(a) ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white text-slate-700'}`}>{a}</button>)}
      </div>

      {chips.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2" aria-label="Filtres actifs">
          {chips.map(([k, label]) => <button key={k} type="button" onClick={() => removeChip(k)} aria-label={`Retirer le filtre ${label}`} className="flex h-9 items-center gap-1.5 rounded-full bg-brand-soft px-3 text-sm font-semibold text-brand">{label}<X size={14} aria-hidden="true" /></button>)}
          <button type="button" onClick={() => setSp(view === 'map' ? { view: 'map' } : {})} className="h-9 px-2 text-sm font-bold text-slate-700 underline">Tout effacer</button>
        </div>
      )}

      <section aria-live="polite">
        {state.error && <ErrorState message={state.error} onRetry={() => setTries((t) => t + 1)} />}
        {state.loading && !state.error && (view === 'map' ? <div className="grid h-72 place-items-center"><Loader label="Recherche des logements…" /></div> : <ListingSkeletonGrid n={8} />)}
        {!state.loading && !state.error && (state.data.length === 0 ? (
          <EmptyState icon={SearchX} title={chips.length ? 'Aucun logement ne correspond' : 'Aucun logement pour le moment'}
            text={chips.length ? 'Essayez un budget plus large, une autre période ou retirez un filtre.' : 'Les premières annonces arrivent bientôt. Revenez nous voir !'}
            actions={<>{chips.length > 0 && <Button onClick={() => setSp(view === 'map' ? { view: 'map' } : {})}>Réinitialiser les filtres</Button>}<ButtonLink to="/" variant={chips.length ? 'outline' : 'primary'}>Retour à l'accueil</ButtonLink></>} />
        ) : view === 'map' ? (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_440px]">
            <div className="h-[55vh] xl:sticky xl:top-20 xl:h-[calc(100vh-7rem)]">
              <Suspense fallback={<div className="grid h-full place-items-center"><Loader label="Chargement de la carte…" /></div>}><ListingsMap listings={state.data} onOpen={(id) => navigate(`/logements/${id}`)} /></Suspense>
            </div>
            <div>{cards}{state.total > 50 && <p className="mt-4 text-center text-sm text-slate-600">Les 50 premiers résultats sont affichés : précisez votre recherche pour affiner.</p>}</div>
          </div>
        ) : (
          <>
            {cards}
            {state.pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <Button variant="outline" disabled={page <= 1} onClick={() => goto(page - 1)}>Précédent</Button>
                <span className="text-sm">Page {page} / {state.pages}</span>
                <Button variant="outline" disabled={page >= state.pages} onClick={() => goto(page + 1)}>Suivant</Button>
              </div>
            )}
          </>
        ))}
      </section>
    </div>
  );
}

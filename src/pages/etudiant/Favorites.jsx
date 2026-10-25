import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { api } from '../../lib/api';
import { useFavorites } from '../../context/FavoritesContext';
import ListingCard from '../../components/ListingCard';
import { Button, ButtonLink } from '../../components/ui';
import { EmptyState, ErrorState, ListingSkeletonGrid } from '../../components/feedback';

export default function Favorites() {
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, data: [], error: '' });
  const [sel, setSel] = useState([]);
  const { isFavorite, loaded } = useFavorites();
  const [tries, setTries] = useState(0);

  useEffect(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    api.get('/favorites').then((d) => setState({ loading: false, data: d.data, error: '' }))
      .catch((e) => setState({ loading: false, data: [], error: e.message }));
  }, [tries]);

  // Un logement retiré des favoris disparaît tout de suite de la liste.
  const shown = loaded ? state.data.filter((l) => isFavorite(l._id)) : state.data;
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 3 ? [...s, id] : s));

  return (
    <div className="px-4 py-5 pb-28 md:px-6 md:py-8 xl:px-10">
      <h1 className="text-2xl font-extrabold md:text-3xl">Mes favoris</h1>
      {state.loading && <div className="mt-5"><ListingSkeletonGrid n={4} /></div>}
      {state.error && <div className="mt-8"><ErrorState message={state.error} onRetry={() => setTries((t) => t + 1)} /></div>}
      {!state.loading && !state.error && (shown.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={Heart} title="Aucun favori pour l'instant" text="Touchez le cœur d'un logement pour le retrouver ici et le comparer aux autres."
            actions={<ButtonLink to="/logements">Découvrir les logements</ButtonLink>} />
        </div>
      ) : (
        <>
          <p className="mb-4 mt-1 text-slate-600">Cochez 2 ou 3 logements pour les comparer côte à côte.</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4">
            {shown.map((l) => (
              <div key={l._id} className={`overflow-hidden rounded-2xl ring-2 ${sel.includes(l._id) ? 'ring-brand' : 'ring-transparent'}`}>
                <ListingCard listing={l} photoHeight="h-36" />
                <label className="flex h-12 cursor-pointer items-center gap-2 border-t border-slate-200 bg-white px-4 text-sm font-bold">
                  <input type="checkbox" className="h-5 w-5" checked={sel.includes(l._id)} onChange={() => toggle(l._id)} disabled={!sel.includes(l._id) && sel.length >= 3} /> Comparer
                </label>
              </div>
            ))}
          </div>
          <div className="fixed inset-x-0 bottom-16 z-20 border-t border-slate-200 bg-white px-4 py-3 md:bottom-0">
            <div className="mx-auto flex max-w-[1920px] items-center justify-between gap-3 md:px-6">
              <span className="text-sm font-semibold">{sel.length} sélectionné{sel.length > 1 ? 's' : ''} (3 maximum)</span>
              <Button disabled={sel.length < 2} onClick={() => navigate(`/favoris/comparer?ids=${sel.join(',')}`)}>Comparer</Button>
            </div>
          </div>
        </>
      ))}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { api, assetUrl } from '../../lib/api';
import { fcfa, priceLabel } from '../../lib/format';
import { ButtonLink } from '../../components/ui';
import { EmptyState, ErrorState, PageLoader } from '../../components/feedback';

const MONTHLY = { daily: 30, weekly: 52 / 12, monthly: 1, yearly: 1 / 12 }; // pour comparer des loyers de périodes différentes
const monthly = (l) => Math.round(l.pricing.price * MONTHLY[l.pricing.period]);
const km = (n) => `${String(n).replace('.', ',')} km`;

// Chaque ligne : libellé, valeur affichée, et (optionnel) valeur numérique pour mettre le meilleur en avant.
const ROWS = [
  ['Loyer', (l) => priceLabel(l.pricing)],
  ['Équivalent par mois', (l) => fcfa(monthly(l)), monthly, 'min'],
  ['Caution', (l) => fcfa(l.pricing.deposit)],
  ['Distance du campus', (l) => km(l.distanceToCampusKm), (l) => l.distanceToCampusKm, 'min'],
  ['Moto', (l) => (l.commute ? `${l.commute.moto.min} min · ${fcfa(l.commute.moto.fare)}` : '–'), (l) => l.commute?.moto.fare, 'min'],
  ['Taxi', (l) => (l.commute ? `${l.commute.taxi.min} min · ${fcfa(l.commute.taxi.fare)}` : '–'), (l) => l.commute?.taxi.fare, 'min'],
  ['À pied', (l) => (l.commute ? `${l.commute.walk.min} min` : '–')],
  ['Note', (l) => (l.reviewsCount ? `★ ${String(l.averageRating).replace('.', ',')} (${l.reviewsCount})` : 'Pas d’avis'), (l) => (l.reviewsCount ? l.averageRating : undefined), 'max'],
  ['Vues', (l) => l.viewsCount],
  ['J’aime', (l) => l.likesCount],
  ['Cité certifiée', (l) => (l.isCertified ? 'Oui' : 'Non')],
];

export default function Compare() {
  const [sp] = useSearchParams();
  const ids = (sp.get('ids') || '').split(',').filter(Boolean).slice(0, 3);
  const [state, setState] = useState({ loading: true, data: [], error: '' });
  const [tries, setTries] = useState(0);

  useEffect(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    api.get('/favorites').then((d) => setState({ loading: false, data: d.data, error: '' }))
      .catch((e) => setState({ loading: false, data: [], error: e.message }));
  }, [tries]);

  if (state.loading) return <PageLoader label="Préparation de la comparaison…" />;
  if (state.error) return <div className="px-4 py-12"><ErrorState message={state.error} onRetry={() => setTries((t) => t + 1)} /></div>;
  const items = ids.map((id) => state.data.find((l) => l._id === id)).filter(Boolean);
  if (items.length < 2) {
    return (
      <div className="px-4 py-12">
        <EmptyState icon={Scale} title="Choisissez au moins 2 logements" text="Sélectionnez-en 2 ou 3 dans vos favoris pour les comparer."
          actions={<ButtonLink to="/favoris">Retour à mes favoris</ButtonLink>} />
      </div>
    );
  }

  const amenities = [...new Map(items.flatMap((l) => l.amenities).map((a) => [a.toLowerCase(), a])).values()].sort();
  const th = 'sticky left-0 z-10 w-32 min-w-[8rem] bg-white px-3 py-3 text-left text-sm font-semibold text-slate-600 md:w-48';

  return (
    <div className="px-4 py-5 md:px-6 md:py-8 xl:px-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold md:text-3xl">Comparer</h1>
        <ButtonLink to="/favoris" variant="outline">Retour aux favoris</ButtonLink>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr>
              <th className={th} scope="col"><span className="sr-only">Critère</span></th>
              {items.map((l) => (
                <th key={l._id} scope="col" className="min-w-[200px] px-3 py-3 text-left align-top">
                  <div className="mb-2 h-28 overflow-hidden rounded-xl bg-blue-100">{l.images?.[0] && <img src={assetUrl(l.images[0])} alt="" className="h-full w-full object-cover" />}</div>
                  <Link to={`/logements/${l._id}`} className="font-bold text-brand hover:underline">{l.title}</Link>
                  <p className="text-sm font-normal text-slate-600">{l.neighborhood}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([label, show, num, dir]) => {
              const vals = num ? items.map(num) : [];
              const defined = vals.filter((v) => v != null);
              const best = defined.length > 1 ? (dir === 'min' ? Math.min(...defined) : Math.max(...defined)) : null;
              return (
                <tr key={label} className="border-t border-slate-200">
                  <th scope="row" className={th}>{label}</th>
                  {items.map((l, i) => {
                    const isBest = best != null && vals[i] === best && defined.filter((v) => v === best).length < items.length;
                    return <td key={l._id} className={`px-3 py-3 text-sm ${isBest ? 'font-extrabold text-safe-dark' : ''}`}>{show(l)}{isBest && <span className="ml-1 rounded-full bg-safe-soft px-2 py-0.5 text-xs">Meilleur</span>}</td>;
                  })}
                </tr>
              );
            })}
            {amenities.map((a) => (
              <tr key={a} className="border-t border-slate-200">
                <th scope="row" className={th}>{a}</th>
                {items.map((l) => <td key={l._id} className="px-3 py-3 text-sm">{l.amenities.some((x) => x.toLowerCase() === a.toLowerCase()) ? '✓ Oui' : '– Non'}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-600">« Équivalent par mois » ramène les loyers à un mois pour les comparer (jour × 30, semaine × 4,33, an ÷ 12). Les tarifs moto et taxi sont des estimations par trajet.</p>
    </div>
  );
}

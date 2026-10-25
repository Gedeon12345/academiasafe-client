import { fcfa } from '../lib/format';

const row = 'flex justify-between border-t border-slate-200 py-2.5 text-sm';

// Trajet calculé automatiquement : à pied, moto, taxi, avec le budget quotidien (aller-retour).
export default function CommuteCard({ commute: c, title }) {
  const km = String(c.distanceKm).replace('.', ',');
  return (
    <div>
      {title && <h3 className="font-bold">{title}</h3>}
      <p className="mb-1.5 text-sm text-slate-600">{km} km par la route</p>
      <div className={row}><span>À pied · {c.walk.min} min</span><b>Gratuit</b></div>
      <div className={row}><span>Moto · {c.moto.min} min</span><b>{fcfa(c.moto.fare)}</b></div>
      <div className={row}><span>Taxi · {c.taxi.min} min</span><b>{fcfa(c.taxi.fare)}</b></div>
      <p className="border-t border-slate-200 pt-2.5 text-sm text-slate-700">
        Budget par jour (aller-retour) : <b>{fcfa(c.dailyMoto)}</b> en moto, <b>{fcfa(c.dailyTaxi)}</b> en taxi
      </p>
      <p className="mt-1 text-xs text-slate-600">
        {c.source === 'estimate' ? 'Estimation à vol d’oiseau (itinéraire indisponible). ' : ''}Tarifs indicatifs, qui peuvent varier.
      </p>
    </div>
  );
}

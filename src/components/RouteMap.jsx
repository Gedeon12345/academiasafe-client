import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fcfa } from '../lib/format';

const pin = (color, letter) => L.divIcon({
  className: '', iconSize: [34, 42], iconAnchor: [17, 40],
  html: `<svg width="34" height="42" viewBox="0 0 34 42" aria-hidden="true"><path d="M17 0C7.6 0 0 7.4 0 16.6 0 29 17 42 17 42s17-13 17-25.4C34 7.4 26.4 0 17 0z" fill="${color}"/><circle cx="17" cy="16" r="9" fill="#fff"/><text x="17" y="20.5" text-anchor="middle" font-size="12" font-weight="700" font-family="Figtree,sans-serif" fill="${color}">${letter}</text></svg>`,
});

// Si le serveur n'a pas pu fournir le tracé (anciennes annonces, service indisponible), le navigateur le demande lui-même.
const BASES = { drive: ['https://routing.openstreetmap.de/routed-car', 'https://router.project-osrm.org'], walk: ['https://routing.openstreetmap.de/routed-foot'] };
const memory = new Map();
async function browserRoute(mode, a, b) {
  const key = `${mode}:${a.lat},${a.lng};${b.lat},${b.lng}`;
  if (memory.has(key)) return memory.get(key);
  for (const base of BASES[mode]) {
    try {
      const res = await fetch(`${base}/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`, { signal: AbortSignal.timeout(9000) });
      const j = await res.json();
      if (j.code === 'Ok' && j.routes?.[0]?.geometry?.coordinates?.length > 1) {
        const pts = j.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        memory.set(key, pts);
        return pts;
      }
    } catch { /* on essaie le serveur suivant */ }
  }
  return null;
}

const tab = (on) => `h-11 px-3 text-sm font-bold ${on ? 'bg-brand text-white' : 'bg-white text-slate-700'}`;

// Carte OpenStreetMap : tracé réel sur les routes (voiture / moto / taxi) ou à pied, distance, durées et tarifs.
export default function RouteMap({ from, to, path, walkPath, fromLabel = 'Logement', toLabel = 'Campus', commute, className = '' }) {
  const el = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);
  const [mode, setMode] = useState('drive'); // drive | walk
  const [extra, setExtra] = useState({ drive: null, walk: null });
  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [tries, setTries] = useState(0);

  const coordKey = `${from.lat},${from.lng};${to.lat},${to.lng}`;
  useEffect(() => { setExtra({ drive: null, walk: null }); setStatus('idle'); }, [coordKey]);

  const given = mode === 'walk' ? walkPath : path;
  const route = given?.length > 1 ? given : extra[mode];

  useEffect(() => {
    if (route) return;
    let cancelled = false;
    setStatus('loading');
    browserRoute(mode, from, to).then((pts) => {
      if (cancelled) return;
      if (pts) { setExtra((e) => ({ ...e, [mode]: pts })); setStatus('idle'); } else setStatus('error');
    });
    return () => { cancelled = true; };
  }, [mode, coordKey, route, tries]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const m = L.map(el.current, { scrollWheelZoom: false, dragging: !L.Browser.mobile, zoomControl: false });
    L.control.zoom({ position: 'topright' }).addTo(m);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(m);
    layer.current = L.layerGroup().addTo(m);
    map.current = m;
    return () => { m.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    const m = map.current; if (!m) return;
    const g = layer.current; g.clearLayers();
    const a = [from.lat, from.lng], b = [to.lat, to.lng];
    let bounds = L.latLngBounds([a, b]);
    if (route) {
      // Tracé façon Google Maps : liseré blanc + trait bleu, qui suit les routes. Jamais de ligne droite.
      L.polyline(route, { color: '#fff', weight: 10, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }).addTo(g);
      const line = L.polyline(route, { color: mode === 'walk' ? '#047857' : '#1E40AF', weight: 6, opacity: 1, lineCap: 'round', lineJoin: 'round', dashArray: mode === 'walk' ? '1 10' : null }).addTo(g);
      bounds = bounds.extend(line.getBounds());
    }
    L.marker(a, { icon: pin('#1E40AF', 'L'), title: fromLabel }).bindTooltip(fromLabel, { direction: 'top', offset: [0, -34] }).addTo(g);
    L.marker(b, { icon: pin('#047857', 'C'), title: toLabel }).bindTooltip(toLabel, { direction: 'top', offset: [0, -34] }).addTo(g);
    m.fitBounds(bounds, { padding: [48, 48], maxZoom: 17 });
    setTimeout(() => m.invalidateSize(), 0);
  }, [from.lat, from.lng, to.lat, to.lng, route, mode, fromLabel, toLabel]);

  return (
    <div className={`relative ${className}`}>
      <div ref={el} role="region" aria-label={`Carte du trajet entre ${fromLabel} et ${toLabel}`} className="h-72 w-full overflow-hidden rounded-2xl border border-slate-200 md:h-96 xl:h-[28rem]" />
      {commute && (
        <dl className="pointer-events-none absolute left-2 top-2 z-[1000] max-w-[70%] rounded-xl bg-white/95 px-3 py-2 text-xs shadow md:text-sm">
          <dt className="sr-only">Distance</dt>
          <dd className="text-base font-extrabold text-brand md:text-lg">{String(commute.distanceKm).replace('.', ',')} km</dd>
          <dd>À pied · {commute.walk.min} min</dd>
          <dd>Moto · {commute.moto.min} min · <b>{fcfa(commute.moto.fare)}</b></dd>
          <dd>Taxi · {commute.taxi.min} min · <b>{fcfa(commute.taxi.fare)}</b></dd>
        </dl>
      )}
      <div role="group" aria-label="Mode de déplacement" className="absolute bottom-7 left-2 z-[1000] flex overflow-hidden rounded-xl border border-slate-300 shadow">
        <button type="button" aria-pressed={mode === 'drive'} onClick={() => setMode('drive')} className={tab(mode === 'drive')}>Moto / taxi</button>
        <button type="button" aria-pressed={mode === 'walk'} onClick={() => setMode('walk')} className={tab(mode === 'walk')}>À pied</button>
      </div>
      {status === 'loading' && <p role="status" className="absolute inset-x-0 top-1/2 z-[1000] mx-auto w-fit -translate-y-1/2 rounded-full bg-white px-4 py-2 text-sm font-bold shadow">Calcul du tracé sur les routes…</p>}
      {status === 'error' && (
        <div role="alert" className="absolute inset-x-2 bottom-20 z-[1000] mx-auto w-fit max-w-full rounded-xl bg-white px-4 py-3 text-sm shadow">
          <p className="font-bold text-red-700">Le tracé de la route est indisponible pour le moment.</p>
          <button type="button" onClick={() => setTries((t) => t + 1)} className="mt-1 h-11 font-bold text-brand">Réessayer</button>
        </div>
      )}
    </div>
  );
}

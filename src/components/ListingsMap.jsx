import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { priceLabel } from '../lib/format';

const pin = (l) => L.divIcon({
  className: '', iconSize: [0, 0],
  html: `<span style="position:absolute;transform:translate(-50%,-100%);background:#fff;color:#0F172A;border:2px solid ${l.isCertified ? '#047857' : '#1E40AF'};border-radius:999px;padding:3px 9px;font:700 12px Figtree,system-ui,sans-serif;white-space:nowrap;box-shadow:0 2px 8px rgba(15,23,42,.28)">${Math.round(l.pricing.price).toLocaleString('fr-FR')}</span>`,
});

// Carte de tous les résultats : un repère par logement, avec son loyer. Un clic ouvre une bulle puis la fiche.
export default function ListingsMap({ listings, onOpen }) {
  const el = useRef(null), map = useRef(null), layer = useRef(null);
  useEffect(() => {
    const m = L.map(el.current, { scrollWheelZoom: false, dragging: !L.Browser.mobile, zoomControl: false }).setView([4.05, 9.75], 11);
    L.control.zoom({ position: 'topright' }).addTo(m);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(m);
    layer.current = L.layerGroup().addTo(m); map.current = m;
    return () => { m.remove(); map.current = null; };
  }, []);
  useEffect(() => {
    const m = map.current; if (!m) return;
    layer.current.clearLayers();
    const pts = [];
    for (const l of listings) {
      if (l.location?.lat == null) continue;
      const at = [l.location.lat, l.location.lng]; pts.push(at);
      const box = document.createElement('div'); box.style.cssText = 'min-width:180px;font-family:Figtree,system-ui,sans-serif';
      const a = document.createElement('a'); a.textContent = l.title; a.href = `/logements/${l._id}`; a.style.cssText = 'font-weight:800;color:#1E40AF;display:block';
      a.onclick = (e) => { e.preventDefault(); onOpen(l._id); };
      const p = document.createElement('div'); p.textContent = `${priceLabel(l.pricing)} · ${l.neighborhood}`;
      box.append(a, p);
      L.marker(at, { icon: pin(l), title: l.title }).bindPopup(box).addTo(layer.current);
    }
    if (pts.length) m.fitBounds(L.latLngBounds(pts), { padding: [50, 50], maxZoom: 15 });
    setTimeout(() => m.invalidateSize(), 0);
  }, [listings]); // eslint-disable-line react-hooks/exhaustive-deps
  return <div ref={el} role="region" aria-label="Carte des logements" className="h-full min-h-[320px] w-full overflow-hidden rounded-2xl border border-slate-200" />;
}

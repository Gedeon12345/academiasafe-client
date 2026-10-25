import { useEffect, useRef, useState } from 'react';
import { Check, MapPin } from 'lucide-react';
import { api, qs } from '../lib/api';

const input = 'mt-1 h-12 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-base';
const small = 'h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base';

// Recherche d'adresse ou de lieu avec suggestions. Si la recherche est en panne, on peut saisir les coordonnées.
export default function GeoSearchInput({ id, label, placeholder, initial = '', ok = false, onSelect, onClear }) {
  const [text, setText] = useState(initial);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [errMsg, setErrMsg] = useState('');
  const [active, setActive] = useState(-1);
  const [manual, setManual] = useState(false);
  const [coords, setCoords] = useState({ lat: '', lng: '' });
  const [coordErr, setCoordErr] = useState('');
  const timer = useRef(null);
  const seq = useRef(0);
  useEffect(() => setText(initial), [initial]);

  const onChange = (e) => {
    const v = e.target.value;
    setText(v); setActive(-1); onClear?.();
    clearTimeout(timer.current);
    if (v.trim().length < 3) { setItems([]); setOpen(false); setStatus('idle'); return; }
    setOpen(true); setStatus('loading');
    const mine = ++seq.current;
    timer.current = setTimeout(async () => {
      try {
        const d = await api.get('/geo/search' + qs({ q: v.trim() }));
        if (mine === seq.current) { setItems(d.data); setStatus('done'); }
      } catch (err) { if (mine === seq.current) { setErrMsg(err.message); setStatus('error'); } }
    }, 450);
  };
  const pick = (it) => { setText(it.name); setOpen(false); setItems([]); setManual(false); onSelect(it); };
  const openManual = () => { setOpen(false); setManual(true); };
  const validateCoords = () => {
    const lat = Number(coords.lat.replace(',', '.')), lng = Number(coords.lng.replace(',', '.'));
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180 || coords.lat === '' || coords.lng === '') {
      return setCoordErr('Coordonnées invalides (ex. latitude 3.8667, longitude 11.5167).');
    }
    setCoordErr('');
    pick({ name: text.trim() || 'Position saisie', label: text.trim(), lat, lng, area: '' });
  };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(items.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === 'Enter' && open && active >= 0) { e.preventDefault(); pick(items[active]); }
    else if (e.key === 'Escape') setOpen(false);
  };
  const manualBtn = <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={openManual} className="mt-1 h-11 text-sm font-bold text-brand">Saisir les coordonnées à la main</button>;

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-semibold">{label}</label>
      <div className="relative">
        <MapPin size={18} className="pointer-events-none absolute left-3 top-1/2 mt-0.5 -translate-y-1/2 text-slate-500" aria-hidden="true" />
        <input id={id} role="combobox" aria-expanded={open} aria-controls={`${id}-list`} aria-autocomplete="list" autoComplete="off"
          className={input} value={text} onChange={onChange} onKeyDown={onKey} onBlur={() => setTimeout(() => setOpen(false), 150)} placeholder={placeholder} />
        {ok && <Check size={18} className="absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-safe-dark" aria-label="Position enregistrée" />}
      </div>
      {open && (
        <ul id={`${id}-list`} role="listbox" className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {status === 'loading' && <li className="px-3 py-3 text-sm text-slate-600">Recherche…</li>}
          {status === 'error' && <li className="px-3 py-3 text-sm"><p className="font-semibold text-red-700">{errMsg || 'Recherche indisponible.'}</p>{manualBtn}</li>}
          {status === 'done' && items.length === 0 && <li className="px-3 py-3 text-sm text-slate-600">Aucun résultat. Essayez avec le quartier ou la ville.<br />{manualBtn}</li>}
          {items.map((it, k) => (
            <li key={`${it.lat}${it.lng}${k}`} role="option" aria-selected={k === active} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(it)}
              className={`cursor-pointer px-3 py-2.5 ${k === active ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
              <b className="block text-sm">{it.name}</b><span className="block truncate text-xs text-slate-600">{it.label}</span>
            </li>
          ))}
        </ul>
      )}
      {manual && (
        <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-xs text-slate-600">Astuce : sur Google Maps, faites un clic droit sur le lieu, puis cliquez sur les deux nombres pour les copier.</p>
          <div className="grid grid-cols-2 gap-2">
            <input className={small} inputMode="decimal" placeholder="Latitude (3.8667)" aria-label="Latitude" value={coords.lat} onChange={(e) => setCoords((c) => ({ ...c, lat: e.target.value }))} />
            <input className={small} inputMode="decimal" placeholder="Longitude (11.5167)" aria-label="Longitude" value={coords.lng} onChange={(e) => setCoords((c) => ({ ...c, lng: e.target.value }))} />
          </div>
          {coordErr && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{coordErr}</p>}
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={validateCoords} className="h-11 flex-1 rounded-lg bg-brand font-bold text-white">Valider cette position</button>
            <button type="button" onClick={() => setManual(false)} className="h-11 px-3 text-sm font-bold text-slate-700">Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}

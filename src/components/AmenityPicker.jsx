import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { api, qs } from '../lib/api';
import { Button } from './ui';

const BASE = ['Eau 24h', 'Wi-Fi', 'Compteur prépayé', 'Gardien', 'Meublé', 'Climatisation', 'Parking', 'Cuisine'];

// Commodités extensibles : les suggestions viennent d'une recherche globale sur toutes les annonces.
export default function AmenityPicker({ value, onChange }) {
  const [popular, setPopular] = useState(BASE);
  const [text, setText] = useState('');
  const [sugg, setSugg] = useState([]);
  const has = (a) => value.some((v) => v.toLowerCase() === a.toLowerCase());

  useEffect(() => { api.get('/amenities').then((d) => setPopular(d.data.map((x) => x.label))).catch(() => {}); }, []);
  useEffect(() => {
    if (!text.trim()) return setSugg([]);
    const t = setTimeout(() => api.get('/amenities' + qs({ q: text.trim() })).then((d) => setSugg(d.data.map((x) => x.label))).catch(() => {}), 250);
    return () => clearTimeout(t);
  }, [text]);

  const add = (raw) => {
    const v = raw.trim().replace(/\s+/g, ' ');
    if (v.length < 2 || v.length > 40 || has(v) || value.length >= 20) return;
    onChange([...value, v[0].toUpperCase() + v.slice(1)]);
    setText('');
  };
  const toggle = (a) => (has(a) ? onChange(value.filter((v) => v.toLowerCase() !== a.toLowerCase())) : add(a));
  const typed = text.trim();
  const showCustom = typed.length >= 2 && !has(typed) && !sugg.some((s) => s.toLowerCase() === typed.toLowerCase());
  const options = sugg.filter((s) => !has(s));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {[...value, ...popular.filter((p) => !has(p))].map((a) => (
          <button key={a} type="button" aria-pressed={has(a)} onClick={() => toggle(a)}
            className={`h-11 rounded-full border px-4 text-sm font-semibold ${has(a) ? 'border-safe-dark bg-safe-soft text-safe-dark' : 'border-slate-300 bg-white text-slate-700'}`}>
            {has(a) ? '✓ ' : ''}{a}
          </button>
        ))}
      </div>
      <div className="relative">
        <div className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} aria-label="Rechercher ou ajouter une commodité" placeholder="Rechercher ou ajouter (ex. Groupe électrogène)"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add(text))} className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base" />
          <Button type="button" variant="outline" onClick={() => add(text)} aria-label="Ajouter"><Plus size={18} /></Button>
        </div>
        {(options.length > 0 || showCustom) && (
          <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            {options.map((s) => <li key={s}><button type="button" onClick={() => add(s)} className="flex h-11 w-full items-center px-3 text-left text-sm hover:bg-slate-50">{s}</button></li>)}
            {showCustom && <li><button type="button" onClick={() => add(typed)} className="flex h-11 w-full items-center gap-2 px-3 text-left text-sm font-bold text-brand hover:bg-slate-50"><Plus size={16} />Ajouter « {typed} »</button></li>}
          </ul>
        )}
      </div>
    </div>
  );
}

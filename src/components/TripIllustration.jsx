import { Check } from 'lucide-react';

const COLS = [[20, 95], [135, 95], [250, 95], [365, 95], [480, 60]];
const ROWS = [[20, 60], [100, 70], [200, 80], [300, 60]];
const ROUTE = 'M125 330 L125 185 L355 185 L355 90 L470 90';

// Le cœur du produit en image : un plan de quartier, le trajet du logement au campus, et la « fiche » avec les temps et les tarifs.
export default function TripIllustration({ ticket = true, className = '' }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-[#EAF0FB] shadow-lift">
        <svg viewBox="0 0 560 440" className="block h-auto w-full">
          <path d="M-10 385 C 110 335, 220 415, 330 375 S 520 345, 580 385 V450 H-10Z" fill="#CFE0F7" />
          {COLS.flatMap(([x, w]) => ROWS.map(([y, h]) => <rect key={`${x}${y}`} x={x} y={y} width={w} height={h} rx="9" fill={x === 250 && y === 200 ? '#CDEBD9' : '#F7FAFF'} />))}
          <path d={ROUTE} fill="none" stroke="#fff" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
          <path d={ROUTE} fill="none" stroke="#FBBF24" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d={ROUTE} fill="none" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0.1 19.9" className="animate-route" />
          <g transform="translate(125 332)">
            <path d="M0 0C-2-10-19-22-19-39a19 19 0 1 1 38 0C19-22 2-10 0 0Z" fill="#1E40AF" stroke="#fff" strokeWidth="3" />
            <path d="M-9-37 0-46 9-37v10H-9z" fill="#fff" />
          </g>
          <g transform="translate(470 92)">
            <path d="M0 0C-2-10-19-22-19-39a19 19 0 1 1 38 0C19-22 2-10 0 0Z" fill="#047857" stroke="#fff" strokeWidth="3" />
            <path d="M-11-41 0-47l11 6-11 6z" fill="#fff" /><path d="M-6-38v6q6 4 12 0v-6" fill="none" stroke="#fff" strokeWidth="2" />
          </g>
        </svg>
      </div>
      <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-safe-dark shadow-card"><Check size={14} strokeWidth={3} />Cité certifiée</span>
      {ticket && (
        <div className="absolute -bottom-5 right-3 w-[15.5rem] rounded-2xl bg-white p-4 shadow-lift sm:-right-4">
          <p className="text-xs font-semibold text-slate-600">Exemple de fiche</p>
          <p className="font-display text-lg font-extrabold leading-tight">Studio meublé · Ngoa-Ekélé</p>
          <p className="text-sm text-slate-600">1,2 km de l'université</p>
          <ul className="mt-3 space-y-1.5 text-sm font-semibold">
            {[['À pied · 14 min', 'Gratuit'], ['Moto · 5 min', '300 FCFA'], ['Taxi · 7 min', '300 FCFA']].map(([k, v], i) => (
              <li key={k} className="flex items-center justify-between gap-2"><span>{k}</span><span className={`rounded-md px-1.5 py-0.5 text-xs font-extrabold ${i ? 'bg-taxi text-ink' : 'bg-safe-soft text-safe-dark'}`}>{v}</span></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

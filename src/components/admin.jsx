import { Button } from './ui';

export const Pill = ({ cls, children }) => <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${cls}`}>{children}</span>;

export const Tabs = ({ value, onChange, items }) => (
  <div role="tablist" className="mb-5 flex flex-wrap gap-2">
    {items.map(([v, label, n]) => (
      <button key={v} role="tab" aria-selected={value === v} onClick={() => onChange(v)}
        className={`h-11 rounded-full border px-5 text-sm font-bold ${value === v ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white text-slate-700'}`}>{label}{n != null && ` (${n})`}</button>
    ))}
  </div>
);

export const Pager = ({ page, pages, onChange }) => pages > 1 && (
  <div className="mt-6 flex items-center justify-center gap-3">
    <Button variant="outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>Précédent</Button>
    <span className="text-sm">Page {page} / {pages}</span>
    <Button variant="outline" disabled={page >= pages} onClick={() => onChange(page + 1)}>Suivant</Button>
  </div>
);

export const when = (d) => new Date(d).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

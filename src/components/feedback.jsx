import { Home, CloudOff, RotateCcw } from 'lucide-react';
import { Button } from './ui';

// Loader de marque : anneau qui tourne autour d'une maison qui flotte.
export function Loader({ label = 'Chargement…' }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center gap-4 text-center">
      <div className="relative h-20 w-20">
        <span className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-brand motion-reduce:animate-none" />
        <span className="absolute inset-0 flex animate-float items-center justify-center text-brand motion-reduce:animate-none"><Home size={28} aria-hidden="true" /></span>
      </div>
      <p className="text-sm font-semibold text-slate-600">{label}</p>
    </div>
  );
}

// Loader centré dans la page.
export const PageLoader = ({ label }) => (
  <div className="flex min-h-[60vh] items-center justify-center px-4"><Loader label={label} /></div>
);

export function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white motion-reduce:animate-none" aria-hidden="true">
      <div className="h-32 bg-slate-200" />
      <div className="space-y-2.5 p-3.5"><div className="h-4 w-3/4 rounded bg-slate-200" /><div className="h-3 w-1/2 rounded bg-slate-200" /><div className="h-4 w-1/3 rounded bg-slate-200" /></div>
    </div>
  );
}

export const ListingSkeletonGrid = ({ n = 6 }) => (
  <div role="status" aria-label="Chargement des logements" className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4">
    {Array.from({ length: n }, (_, i) => <CardSkeleton key={i} />)}
  </div>
);

// État vide : illustration en cercles, message clair, boutons d'action.
export function EmptyState({ icon: Icon, title, text, actions }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <div className="relative mb-5" aria-hidden="true">
        <span className="absolute -left-3 -top-2 h-3 w-3 rounded-full bg-safe/40" />
        <span className="absolute -right-4 bottom-1 h-4 w-4 rounded-full bg-brand/20" />
        <span className="absolute -bottom-2 left-0 h-2 w-2 rounded-full bg-amber-400" />
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-brand ring-8 ring-blue-50/60"><Icon size={36} /></div>
      </div>
      <h2 className="text-xl font-extrabold">{title}</h2>
      {text && <p className="mt-2 leading-relaxed text-slate-600">{text}</p>}
      {actions && <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div>}
    </div>
  );
}

export const ErrorState = ({ message, onRetry }) => (
  <EmptyState icon={CloudOff} title="Oups, la connexion a coincé"
    text={message || 'Impossible de charger cette page pour le moment.'}
    actions={onRetry && <Button onClick={onRetry}><RotateCcw size={18} className="mr-2" aria-hidden="true" />Réessayer</Button>} />
);

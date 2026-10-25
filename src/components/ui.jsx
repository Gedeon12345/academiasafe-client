import { Link } from 'react-router-dom';
import { Check, Star } from 'lucide-react';

const focus = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';
const VARIANTS = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  outline: 'bg-white text-brand border-2 border-brand hover:bg-blue-50',
};

export function Button({ variant = 'primary', className = '', ...props }) {
  return (
    <button
      className={`inline-flex h-12 items-center justify-center rounded-xl px-5 font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${focus} ${className}`}
      {...props}
    />
  );
}

export function CertBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-safe-dark px-2 py-1 text-xs font-bold text-white">
      <Check size={12} strokeWidth={3} aria-hidden="true" /> Cité certifiée
    </span>
  );
}

export function Chip({ children }) {
  return <span className="rounded-full bg-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700">{children}</span>;
}

// Étoiles : lecture seule, ou interactives si onChange est fourni (avis).
export function Stars({ value, onChange }) {
  return (
    <div className="flex" role={onChange ? 'radiogroup' : 'img'} aria-label={`Note : ${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const icon = <Star size={onChange ? 30 : 16} className={n <= Math.round(value) ? 'fill-amber-500 text-amber-500' : 'text-slate-300'} />;
        return onChange
          ? <button key={n} type="button" aria-label={`${n} étoiles`} onClick={() => onChange(n)} className={`h-11 w-11 ${focus}`}>{icon}</button>
          : <span key={n}>{icon}</span>;
      })}
    </div>
  );
}

// Lien ayant l'apparence d'un bouton.
export function ButtonLink({ to, variant = 'primary', className = '', ...props }) {
  return (
    <Link to={to}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 font-bold transition ${VARIANTS[variant]} ${focus} ${className}`}
      {...props} />
  );
}

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// Texte replié sur 4 lignes avec « Voir plus ». Déplié, un clic sur le texte ou sur le bouton le replie.
export default function ExpandableText({ text }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [clamped, setClamped] = useState(false);

  const measure = () => { const el = ref.current; if (el && !open) setClamped(el.scrollHeight > el.clientHeight + 1); };
  useLayoutEffect(measure, [text, open]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { window.addEventListener('resize', measure); return () => window.removeEventListener('resize', measure); }); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <p ref={ref} onClick={() => open && setOpen(false)}
        className={`whitespace-pre-line leading-relaxed text-slate-700 ${open ? 'cursor-pointer' : 'line-clamp-4'}`}>{text}</p>
      {(clamped || open) && (
        <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="mt-1 h-11 text-sm font-bold text-brand">
          {open ? 'Voir moins' : 'Voir plus'}
        </button>
      )}
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Home, X } from 'lucide-react';
import { assetUrl } from '../lib/api';

const arrow = 'absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow md:flex';

// Toutes les photos : défilement tactile (glisser), flèches, clavier, miniatures et affichage plein écran.
export default function Gallery({ images = [], title, children }) {
  const scroller = useRef(null);
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(null); // index ouvert en plein écran
  const n = images.length;

  const go = useCallback((k) => {
    const el = scroller.current; if (!el) return;
    const t = (k + n) % n;
    el.scrollTo({ left: t * el.clientWidth, behavior: 'smooth' });
  }, [n]);
  const onScroll = (e) => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth));

  useEffect(() => {
    if (zoom === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setZoom(null);
      if (e.key === 'ArrowRight') setZoom((z) => (z + 1) % n);
      if (e.key === 'ArrowLeft') setZoom((z) => (z - 1 + n) % n);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom, n]);

  const box = 'relative h-64 overflow-hidden bg-blue-100 md:h-[26rem] lg:h-[30rem] lg:rounded-2xl 2xl:h-[36rem]';
  if (n === 0) {
    return (
      <div className={`${box} flex flex-col items-center justify-center gap-2 text-brand`}>
        <Home size={44} aria-hidden="true" /><p className="text-sm font-semibold">Pas encore de photos</p>
        {children}
      </div>
    );
  }

  return (
    <div>
      <div className={box}>
        <div ref={scroller} onScroll={onScroll} tabIndex={0} role="group" aria-roledescription="carrousel" aria-label={`Photos de ${title}`}
          onKeyDown={(e) => { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1); }}
          className="flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((src, k) => (
            <button key={src} type="button" onClick={() => setZoom(k)} aria-label={`Agrandir la photo ${k + 1} sur ${n}`} className="h-full w-full flex-none snap-center cursor-zoom-in">
              <img src={assetUrl(src)} alt={`${title}, photo ${k + 1} sur ${n}`} loading={k ? 'lazy' : 'eager'} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
        {n > 1 && (
          <>
            <button aria-label="Photo précédente" onClick={() => go(i - 1)} className={`${arrow} left-3`}><ChevronLeft /></button>
            <button aria-label="Photo suivante" onClick={() => go(i + 1)} className={`${arrow} right-3`}><ChevronRight /></button>
            <span aria-live="polite" className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-3 py-1 text-xs font-bold text-white">{i + 1} / {n}</span>
          </>
        )}
        {children}
      </div>

      {n > 1 && (
        <div className="mt-2 hidden gap-2 overflow-x-auto md:flex">
          {images.map((src, k) => (
            <button key={src} type="button" onClick={() => go(k)} aria-label={`Voir la photo ${k + 1}`} aria-current={k === i}
              className={`h-16 w-24 flex-none overflow-hidden rounded-lg ring-2 ${k === i ? 'ring-brand' : 'ring-transparent opacity-70 hover:opacity-100'}`}>
              <img src={assetUrl(src)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {zoom !== null && (
        <div role="dialog" aria-modal="true" aria-label="Photos en plein écran" className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90" onClick={() => setZoom(null)}>
          <img src={assetUrl(images[zoom])} alt={`${title}, photo ${zoom + 1} sur ${n}`} className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
          <button aria-label="Fermer" onClick={() => setZoom(null)} className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white"><X /></button>
          {n > 1 && (
            <>
              <button aria-label="Photo précédente" onClick={(e) => { e.stopPropagation(); setZoom((z) => (z - 1 + n) % n); }} className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white"><ChevronLeft /></button>
              <button aria-label="Photo suivante" onClick={(e) => { e.stopPropagation(); setZoom((z) => (z + 1) % n); }} className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white"><ChevronRight /></button>
              <span className="absolute bottom-4 rounded-full bg-white/90 px-3 py-1 text-sm font-bold">{zoom + 1} / {n}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { blobUrl } from '../lib/api';

// Image réservée à l'admin : récupérée avec le jeton de connexion, puis affichée.
export default function ProtectedImage({ path, alt = '', className = '', onClick }) {
  const [src, setSrc] = useState('');
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let url = '', off = false;
    blobUrl(path).then((u) => { url = u; if (!off) setSrc(u); }).catch(() => !off && setFailed(true));
    return () => { off = true; if (url) URL.revokeObjectURL(url); };
  }, [path]);
  if (failed) return <span className={`flex items-center justify-center bg-slate-200 text-xs text-slate-600 ${className}`}>Indisponible</span>;
  if (!src) return <span className={`animate-pulse bg-slate-200 ${className}`} aria-hidden="true" />;
  return onClick
    ? <button type="button" onClick={onClick} aria-label="Agrandir la capture d'écran" className="block"><img src={src} alt={alt} className={className} /></button>
    : <img src={src} alt={alt} className={className} />;
}

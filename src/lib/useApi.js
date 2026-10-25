import { useEffect, useState } from 'react';
import { api } from './api';

// Charge une adresse de l'API ; renvoie [état, recharger].
export function useApi(url) {
  const [s, setS] = useState({ loading: true, data: null, error: '' });
  const [n, setN] = useState(0);
  useEffect(() => {
    let off = false;
    setS((x) => ({ ...x, loading: true, error: '' }));
    api.get(url).then((d) => !off && setS({ loading: false, data: d, error: '' })).catch((e) => !off && setS({ loading: false, data: null, error: e.message }));
    return () => { off = true; };
  }, [url, n]);
  return [s, () => setN((v) => v + 1)];
}

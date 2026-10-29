const BASE = import.meta.env.VITE_API_URL || '/api';

export const getToken = () => localStorage.getItem('as_token');
export const setToken = (t) => (t ? localStorage.setItem('as_token', t) : localStorage.removeItem('as_token'));
export const assetUrl = (p) => `${import.meta.env.VITE_API_ORIGIN || ''}${p}`; // photos : /uploads/listings/...

export const qs = (o) => {
  const p = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => v !== undefined && v !== null && v !== '' && p.set(k, v));
  const s = p.toString();
  return s ? `?${s}` : '';
};

// Identifiant anonyme du navigateur : sert à ne compter qu'une vue par visiteur.
function visitorId() {
  let id = localStorage.getItem('as_visitor');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('as_visitor', id); }
  return id;
}

async function request(method, path, body) {
  const headers = { 'X-Visitor-Id': visitorId() };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (body instanceof FormData) payload = body; // multipart : le navigateur fixe l'en-tête
  else if (body) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }

  // L'hébergement gratuit s'endort après 15 min d'inactivité : si la réponse tarde, on prévient l'utilisateur.
  const slow = setTimeout(() => window.dispatchEvent(new Event('as:slow')), 6000);
  let res;
  try { res = await fetch(BASE + path, { method, headers, body: payload }); }
  catch { throw new Error('Serveur injoignable. Vérifiez votre connexion.'); }
  finally { clearTimeout(slow); window.dispatchEvent(new Event('as:ok')); }

  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    // Jeton expiré ou invalide : on déconnecte proprement.
    if (res.status === 401 && token) window.dispatchEvent(new Event('as:unauthorized'));
    const err = new Error(data?.message || 'Une erreur est survenue');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b),
  put: (p, b) => request('PUT', p, b),
  patch: (p, b) => request('PATCH', p, b),
  del: (p) => request('DELETE', p),
};

// Téléchargement d'un fichier protégé (le jeton est envoyé dans l'en-tête, donc pas de simple lien).
export async function download(path, filename) {
  const res = await fetch(BASE + path, { headers: { Authorization: `Bearer ${getToken()}` } });
  if (!res.ok) { const d = await res.json().catch(() => null); throw new Error(d?.message || 'Téléchargement impossible'); }
  const url = URL.createObjectURL(await res.blob());
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Ouvre un fichier protégé (pièce justificative) dans un nouvel onglet. L'onglet est ouvert tout de suite pour éviter le blocage des fenêtres.
export async function viewFile(path) {
  const w = window.open('', '_blank');
  try {
    const res = await fetch(BASE + path, { headers: { Authorization: `Bearer ${getToken()}` } });
    if (!res.ok) { const d = await res.json().catch(() => null); throw new Error(d?.message || 'Ouverture impossible'); }
    const url = URL.createObjectURL(await res.blob());
    if (w) { w.opener = null; w.location.href = url; }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (e) { w?.close(); throw e; }
}

// Charge une image protégée (capture d'écran d'un avis) et renvoie une adresse locale utilisable dans <img>.
export async function blobUrl(path) {
  const res = await fetch(BASE + path, { headers: { Authorization: `Bearer ${getToken()}` } });
  if (!res.ok) throw new Error('Image indisponible');
  return URL.createObjectURL(await res.blob());
}

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bug, Check, ImagePlus, Lightbulb, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { api } from '../lib/api';
import { compressImage } from '../lib/image';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, ButtonLink, Stars } from '../components/ui';

const TYPES = [['compliment', 'Compliment', ThumbsUp], ['suggestion', 'Suggestion', Lightbulb], ['bug', 'Problème', Bug], ['critique', 'Critique', ThumbsDown]];
const PLACEHOLDER = { compliment: "Ce qui vous a plu…", suggestion: 'Ce qui pourrait être amélioré ou ajouté…', bug: "Que s'est-il passé ? Sur quelle page ? Qu'attendiez-vous ?", critique: 'Ce qui ne vous convient pas, en toute franchise…' };
const input = 'mt-1 h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base';
const MAX = 3;

export default function Feedback() {
  const { user } = useAuth();
  const toast = useToast();
  const from = useLocation().state?.from || ''; // page d'où l'on vient
  const [type, setType] = useState('suggestion');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [page, setPage] = useState(from);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => () => files.forEach((x) => URL.revokeObjectURL(x.url)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const addFiles = async (e) => {
    const list = [...e.target.files];
    e.target.value = '';
    const room = MAX - files.length;
    if (list.length > room) toast(`${MAX} photos maximum`, 'error');
    const small = await Promise.all(list.slice(0, Math.max(0, room)).map((f) => compressImage(f)));
    setFiles((l) => [...l, ...small.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
  };

  const submit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    const fd = new FormData();
    fd.append('type', type); fd.append('message', message); fd.append('page', page);
    fd.append('screen', `${window.innerWidth}x${window.innerHeight}`);
    fd.append('website', e.currentTarget.website.value); // champ piège : reste vide pour une vraie personne
    if (rating) fd.append('rating', rating);
    if (!user) { fd.append('name', name); fd.append('email', email); }
    files.forEach((x) => fd.append('photos', x.file));
    try { await api.post('/feedback', fd); setDone(true); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  if (done) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-14 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-safe text-white"><Check size={40} strokeWidth={3} aria-hidden="true" /></div>
        <h1 className="mt-4 text-3xl font-extrabold">Merci pour votre retour !</h1>
        <p className="mt-2 text-slate-600">Votre message a bien été transmis à l'équipe. Chaque avis nous aide à améliorer AcademiaSafe.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink to="/">Retour à l'accueil</ButtonLink>
          <Button variant="outline" onClick={() => { setDone(false); setMessage(''); setRating(0); setFiles([]); }}>Envoyer un autre message</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10">
      <h1 className="text-2xl font-extrabold md:text-4xl">Donnez votre avis sur AcademiaSafe</h1>
      <p className="mt-2 text-slate-600">Le site est en phase de test : votre franchise nous aide beaucoup. Compliment, idée, problème ou critique, tout nous intéresse. Pas besoin de compte.</p>

      <div className="mt-6 space-y-6 rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
        <fieldset>
          <legend className="mb-2 font-bold">C'est plutôt…</legend>
          <div role="radiogroup" className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {TYPES.map(([v, label, Icon]) => (
              <button key={v} type="button" role="radio" aria-checked={type === v} onClick={() => setType(v)}
                className={`flex h-14 items-center justify-center gap-2 rounded-xl border-2 font-bold ${type === v ? 'border-brand bg-blue-50 text-brand' : 'border-slate-300 bg-white text-slate-700'}`}><Icon size={20} aria-hidden="true" />{label}</button>
            ))}
          </div>
        </fieldset>

        <div>
          <p className="font-bold">Votre note globale <span className="font-normal text-slate-600">(facultatif)</span></p>
          <div className="flex items-center gap-3"><Stars value={rating} onChange={(n) => setRating(n === rating ? 0 : n)} />{rating > 0 && <span className="text-sm font-semibold text-amber-700">{rating} / 5</span>}</div>
        </div>

        <label className="block font-bold">Votre message
          <textarea required minLength={10} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={PLACEHOLDER[type]}
            className="mt-1 h-44 w-full rounded-lg border border-slate-300 bg-white p-3 text-base font-normal" />
          <span className="block text-right text-xs font-normal text-slate-600">{message.length} / 2000</span>
        </label>

        <div>
          <p className="font-bold">Captures d'écran ou photos <span className="font-normal text-slate-600">(facultatif, {MAX} maximum)</span></p>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {files.map((x, i) => (
              <div key={x.url} className="relative aspect-square overflow-hidden rounded-xl bg-blue-100">
                <img src={x.url} alt="" className="h-full w-full object-cover" />
                <button type="button" aria-label="Retirer la photo" onClick={() => { URL.revokeObjectURL(x.url); setFiles((l) => l.filter((_, j) => j !== i)); }} className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow"><X size={18} /></button>
              </div>
            ))}
            {files.length < MAX && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-400 bg-slate-50 text-center text-xs font-bold text-brand">
                <ImagePlus aria-hidden="true" /> Ajouter
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addFiles} className="sr-only" />
              </label>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-600">Seule l'équipe voit vos photos.</p>
        </div>

        <label className="block text-sm font-semibold">Page concernée <span className="font-normal text-slate-600">(facultatif)</span>
          <input className={input} value={page} onChange={(e) => setPage(e.target.value)} maxLength={200} placeholder="Ex. /logements, page de réservation…" />
        </label>

        {user ? <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">Vous êtes connecté en tant que <b>{user.name}</b> : l'équipe pourra vous répondre.</p> : (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold">Votre nom <span className="font-normal text-slate-600">(facultatif)</span><input className={input} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" /></label>
            <label className="block text-sm font-semibold">Votre e-mail <span className="font-normal text-slate-600">(pour vous répondre)</span><input type="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} autoComplete="email" /></label>
          </div>
        )}

        {/* Champ piège pour les robots : invisible, doit rester vide */}
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />

        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
        <Button type="submit" className="w-full md:w-auto md:px-12" disabled={busy}>{busy ? 'Envoi…' : 'Envoyer mon avis'}</Button>
        <p className="text-xs text-slate-600">En envoyant ce formulaire, vous acceptez que l'équipe lise votre message. Voir la <Link to="/confidentialite" className="font-bold text-brand underline">politique de confidentialité</Link>.</p>
      </div>
    </form>
  );
}

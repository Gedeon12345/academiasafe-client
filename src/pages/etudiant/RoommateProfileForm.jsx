import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Button, ButtonLink } from '../../components/ui';
import { ErrorState, PageLoader } from '../../components/feedback';
import ConfirmDialog from '../../components/ConfirmDialog';

const input = 'mt-1 h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base';

function Choice({ legend, value, onChange, options }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold">{legend}</legend>
      <div role="radiogroup" className="grid max-w-md grid-cols-2 gap-2">
        {options.map(([v, label]) => (
          <button key={String(v)} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)}
            className={`h-11 rounded-lg border text-sm font-bold ${value === v ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white text-slate-700'}`}>{label}</button>
        ))}
      </div>
    </fieldset>
  );
}

export default function RoommateProfileForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const [load, setLoad] = useState({ loading: true, exists: false, error: '' });
  const [f, setF] = useState({ budgetMax: '', field: '', campus: '', bio: '', isActive: true, noise: 'calm', smoker: false, sleep: 'early' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [askDelete, setAskDelete] = useState(false);
  const [tries, setTries] = useState(0);
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));

  useEffect(() => {
    api.get('/roommates/mine').then(({ profile: p }) => {
      if (p) setF({ budgetMax: p.budgetMax, field: p.field || '', campus: p.campus || '', bio: p.bio || '', isActive: p.isActive, noise: p.lifestyle.noise, smoker: p.lifestyle.smoker, sleep: p.lifestyle.sleep });
      setLoad({ loading: false, exists: !!p, error: '' });
    }).catch((e) => setLoad({ loading: false, exists: false, error: e.message }));
  }, [tries]);

  if (load.loading) return <PageLoader label="Chargement de votre profil…" />;
  if (load.error) return <div className="px-4 py-12"><ErrorState message={load.error} onRetry={() => setTries((t) => t + 1)} /></div>;

  const submit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      await api.put('/roommates/mine', { budgetMax: Number(f.budgetMax), field: f.field, campus: f.campus, bio: f.bio, isActive: f.isActive, lifestyle: { noise: f.noise, smoker: f.smoker, sleep: f.sleep } });
      toast(load.exists ? 'Profil mis à jour' : 'Profil créé : vous êtes visible dans la recherche');
      navigate('/colocataires');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try { await api.del('/roommates/mine'); toast('Profil supprimé'); navigate('/compte'); } catch (err) { toast(err.message, 'error'); setBusy(false); setAskDelete(false); }
  };

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 md:py-10">
      <h1 className="text-2xl font-extrabold md:text-3xl">Mon profil colocataire</h1>
      <p className="text-slate-600">Votre nom est abrégé, et votre numéro n'est jamais affiché : il n'est transmis que si vous écrivez à quelqu'un.</p>

      <label className="flex min-h-[3.25rem] cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold">
        <span>Visible dans la recherche<span className="block text-sm font-normal text-slate-600">Désactivez pour vous masquer sans supprimer votre profil.</span></span>
        <input type="checkbox" className="h-6 w-6 flex-none" checked={f.isActive} onChange={(e) => setF((v) => ({ ...v, isActive: e.target.checked }))} />
      </label>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
        <h2 className="text-lg font-bold">À propos de vous</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">Budget maximum (FCFA par mois)<input className={input} type="number" min="0" required inputMode="numeric" value={f.budgetMax} onChange={set('budgetMax')} /></label>
          <label className="block text-sm font-semibold">Filière<input className={input} maxLength={80} value={f.field} onChange={set('field')} placeholder="Médecine, Droit, Informatique…" /></label>
          <label className="block text-sm font-semibold sm:col-span-2">Campus ou université<input className={input} maxLength={80} value={f.campus} onChange={set('campus')} placeholder="Université de Yaoundé I" /></label>
        </div>
        <label className="block text-sm font-semibold">Présentation (facultatif)
          <textarea className={`${input} h-28 py-3`} maxLength={300} value={f.bio} onChange={set('bio')} placeholder="Quelques mots sur vous et ce que vous cherchez." />
          <span className="block text-right text-xs font-normal text-slate-600">{f.bio.length} / 300</span>
        </label>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
        <h2 className="text-lg font-bold">Mode de vie</h2>
        <Choice legend="Ambiance" value={f.noise} onChange={(v) => setF((x) => ({ ...x, noise: v }))} options={[['calm', 'Calme'], ['party', 'Festif']]} />
        <Choice legend="Tabac" value={f.smoker} onChange={(v) => setF((x) => ({ ...x, smoker: v }))} options={[[false, 'Non-fumeur'], [true, 'Fumeur']]} />
        <Choice legend="Horaire de sommeil" value={f.sleep} onChange={(v) => setF((x) => ({ ...x, sleep: v }))} options={[['early', 'Je me couche tôt'], ['late', 'Je me couche tard']]} />
      </section>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" className="flex-1 sm:flex-none sm:px-10" disabled={busy}>{busy ? 'Enregistrement…' : load.exists ? 'Enregistrer' : 'Créer mon profil'}</Button>
        <ButtonLink to="/colocataires" variant="outline">Annuler</ButtonLink>
        {load.exists && <button type="button" onClick={() => setAskDelete(true)} className="h-12 px-3 font-bold text-red-700">Supprimer mon profil</button>}
      </div>
      <ConfirmDialog open={askDelete} busy={busy} title="Supprimer votre profil ?" text="Vous ne serez plus visible dans la recherche de colocataires." confirmLabel="Supprimer" onConfirm={remove} onCancel={() => setAskDelete(false)} />
    </form>
  );
}

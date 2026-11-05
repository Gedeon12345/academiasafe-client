import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui';

const input = 'mt-1 mb-4 h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base';
const ROLES = [['student', 'Étudiant', GraduationCap, 'Je cherche un logement'], ['landlord', 'Bailleur', Building2, 'Je publie des annonces']];

export default function AuthForm({ onDone }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('student');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const signup = mode === 'register';

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (!signup) await login(f.email, f.password);
      else await register({ ...f, role, acceptTerms: f.acceptTerms === 'on' });
      onDone?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div role="tablist" aria-label="Connexion ou inscription" className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
        {[['login', 'Connexion'], ['register', 'Inscription']].map(([m, label]) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setError(''); }}
            className={`h-11 rounded-lg font-bold transition ${mode === m ? 'bg-white text-brand shadow-sm' : 'text-slate-600'}`}>{label}</button>
        ))}
      </div>

      {signup && (
        <>
          <fieldset className="mb-4">
            <legend className="mb-1.5 text-sm font-semibold">Je suis</legend>
            <div role="radiogroup" className="grid grid-cols-2 gap-2">
              {ROLES.map(([v, label, Icon, sub]) => (
                <button key={v} type="button" role="radio" aria-checked={role === v} onClick={() => setRole(v)}
                  className={`flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition ${role === v ? 'border-brand bg-brand-soft' : 'border-slate-300 bg-white'}`}>
                  <Icon size={22} className={role === v ? 'text-brand' : 'text-slate-600'} aria-hidden="true" />
                  <b>{label}</b><span className="text-xs text-slate-600">{sub}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <label className="text-sm font-semibold">Nom complet</label>
          <input name="name" className={input} required autoComplete="name" />
          <label className="text-sm font-semibold">Téléphone</label>
          <input name="phone" type="tel" className={input} required autoComplete="tel" placeholder="677 12 34 56 ou +237677123456" />
        </>
      )}

      <label className="text-sm font-semibold">E-mail</label>
      <input name="email" type="email" className={input} required autoComplete="email" />

      <label className="text-sm font-semibold" htmlFor="pwd">Mot de passe</label>
      <div className="relative">
        <input id="pwd" name="password" type={show ? 'text' : 'password'} className={`${input} pr-12`} required minLength={signup ? 8 : 1} autoComplete={signup ? 'new-password' : 'current-password'} />
        <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} aria-pressed={show}
          className="absolute right-1 top-1 flex h-12 w-11 items-center justify-center text-slate-600">{show ? <EyeOff size={20} /> : <Eye size={20} />}</button>
      </div>
      {signup && <p className="-mt-2 mb-4 text-xs text-slate-600">8 caractères minimum.</p>}

      {signup && (
        <label className="mb-4 flex items-start gap-2.5 text-sm">
          <input name="acceptTerms" type="checkbox" required className="mt-0.5 h-5 w-5 flex-none" />
          <span>J'ai lu et j'accepte les <Link to="/conditions" target="_blank" className="font-bold text-brand underline">conditions d'utilisation</Link> et la <Link to="/confidentialite" target="_blank" className="font-bold text-brand underline">politique de confidentialité</Link>.</span>
        </label>
      )}

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
      <Button type="submit" className="h-12 w-full text-base" disabled={busy}>{busy ? 'Veuillez patienter…' : signup ? 'Créer mon compte' : 'Se connecter'}</Button>
    </form>
  );
}

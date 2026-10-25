import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui';

const input = 'mt-1 mb-3 h-12 w-full rounded-lg border border-slate-300 px-3 text-base';

export default function AuthForm({ onDone }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (mode === 'login') await login(f.email, f.password);
      else await register(f);
      onDone?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="mb-4 flex gap-2">
        {[['login', 'Connexion'], ['register', 'Inscription']].map(([m, label]) => (
          <button key={m} type="button" onClick={() => { setMode(m); setError(''); }}
            className={`h-11 flex-1 rounded-lg border font-bold ${mode === m ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white text-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {mode === 'register' && (
        <>
          <label className="text-sm font-semibold">Nom complet</label>
          <input name="name" className={input} required />
          <label className="text-sm font-semibold">Téléphone</label>
          <input name="phone" type="tel" className={input} required autoComplete="tel" placeholder="677 12 34 56 ou +237677123456" />
          <label className="text-sm font-semibold">Je suis</label>
          <select name="role" className={input} value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Étudiant</option>
            <option value="landlord">Bailleur</option>
          </select>
        </>
      )}
      <label className="text-sm font-semibold">E-mail</label>
      <input name="email" type="email" className={input} required />
      <label className="text-sm font-semibold">Mot de passe</label>
      <input name="password" type="password" className={input} required minLength={mode === 'register' ? 8 : 1} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
      {mode === 'register' && <p className="-mt-2 mb-3 text-xs text-slate-600">8 caractères minimum.</p>}


      {error && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? 'Veuillez patienter…' : mode === 'register' ? 'Créer mon compte' : 'Se connecter'}
      </Button>
    </form>
  );
}

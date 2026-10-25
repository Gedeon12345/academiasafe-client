import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthForm from './AuthForm';

// Modale affichée quand un invité tente une action protégée (favori, réservation, contact, avis).
export default function AuthModal() {
  const { modal, closeModal } = useAuth();
  useEffect(() => {
    if (!modal) return;
    const onKey = (e) => e.key === 'Escape' && closeModal();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal, closeModal]);
  if (!modal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 md:items-center" onClick={closeModal}>
      <div role="dialog" aria-modal="true" aria-labelledby="auth-title" onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 md:max-w-md md:rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <h2 id="auth-title" className="text-xl font-extrabold">{modal.reason}</h2>
          <button aria-label="Fermer" onClick={closeModal} className="-mt-2 -mr-2 flex h-11 w-11 items-center justify-center"><X /></button>
        </div>
        <p className="mb-4 mt-1 text-sm text-slate-600">Vous pouvez continuer à parcourir sans compte.</p>
        <AuthForm />
        <button onClick={closeModal} className="mx-auto mt-2 block h-11 px-3 text-sm font-semibold text-brand">Continuer sans compte</button>
      </div>
    </div>
  );
}

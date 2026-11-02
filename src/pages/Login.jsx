import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useAuth, homeFor } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';
import TripIllustration from '../components/TripIllustration';

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from?.pathname;
  // Déjà connecté ou connexion réussie : retour à la page demandée, sinon à l'espace du rôle.
  useEffect(() => { if (user) navigate(from || homeFor(user.role), { replace: true }); }, [user, from, navigate]);

  return (
    <div className="mx-auto grid w-full max-w-[1200px] gap-0 md:grid-cols-[1fr_1.05fr] md:px-8 md:py-12">
      <aside className="hidden flex-col justify-between rounded-l-3xl bg-brand p-10 text-white md:flex">
        <div>
          <p className="font-display text-3xl font-extrabold leading-tight">Un compte pour réserver, écrire et garder vos preuves.</p>
          <ul className="mt-6 space-y-3">
            {['Réservez avec un acompte Mobile Money', 'Écrivez au bailleur sans donner votre numéro', 'Retrouvez vos reçus PDF et vos favoris'].map((t) => <li key={t} className="flex items-start gap-3 text-blue-50"><Check size={20} className="mt-0.5 flex-none text-taxi" strokeWidth={3} aria-hidden="true" />{t}</li>)}
          </ul>
        </div>
        <TripIllustration ticket={false} className="mt-8 opacity-95" />
      </aside>
      <div className="p-4 md:rounded-r-3xl md:border md:border-slate-200 md:bg-white md:p-10">
        <h1 className="mb-1 text-3xl font-extrabold">Connexion</h1>
        <p className="mb-5 text-slate-600">Pas besoin de compte pour chercher. Il sert à agir : réserver, écrire, enregistrer.</p>
        <AuthForm />
      </div>
    </div>
  );
}

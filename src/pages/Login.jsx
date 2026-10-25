import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth, homeFor } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from?.pathname;
  // Déjà connecté ou connexion réussie : retour à la page demandée, sinon à l'accueil du rôle.
  useEffect(() => { if (user) navigate(from || homeFor(user.role), { replace: true }); }, [user, from, navigate]);

  return (
    <div className="mx-auto w-full max-w-md p-4 md:py-12">
      <div className="md:rounded-2xl md:border md:border-slate-200 md:bg-white md:p-6">
        <h1 className="mb-1 text-2xl font-extrabold">Connexion</h1>
        <p className="mb-4 text-sm text-slate-600">Connectez-vous pour réserver, contacter et enregistrer vos favoris.</p>
        <AuthForm />
      </div>
    </div>
  );
}

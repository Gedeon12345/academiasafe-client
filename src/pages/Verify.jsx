import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BadgeCheck, ShieldX } from 'lucide-react';
import { api } from '../lib/api';
import { fcfa } from '../lib/format';
import { EmptyState, PageLoader } from '../components/feedback';
import { ButtonLink } from '../components/ui';

// Page ouverte par le QR code du reçu : confirme que le reçu est authentique.
export default function Verify() {
  const { token } = useParams();
  const [state, setState] = useState({ loading: true, data: null });
  useEffect(() => {
    api.get(`/verify/${encodeURIComponent(token)}`).then((d) => setState({ loading: false, data: d })).catch(() => setState({ loading: false, data: null }));
  }, [token]);

  if (state.loading) return <PageLoader label="Vérification du reçu…" />;
  if (!state.data?.valid) {
    return <div className="px-4 py-12"><EmptyState icon={ShieldX} title="Reçu introuvable ou invalide" text="Ce code ne correspond à aucun reçu AcademiaSafe confirmé. Méfiez-vous."
      actions={<ButtonLink to="/">Retour à l'accueil</ButtonLink>} /></div>;
  }
  const d = state.data;
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-safe-soft text-safe-dark"><BadgeCheck size={44} aria-hidden="true" /></div>
      <h1 className="mt-3 text-2xl font-extrabold">Reçu authentique</h1>
      <dl className="mt-5 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-4 text-left">
        {[['Reçu n°', d.receiptNumber], ['Logement', d.title], ['Acompte payé', fcfa(d.amount)], ['Payé le', new Date(d.paidAt).toLocaleDateString('fr-FR', { dateStyle: 'long' })], ['Locataire', d.student], ['Bailleur', d.landlord]]
          .map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-3 text-sm"><dt className="text-slate-600">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>)}
      </dl>
    </div>
  );
}

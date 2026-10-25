import { Compass } from 'lucide-react';
import { EmptyState } from '../components/feedback';
import { ButtonLink } from '../components/ui';

export default function NotFound() {
  return (
    <div className="px-4 py-12">
      <EmptyState icon={Compass} title="Page introuvable" text="Le lien est peut-être erroné, ou la page a été déplacée."
        actions={<><ButtonLink to="/">Retour à l'accueil</ButtonLink><ButtonLink to="/logements" variant="outline">Voir les logements</ButtonLink></>} />
    </div>
  );
}

import { Link } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';

// Renseignez ces valeurs dans les variables du site (VITE_LEGAL_NAME, VITE_LEGAL_ADDRESS, VITE_CONTACT_EMAIL).
const L = {
  name: import.meta.env.VITE_LEGAL_NAME || '[NOM DE LA SOCIÉTÉ OU DE L’ÉDITEUR]',
  address: import.meta.env.VITE_LEGAL_ADDRESS || '[ADRESSE]',
  email: import.meta.env.VITE_CONTACT_EMAIL || '[E-MAIL DE CONTACT]',
};
const unfilled = Object.values(L).some((v) => v.startsWith('['));

const Page = ({ title, children }) => (
  <article className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12">
    <h1 className="text-3xl font-extrabold md:text-4xl">{title}</h1>
    <p className="mt-1 text-sm text-slate-600">Version 1.0 · octobre 2026</p>
    {unfilled && (
      <p role="note" className="mt-4 flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
        <TriangleAlert className="mt-0.5 flex-none" aria-hidden="true" />Modèle à compléter (les mentions entre crochets) et à faire valider par un juriste avant l'ouverture au public.
      </p>
    )}
    <div className="mt-6 space-y-6 leading-relaxed text-slate-700">{children}</div>
  </article>
);
const S = ({ n, t, children }) => <section><h2 className="mb-2 text-lg font-extrabold text-ink">{n}. {t}</h2><div className="space-y-2">{children}</div></section>;
const Ul = ({ items }) => <ul className="list-disc space-y-1 pl-5">{items.map((i) => <li key={i}>{i}</li>)}</ul>;

export function Terms() {
  return (
    <Page title="Conditions d'utilisation">
      <S n="1" t="Objet"><p>Ces conditions encadrent l'utilisation d'AcademiaSafe, plateforme éditée par {L.name} ({L.address}), qui met en relation des étudiants, des bailleurs et des futurs colocataires. En créant un compte, vous les acceptez.</p></S>
      <S n="2" t="Accès et comptes">
        <p>La consultation des logements et des profils de colocation est libre. Un compte est nécessaire pour enregistrer des favoris, aimer une annonce, écrire à quelqu'un, réserver, donner un avis ou publier une annonce.</p>
        <Ul items={["Vous fournissez des informations exactes et à jour.", "Une adresse e-mail et un numéro de téléphone correspondent à un seul compte.", "Vous protégez votre mot de passe : vous êtes responsable de l'activité de votre compte.", "Vous avez l'âge légal pour agir seul, ou l'accord de votre représentant légal."]} />
      </S>
      <S n="3" t="Rôle de la plateforme"><p>AcademiaSafe est un intermédiaire technique. Elle n'est pas partie au contrat de location conclu entre un bailleur et un étudiant, et ne garantit ni l'état, ni la disponibilité, ni le prix final d'un logement. Le badge « Cité certifiée » signale un logement contrôlé par notre équipe à une date donnée ; la mention « identité vérifiée » signale un bailleur dont les pièces ont été examinées. Ces mentions ne constituent pas une garantie absolue.</p></S>
      <S n="4" t="Obligations des bailleurs"><Ul items={["Publier des informations et des photos exactes, qui correspondent au logement réel.", "Être en droit de louer le logement (propriétaire ou mandataire).", "Tenir la disponibilité à jour et ne pas demander de paiement en dehors de la plateforme pour bloquer le logement.", "Fournir, pour la certification, des pièces authentiques. Une fausse pièce entraîne la suspension du compte."]} /><p>Les annonces sont modérées : l'équipe peut les refuser, les retirer ou demander des corrections.</p></S>
      <S n="5" t="Obligations des étudiants"><Ul items={["Utiliser la plateforme de bonne foi et pour un besoin réel de logement ou de colocation.", "Ne donner un avis que sur un logement réservé, de manière honnête et respectueuse.", "Ne pas se faire passer pour quelqu'un d'autre."]} /></S>
      <S n="6" t="Réservation et acompte">
        <p>Le paiement de l'acompte, par Mobile Money, bloque le logement au nom de l'étudiant. Le premier paiement confirmé l'emporte : si le logement a été réservé entre-temps, la réservation n'est pas confirmée. Un reçu PDF numéroté, avec un QR code de vérification, est généré pour chaque réservation payée.</p>
        <p>[À COMPLÉTER : conditions d'annulation et de remboursement de l'acompte, délais, frais éventuels du prestataire de paiement.]</p>
      </S>
      <S n="7" t="Messagerie"><p>Les échanges entre utilisateurs se font dans la messagerie de l'application. Sont interdits : le harcèlement, les insultes, le démarchage commercial, les tentatives d'arnaque et toute demande de paiement hors plateforme. Les messages sont conservés et peuvent être consultés par l'équipe en cas de signalement.</p></S>
      <S n="8" t="Avis et contenus publiés"><p>Vous restez propriétaire de vos contenus (photos, textes, avis) mais nous autorisez à les afficher sur la plateforme. Nous pouvons retirer un contenu illicite, trompeur ou injurieux.</p></S>
      <S n="9" t="Signalements et litiges"><p>Un étudiant ou un bailleur peut signaler un problème sur une réservation payée. L'équipe examine le cas, peut demander des précisions, puis communique sa décision aux deux parties. Cette décision ne remplace pas un recours devant la justice.</p></S>
      <S n="10" t="Suspension et fin du compte"><p>Nous pouvons suspendre un compte en cas de non-respect de ces conditions, de fraude ou de signalements graves. Vous pouvez demander la suppression de votre compte à l'adresse indiquée plus bas.</p></S>
      <S n="11" t="Responsabilité"><p>[À VALIDER PAR UN JURISTE : limites de responsabilité de la plateforme, notamment pour les informations fournies par les bailleurs, les échanges entre utilisateurs et les indisponibilités du service.]</p></S>
      <S n="12" t="Données personnelles"><p>Le traitement de vos données est décrit dans la <Link to="/confidentialite" className="font-bold text-brand underline">politique de confidentialité</Link>.</p></S>
      <S n="13" t="Modification des conditions"><p>Nous pouvons modifier ces conditions. En cas de changement important, les utilisateurs en sont informés. Continuer à utiliser la plateforme vaut acceptation.</p></S>
      <S n="14" t="Droit applicable"><p>[À CONFIRMER PAR UN JURISTE : droit applicable (droit camerounais) et juridiction compétente.]</p></S>
      <S n="15" t="Contact"><p>{L.name} · {L.address} · {L.email}</p></S>
    </Page>
  );
}

export function Privacy() {
  return (
    <Page title="Politique de confidentialité">
      <S n="1" t="Qui est responsable de vos données ?"><p>{L.name}, {L.address}. Contact : {L.email}.</p></S>
      <S n="2" t="Quelles données collectons-nous ?">
        <Ul items={["Compte : nom, adresse e-mail, numéro de téléphone, mot de passe (conservé sous forme chiffrée, jamais en clair), rôle, date d'acceptation des conditions.", "Bailleurs : annonces, photos, et pour la certification, des pièces justificatives (identité, propriété, domicile).", "Étudiants : favoris, « j'aime », avis, profil de colocation (budget, filière, campus, mode de vie, présentation).", "Réservations : logement, montant, opérateur et numéro Mobile Money, référence de transaction, reçu.", "Messages échangés dans la messagerie, et signalements.", "Localisation : seulement si vous cliquez sur « Ma position » pour une annonce.", "Données techniques : un identifiant anonyme du navigateur et, à défaut, une empreinte de l'adresse IP, pour ne compter qu'une vue par personne ; journaux de sécurité."]} />
      </S>
      <S n="3" t="Pourquoi ?"><Ul items={["Fournir le service : comptes, annonces, réservations, messagerie, reçus.", "Sécuriser la plateforme : modération, vérification des bailleurs, prévention de la fraude, traitement des litiges.", "Vous prévenir : alertes WhatsApp ou SMS lors d'un nouveau message ou d'une décision, lorsque ce service est activé.", "Respecter nos obligations légales."]} /></S>
      <S n="4" t="Qui voit vos données ?">
        <Ul items={["Les autres utilisateurs : votre prénom et l'initiale de votre nom (avis, messagerie, colocation). Jamais votre numéro de téléphone ni votre e-mail.", "Les pièces justificatives des bailleurs : uniquement l'équipe d'administration. Chaque consultation est enregistrée.", "Nos prestataires techniques : hébergement du site et de l'API, base de données, services de cartes et d'itinéraires (OpenStreetMap : adresses et coordonnées envoyées pour calculer un trajet), prestataire de paiement Mobile Money, prestataire d'envoi des alertes.", "Les autorités, si la loi l'exige."]} />
        <p>Certains prestataires sont situés hors du Cameroun. [À COMPLÉTER : liste des prestataires et pays d'hébergement.]</p>
      </S>
      <S n="5" t="Combien de temps ?"><p>[À DÉFINIR : durée de conservation des comptes, messages, pièces justificatives et reçus. À titre d'exemple, les pièces d'un dossier refusé ou d'un compte supprimé sont effacées dans un délai court.]</p></S>
      <S n="6" t="Vos droits"><p>Vous pouvez demander l'accès à vos données, leur correction, leur suppression ou vous opposer à certains traitements, en écrivant à {L.email}. Nous répondons dans un délai raisonnable.</p></S>
      <S n="7" t="Sécurité"><Ul items={["Mots de passe chiffrés, connexion sécurisée (HTTPS).", "Pièces justificatives stockées dans un espace privé, sans lien public.", "Accès d'administration restreint et journalisé."]} /></S>
      <S n="8" t="Stockage dans votre navigateur"><p>Le site enregistre dans votre navigateur : votre session de connexion, votre choix de thème clair ou sombre et un identifiant anonyme de visiteur. Nous n'utilisons ni publicité ni suivi par des tiers.</p></S>
      <S n="9" t="Mineurs"><p>Le service s'adresse aux étudiants. [À COMPLÉTER : règles applicables aux personnes mineures.]</p></S>
      <S n="10" t="Mises à jour"><p>Cette politique peut évoluer ; la date de version figure en haut de la page.</p></S>
    </Page>
  );
}

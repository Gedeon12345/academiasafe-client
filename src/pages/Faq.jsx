import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const CONTACT = import.meta.env.VITE_CONTACT_EMAIL; // renseignez votre adresse dans .env (VITE_CONTACT_EMAIL)

const SECTIONS = [
  ['Se loger en sécurité', [
    ['Comment éviter les arnaques ?', "Ne payez jamais en dehors de la plateforme, ne versez rien avant d'avoir posé vos questions au bailleur, et visitez le logement dès que possible. Un paiement fait ici génère un reçu PDF numéroté avec un QR code : si on vous propose un autre moyen de payer, méfiez-vous."],
    ['Que signifie « Cité certifiée » ?', "Le badge vert est attribué par notre équipe après un contrôle du logement. Il se voit sur les cartes et sur la fiche. Une annonce sans badge n'est pas forcément mauvaise, mais elle n'a pas encore été contrôlée."],
    ["Mon numéro est-il visible par les bailleurs ?", "Non, pas avant que vous leur écriviez. Quand vous envoyez un message depuis une annonce, votre nom et votre numéro sont transmis au bailleur pour qu'il puisse vous répondre. Le numéro du bailleur n'est jamais affiché publiquement."],
  ]],
  ['Réservation et paiement', [
    ["Qu'est-ce que l'acompte ?", "C'est la somme qui bloque le logement à votre nom : la caution de l'annonce, ou un loyer si elle n'en prévoit pas. Le montant exact s'affiche avant que vous payiez."],
    ['Comment payer ?', "Par Mobile Money (MTN ou Orange). Vous choisissez votre opérateur, puis vous validez le paiement sur votre téléphone. La page se met à jour toute seule."],
    ['Deux étudiants peuvent-ils réserver le même logement ?', "Non. Le premier paiement confirmé bloque le logement. Si quelqu'un vous devance pendant votre paiement, votre réservation n'est pas confirmée."],
    ['Où trouver mon reçu ?', "Dans « Mes réservations », bouton « Télécharger le reçu PDF ». Le QR code du reçu mène à une page publique qui confirme qu'il est authentique."],
  ]],
  ['Avis, favoris et « j’aime »', [
    ['Qui peut laisser un avis ?', "Seuls les étudiants ayant une réservation confirmée sur le logement. Chaque étudiant a un seul avis par logement, qu'il peut modifier ou supprimer."],
    ['Quelle différence entre favori et « j’aime » ?', "Le « j’aime » (cœur) est public et compte pour tous : il ne demande aucune réservation. Le favori (marque-page) est votre liste personnelle, privée, pour retrouver et comparer des logements."],
  ]],
  ['Trajet et colocation', [
    ['Comment le trajet est-il calculé ?', "À partir de l'adresse du logement et du campus, sur les vraies routes. Les tarifs moto et taxi sont des estimations par trajet, qui peuvent varier."],
    ['Comment fonctionne le taux d’affinité ?', "Il compare votre budget, votre ambiance (calme ou festif), le tabac et vos horaires de sommeil avec ceux de l'autre étudiant. Il apparaît dès que vous avez créé votre propre profil."],
  ]],
  ['Bailleurs', [
    ['Comment publier une annonce ?', "Créez un compte bailleur, puis « Déposer une annonce ». La distance et le trajet vers le campus sont calculés automatiquement. Les modifications de contenu peuvent repasser l'annonce en modération."],
  ]],
];

export default function Faq() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:py-12">
      <h1 className="text-3xl font-extrabold md:text-4xl">Sécurité et questions fréquentes</h1>
      <p className="mt-2 text-lg text-slate-600">Tout ce qu'il faut savoir pour se loger sereinement.</p>

      <aside className="mt-6 flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
        <ShieldAlert className="mt-0.5 flex-none" aria-hidden="true" />
        <p className="leading-relaxed"><b>Règle d'or :</b> ne payez jamais en dehors de la plateforme, et ne communiquez jamais de code reçu par SMS. Un bailleur honnête accepte les questions et les visites.</p>
      </aside>

      {SECTIONS.map(([title, items]) => (
        <section key={title} className="mt-8">
          <h2 className="mb-3 text-xl font-extrabold">{title}</h2>
          <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {items.map(([q, a]) => (
              <details key={q} className="group">
                <summary className="flex min-h-[3.5rem] cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-bold [&::-webkit-details-marker]:hidden">
                  {q}<span aria-hidden="true" className="flex-none text-2xl font-normal text-brand transition group-open:rotate-45">+</span>
                </summary>
                <p className="px-4 pb-4 leading-relaxed text-slate-700">{a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}

      <p className="mt-10 text-center text-slate-600">
        Une autre question ou un problème à signaler ? {CONTACT ? <a className="font-bold text-brand" href={`mailto:${CONTACT}`}>{CONTACT}</a> : <>Écrivez au bailleur depuis l'annonce, ou <Link to="/about" className="font-bold text-brand">contactez-nous</Link>.</>}
      </p>
    </div>
  );
}

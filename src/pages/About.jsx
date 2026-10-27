import { BadgeCheck, Building2, GraduationCap, Route, ShieldCheck, Users } from 'lucide-react';
import { ButtonLink } from '../components/ui';

const CONTACT = import.meta.env.VITE_CONTACT_EMAIL;

export default function About() {
  return (
    <div>
      <section className="bg-gradient-to-br from-brand to-blue-600 px-4 py-14 text-white md:px-8 md:py-24 xl:px-12">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-100">À propos</p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight md:text-6xl">Se loger près du campus ne devrait pas être un risque.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-blue-100">AcademiaSafe rassemble étudiants, bailleurs et futurs colocataires autour de logements contrôlés, de prix clairs et d'une réservation qui laisse une preuve.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
        <h2 className="text-2xl font-extrabold md:text-3xl">Le problème que nous résolvons</h2>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-slate-700">Chercher un logement étudiant, c'est souvent faire face aux fausses annonces, à l'insalubrité, aux coûts cachés (loyer, transport) et à la difficulté de trouver un colocataire compatible. Nous avons construit une plateforme qui répond à chacun de ces points.</p>

        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {[[ShieldCheck, 'Confiance', 'Annonces modérées, badge « Cité certifiée » après contrôle, avis réservés à ceux qui ont réservé.'],
            [Route, 'Transparence', 'Loyer, caution, distance, durée et tarif des trajets : tout est affiché avant de s\'engager.'],
            [BadgeCheck, 'Preuve', 'Chaque réservation produit un reçu PDF numéroté avec un QR code vérifiable par tous.']].map(([Icon, t, d]) => (
            <li key={t} className="rounded-2xl border border-slate-200 bg-white p-6"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-brand"><Icon aria-hidden="true" /></span><h3 className="mt-4 text-lg font-bold">{t}</h3><p className="mt-1 leading-relaxed text-slate-600">{d}</p></li>
          ))}
        </ul>
      </section>

      <section className="bg-slate-50 px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-extrabold md:text-3xl">Pour qui ?</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[[GraduationCap, 'Étudiants', 'Cherchez sans compte, comparez, réservez et gardez votre reçu.', '/logements', 'Voir les logements'],
              [Building2, 'Bailleurs', 'Publiez votre annonce et répondez aux étudiants dans la messagerie, avec une alerte WhatsApp ou SMS à chaque message.', '/bailleur/annonces/nouvelle', 'Déposer une annonce'],
              [Users, 'Colocataires', 'Trouvez quelqu\'un dont le mode de vie vous ressemble.', '/colocataires', 'Voir les profils']].map(([Icon, t, d, to, cta]) => (
              <article key={t} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6"><Icon className="text-brand" aria-hidden="true" /><h3 className="mt-3 text-lg font-bold">{t}</h3><p className="mb-5 mt-1 flex-1 leading-relaxed text-slate-600">{d}</p><ButtonLink to={to} variant="outline">{cta}</ButtonLink></article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 text-center md:py-16">
        <h2 className="text-2xl font-extrabold">Une question ?</h2>
        <p className="mt-2 text-slate-600">{CONTACT ? <>Écrivez-nous : <a className="font-bold text-brand" href={`mailto:${CONTACT}`}>{CONTACT}</a></> : 'Consultez la foire aux questions, ou écrivez directement au bailleur depuis son annonce.'}</p>
        <div className="mt-5"><ButtonLink to="/faq">Sécurité et FAQ</ButtonLink></div>
      </section>
    </div>
  );
}

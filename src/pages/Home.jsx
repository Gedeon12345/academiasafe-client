import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Building2, FileCheck, Quote, Route, Search, ShieldCheck, Users } from 'lucide-react';
import { api } from '../lib/api';
import ListingCard from '../components/ListingCard';
import TripIllustration from '../components/TripIllustration';
import { Button, Stars } from '../components/ui';
import { EmptyState, ErrorState, ListingSkeletonGrid } from '../components/feedback';

const input = 'mt-1 h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base';
const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5';
const wrap = 'px-4 md:px-8 xl:px-12';

function useFetch(url) {
  const [s, setS] = useState({ loading: true, data: null, error: '' });
  const [n, setN] = useState(0);
  useEffect(() => {
    let off = false;
    setS((x) => ({ ...x, loading: true, error: '' }));
    api.get(url).then((d) => !off && setS({ loading: false, data: d, error: '' })).catch((e) => !off && setS({ loading: false, data: null, error: e.message }));
    return () => { off = true; };
  }, [url, n]);
  return [s, () => setN((v) => v + 1)];
}

function Row({ state, reload, empty }) {
  if (state.loading) return <ListingSkeletonGrid n={3} />;
  if (state.error) return <ErrorState message={state.error} onRetry={reload} />;
  if (!state.data?.data.length) return empty;
  return <div className={GRID}>{state.data.data.map((l) => <ListingCard key={l._id} listing={l} photoHeight="h-44" />)}</div>;
}

const Head = ({ title, text, to, link = 'Voir tout' }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
    <div><h2 className="text-2xl font-extrabold md:text-4xl">{title}</h2>{text && <p className="mt-1 max-w-xl text-slate-600">{text}</p>}</div>
    {to && <Link to={to} className="flex h-11 items-center gap-1 text-sm font-bold text-brand">{link}<ArrowRight size={16} aria-hidden="true" /></Link>}
  </div>
);

const FAQ = [
  ['Dois-je créer un compte pour chercher ?', "Non. Vous consultez les logements, les profils de colocation et les trajets librement. Un compte sert à réserver, écrire à un bailleur ou enregistrer des favoris."],
  ["Comment éviter les arnaques ?", "Ne payez jamais en dehors de la plateforme : l'acompte payé ici bloque le logement et produit un reçu PDF avec un QR code que chacun peut vérifier."],
  ['Mon numéro de téléphone est-il visible ?', "Non. Vos échanges avec un bailleur ou un colocataire passent par la messagerie de l'application."],
];

export default function Home() {
  const navigate = useNavigate();
  const [campus, setCampus] = useState('');
  const [max, setMax] = useState('');
  const [certified, reloadCertified] = useFetch('/listings?certified=true&sort=rating&limit=3');
  const [popular, reloadPopular] = useFetch('/listings?sort=likes&limit=4');
  const [stats] = useFetch('/stats');
  const [reviews] = useFetch('/reviews/recent');
  const st = stats.data;

  const search = (e) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (campus) q.set('campus', campus);
    if (max) { q.set('max', max); q.set('period', 'monthly'); }
    navigate(`/logements?${q}`);
  };

  return (
    <div>
      {/* Héros : le trajet est l'argument */}
      <section className={`relative overflow-hidden pb-14 pt-8 md:pb-24 md:pt-14 ${wrap}`}>
        <div className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-brand/10 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-[1500px] items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h1 className="text-[2.6rem] font-extrabold leading-[1.02] md:text-6xl xl:text-7xl">Le bon logement, à la bonne distance de votre campus.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">Bailleurs contrôlés, trajet à pied, en moto et en taxi calculé d'avance, acompte par Mobile Money et reçu vérifiable. Pas de compte pour chercher.</p>

            <form onSubmit={search} className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[1.4fr_1fr_auto] sm:items-end">
              <label className="block text-sm font-semibold">Votre campus
                <input className={input} list="campus-list" placeholder="Université de Douala" value={campus} onChange={(e) => setCampus(e.target.value)} />
                <datalist id="campus-list">{st?.topCampuses?.map((c) => <option key={c.name} value={c.name} />)}</datalist>
              </label>
              <label className="block text-sm font-semibold">Budget (FCFA / mois)
                <input className={input} inputMode="numeric" placeholder="50000" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ''))} />
              </label>
              <Button type="submit" variant="accent" className="h-12 w-full text-base sm:w-auto"><Search size={18} className="mr-2" aria-hidden="true" />Chercher</Button>
            </form>

            {st?.topCampuses?.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-600">Près de :</span>
                {st.topCampuses.slice(0, 4).map((c) => <Link key={c.name} to={`/logements?campus=${encodeURIComponent(c.name)}`} className="flex min-h-[2.5rem] items-center rounded-full border border-slate-300 bg-white px-3.5 text-sm font-semibold hover:border-brand">{c.name} <span className="ml-1.5 text-slate-600">{c.count}</span></Link>)}
              </div>
            )}
          </div>
          <TripIllustration className="mx-auto w-full max-w-xl pb-6" />
        </div>
      </section>

      {/* Ce qui nous distingue : trois blocs de poids différents */}
      <section className={`pb-14 md:pb-24 ${wrap}`}>
        <div className="mx-auto grid max-w-[1500px] gap-5 lg:grid-cols-[1.25fr_1fr]">
          <article className="rounded-3xl bg-brand p-7 text-white md:p-10 lg:row-span-2">
            <Route size={32} aria-hidden="true" />
            <h2 className="mt-5 max-w-md text-3xl font-extrabold md:text-4xl">Le trajet est calculé avant même la visite.</h2>
            <p className="mt-3 max-w-lg leading-relaxed text-blue-100">À chaque annonce, la distance se calcule sur les vraies routes jusqu'à l'université la plus proche, avec le temps à pied, en moto et en taxi, et le budget transport par jour. Plus de mauvaise surprise le premier lundi.</p>
            <ul className="mt-6 grid max-w-md gap-2 text-sm font-semibold sm:grid-cols-3">
              {['À pied : gratuit', 'Moto : dès 250 FCFA', 'Taxi : dès 300 FCFA'].map((t) => <li key={t} className="rounded-xl bg-white/12 px-3 py-2.5 ring-1 ring-white/25">{t}</li>)}
            </ul>
            <p className="mt-2 text-xs text-blue-100">Tarifs indicatifs ; le détail exact s'affiche sur chaque fiche.</p>
          </article>
          <article className="rounded-3xl bg-safe-soft p-7">
            <ShieldCheck className="text-safe-dark" aria-hidden="true" /><h3 className="mt-3 text-xl font-extrabold text-safe-dark">Des annonces contrôlées</h3>
            <p className="mt-1 leading-relaxed text-slate-700">Chaque annonce est relue avant publication. Le badge « Cité certifiée » signale un logement vérifié par l'équipe, et les bailleurs peuvent faire certifier leur identité.</p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-7">
            <FileCheck className="text-brand" aria-hidden="true" /><h3 className="mt-3 text-xl font-extrabold">Une preuve à chaque réservation</h3>
            <p className="mt-1 leading-relaxed text-slate-700">L'acompte bloque le logement à votre nom et génère un reçu PDF numéroté. Son QR code mène à une page publique qui confirme qu'il est authentique.</p>
          </article>
        </div>
      </section>

      {/* Les logements */}
      <section className={`pb-14 md:pb-20 ${wrap}`}>
        <div className="mx-auto max-w-[1500px]">
          <Head title="Cités certifiées" text="Les logements contrôlés par notre équipe." to="/logements?certified=true" />
          <Row state={certified} reload={reloadCertified}
            empty={<EmptyState icon={BadgeCheck} title="Les premières cités certifiées arrivent" text="En attendant, découvrez tous les logements près de votre campus." actions={<Link to="/logements" className="flex h-12 items-center rounded-xl bg-brand px-5 font-bold text-white">Voir tous les logements</Link>} />} />
        </div>
      </section>
      {(popular.loading || popular.error || popular.data?.data.length > 0) && (
        <section className={`pb-14 md:pb-20 ${wrap}`}>
          <div className="mx-auto max-w-[1500px]"><Head title="Les plus aimés" text="Les préférés des étudiants." to="/logements?sort=likes" /><Row state={popular} reload={reloadPopular} empty={null} /></div>
        </section>
      )}

      {/* Les étapes : des arrêts le long du trajet */}
      <section className={`pb-14 md:pb-24 ${wrap}`}>
        <div className="mx-auto max-w-[1500px]">
          <Head title="De la recherche aux clés" />
          <ol className="relative grid gap-8 md:grid-cols-4">
            <div className="absolute left-5 right-5 top-5 hidden border-t-[3px] border-dashed border-taxi md:block" aria-hidden="true" />
            {[['Cherchez', "Filtrez par campus, budget et équipements, en liste ou sur la carte."], ['Comparez le trajet', 'Temps à pied, tarif moto et taxi, budget par jour.'], ['Réservez', "Un acompte par Mobile Money bloque le logement à votre nom."], ['Emménagez', 'Gardez votre reçu, échangez avec le bailleur dans la messagerie.']].map(([t, d], i) => (
              <li key={t} className="relative flex gap-4 md:block">
                <span className="relative z-10 flex h-10 w-10 flex-none items-center justify-center rounded-full bg-taxi font-display text-lg font-extrabold text-ink ring-4 ring-surface">{i + 1}</span>
                <div className="md:mt-4"><h3 className="text-lg font-extrabold">{t}</h3><p className="mt-1 text-sm leading-relaxed text-slate-600">{d}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Colocation */}
      <section className={`pb-14 md:pb-24 ${wrap}`}>
        <div className="mx-auto grid max-w-[1500px] items-center gap-6 overflow-hidden rounded-3xl bg-ink p-7 text-white md:grid-cols-[1.3fr_1fr] md:p-12">
          <div>
            <p className="flex items-center gap-2 font-semibold text-emerald-300"><Users size={18} aria-hidden="true" />Colocation</p>
            <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">Un colocataire qui vous ressemble.</h2>
            <p className="mt-3 max-w-xl leading-relaxed text-slate-300">Budget, filière, calme ou festif, fumeur ou non, heure du coucher : chaque profil affiche son taux d'affinité avec le vôtre. Vous écrivez dans la messagerie, sans donner votre numéro.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/colocataires" className="flex h-12 items-center rounded-xl bg-white px-6 font-bold text-ink">Voir les profils</Link>
              <Link to="/profil-colocataire" className="flex h-12 items-center rounded-xl border-2 border-white/40 px-6 font-bold text-white hover:border-white">Créer mon profil</Link>
            </div>
          </div>
          <div className="hidden justify-self-end md:block" aria-hidden="true">
            <div className="relative h-44 w-72">
              {[['A', 'left-0 top-4 bg-white text-ink'], ['D', 'left-24 top-0 bg-taxi text-ink'], ['S', 'left-48 top-6 bg-safe text-white']].map(([l, c]) => <span key={l} className={`absolute flex h-24 w-24 items-center justify-center rounded-full font-display text-4xl font-extrabold ring-4 ring-ink ${c}`}>{l}</span>)}
              <span className="absolute bottom-0 left-8 rounded-full bg-white px-4 py-2 font-extrabold text-safe-dark">86 % d'affinité</span>
            </div>
          </div>
        </div>
      </section>

      {/* Vrais avis */}
      {reviews.data?.data.length > 0 && (
        <section className={`pb-14 md:pb-24 ${wrap}`}>
          <div className="mx-auto max-w-[1500px]"><Head title="Ce que disent les étudiants" />
            <div className="grid gap-5 md:grid-cols-3">
              {reviews.data.data.map((r) => (
                <figure key={r._id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6">
                  <Quote className="text-brand/40" aria-hidden="true" />
                  <blockquote className="mt-2 line-clamp-5 flex-1 leading-relaxed text-slate-700">{r.comment}</blockquote>
                  <figcaption className="mt-4 flex items-center justify-between gap-2 text-sm"><span><b>{r.author}</b><Link to={`/logements/${r.listingId}`} className="block truncate text-slate-600 hover:text-brand">{r.listingTitle}</Link></span><Stars value={r.rating} /></figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Questions fréquentes */}
      <section className={`pb-14 md:pb-24 ${wrap}`}>
        <div className="mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-[1fr_1.6fr]">
          <div><h2 className="text-2xl font-extrabold md:text-4xl">Des questions ?</h2><p className="mt-2 text-slate-600">Les réponses essentielles, et le reste dans la page Sécurité et FAQ.</p><Link to="/faq" className="mt-4 inline-flex h-11 items-center gap-1 font-bold text-brand">Toutes les questions<ArrowRight size={16} aria-hidden="true" /></Link></div>
          <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group">
                <summary className="flex min-h-[3.5rem] cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 font-bold [&::-webkit-details-marker]:hidden">{q}<span aria-hidden="true" className="flex-none text-2xl font-normal text-brand transition group-open:rotate-45">+</span></summary>
                <p className="px-5 pb-4 leading-relaxed text-slate-700">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Bailleurs */}
      <section className={`pb-16 ${wrap}`}>
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-5 rounded-3xl bg-taxi p-7 text-ink md:p-12">
          <div className="max-w-2xl"><p className="flex items-center gap-2 font-bold"><Building2 size={18} aria-hidden="true" />Vous êtes bailleur ?</p>
            <h2 className="mt-2 text-2xl font-extrabold md:text-4xl">Publiez votre logement, les étudiants le trouvent.</h2>
            <p className="mt-2 leading-relaxed">Annonce gratuite, trajet vers le campus calculé automatiquement, échanges dans la messagerie et alerte à chaque réservation.</p></div>
          <Link to="/bailleur/annonces/nouvelle" className="flex h-12 items-center gap-2 rounded-xl bg-ink px-6 font-bold text-white">Déposer une annonce<ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
      </section>
    </div>
  );
}

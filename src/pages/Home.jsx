import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Building2, Check, FileCheck, Quote, Route, Search, ShieldCheck, Users, Wallet } from 'lucide-react';
import { api } from '../lib/api';
import ListingCard from '../components/ListingCard';
import { Button, ButtonLink, Stars } from '../components/ui';
import { EmptyState, ErrorState, ListingSkeletonGrid } from '../components/feedback';

const input = 'mt-1 h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base';
const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5';

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

// Illustration : un quartier, un campus et le trajet entre les deux, avec trois « puces » qui résument le service.
function HeroArt() {
  const chip = 'absolute flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-sm font-bold shadow-xl';
  return (
    <div className="relative mx-auto w-full max-w-xl" aria-hidden="true">
      <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand via-blue-700 to-blue-500 shadow-2xl">
        <svg viewBox="0 0 500 400" className="h-full w-full">
          <circle cx="400" cy="70" r="38" fill="#FDE68A" opacity=".9" />
          <g fill="#fff" opacity=".12"><circle cx="90" cy="80" r="50" /><circle cx="130" cy="95" r="36" /></g>
          <path d="M0 310 Q125 270 250 300 T500 285 V400 H0Z" fill="#1E3A8A" opacity=".55" />
          {[[40, 200, 70, 130], [120, 160, 60, 170], [190, 215, 55, 115]].map(([x, y, w, h], i) => (
            <g key={i}><rect x={x} y={y} width={w} height={h} rx="6" fill="#DBEAFE" />{[0, 1, 2, 3].map((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={x + 12 + c * (w / 2 - 6)} y={y + 14 + r * 28} width="14" height="16" rx="3" fill="#1E40AF" opacity=".55" />))}</g>
          ))}
          <g><rect x="330" y="170" width="120" height="160" rx="8" fill="#ECFDF5" /><path d="M322 172 L390 130 L458 172Z" fill="#047857" />
            {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={345 + c * 34} y={190 + r * 36} width="18" height="22" rx="3" fill="#047857" opacity=".5" />))}<rect x="378" y="296" width="24" height="34" rx="3" fill="#047857" /></g>
          <rect x="0" y="330" width="500" height="70" fill="#172554" />
          <path d="M112 330 C 180 380, 260 300, 338 330" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 12" />
          <g transform="translate(96 296)"><path d="M16 0C7 0 0 7 0 16c0 12 16 26 16 26s16-14 16-26C32 7 25 0 16 0z" fill="#1E40AF" stroke="#fff" strokeWidth="3" /><circle cx="16" cy="16" r="6" fill="#fff" /></g>
        </svg>
      </div>
      <div className={`${chip} -left-2 top-6 text-safe-dark sm:-left-6`}><span className="flex h-6 w-6 items-center justify-center rounded-full bg-safe-dark text-white"><Check size={14} strokeWidth={3} /></span>Cité certifiée</div>
      <div className={`${chip} -right-2 top-1/3 text-slate-800 sm:-right-6`}><Route size={18} className="text-brand" />12 min à pied</div>
      <div className={`${chip} bottom-8 left-4 text-slate-800 sm:-left-4`}><FileCheck size={18} className="text-brand" />Reçu PDF + QR code</div>
    </div>
  );
}

function ListingsBlock({ state, reload, empty }) {
  if (state.loading) return <ListingSkeletonGrid n={3} />;
  if (state.error) return <ErrorState message={state.error} onRetry={reload} />;
  if (!state.data?.data.length) return empty;
  return <div className={GRID}>{state.data.data.map((l) => <ListingCard key={l._id} listing={l} photoHeight="h-40" />)}</div>;
}

const Head = ({ title, text, to, link = 'Voir tout' }) => (
  <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
    <div><h2 className="text-2xl font-extrabold md:text-3xl">{title}</h2>{text && <p className="mt-1 text-slate-600">{text}</p>}</div>
    {to && <Link to={to} className="flex h-11 items-center gap-1 text-sm font-bold text-brand">{link}<ArrowRight size={16} aria-hidden="true" /></Link>}
  </div>
);

export default function Home() {
  const navigate = useNavigate();
  const [campus, setCampus] = useState('');
  const [max, setMax] = useState('');
  const [certified, reloadCertified] = useFetch('/listings?certified=true&sort=rating&limit=3');
  const [popular, reloadPopular] = useFetch('/listings?sort=likes&limit=4');
  const [stats] = useFetch('/stats');
  const [reviews] = useFetch('/reviews/recent');

  const search = (e) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (campus) q.set('campus', campus);
    if (max) { q.set('max', max); q.set('period', 'monthly'); }
    navigate(`/logements?${q}`);
  };
  const st = stats.data;
  const wrap = 'px-4 md:px-8 xl:px-12';

  return (
    <div>
      {/* Héros */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-safe/10 blur-3xl" aria-hidden="true" />
        <div className={`relative grid items-center gap-12 py-10 lg:grid-cols-2 lg:py-20 ${wrap}`}>
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-safe-soft px-3.5 py-1.5 text-sm font-bold text-safe-dark"><ShieldCheck size={16} aria-hidden="true" />Logements étudiants vérifiés</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] md:text-5xl xl:text-6xl">
              Votre logement près du campus, <span className="bg-gradient-to-r from-brand to-safe bg-clip-text text-transparent dark:from-blue-300 dark:to-emerald-300">sans arnaque</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">Bailleurs contrôlés, prix et trajet calculés d'avance, réservation sécurisée avec reçu PDF. Cherchez sans compte, connectez-vous seulement pour agir.</p>

            <form onSubmit={search} className="mt-7 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg sm:grid-cols-[1.4fr_1fr_auto] sm:items-end">
              <label className="block text-sm font-semibold">Campus<input className={input} placeholder="Université de Yaoundé I" value={campus} onChange={(e) => setCampus(e.target.value)} /></label>
              <label className="block text-sm font-semibold">Budget max (FCFA / mois)<input className={input} inputMode="numeric" placeholder="50000" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ''))} /></label>
              <Button type="submit" className="h-12 w-full sm:w-auto"><Search size={18} className="mr-2" aria-hidden="true" />Rechercher</Button>
            </form>

            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-700">
              {['Bailleurs vérifiés', 'Prix transparents', 'Trajet calculé', 'Paiement Mobile Money'].map((t) => <li key={t} className="flex items-center gap-1.5"><Check size={16} className="text-safe" aria-hidden="true" />{t}</li>)}
            </ul>
          </div>
          <HeroArt />
        </div>
      </section>

      {/* Chiffres */}
      {st?.listings > 0 && (
        <section className={`pb-6 ${wrap}`} aria-label="La plateforme en chiffres">
          <dl className="grid grid-cols-2 gap-4 rounded-3xl border border-slate-200 bg-white p-5 md:grid-cols-4 md:p-8">
            {[[st.listings, 'logements en ligne'], [st.certified, 'cités certifiées'], [st.campuses, 'campus couverts'], [st.reviews, 'avis d’étudiants']].map(([n, label]) => (
              <div key={label} className="text-center"><dd className="text-3xl font-extrabold text-brand md:text-4xl">{n}</dd><dt className="text-sm font-semibold text-slate-600">{label}</dt></div>
            ))}
          </dl>
        </section>
      )}

      {/* Comment ça marche */}
      <section className={`py-10 md:py-14 ${wrap}`}>
        <Head title="Comment ça marche" text="De la recherche à la remise des clés, en quatre étapes." />
        <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[[Search, 'Cherchez', 'Filtrez par campus, budget et commodités. Aucun compte nécessaire.'],
            [Route, 'Comparez le trajet', 'Distance, temps à pied, tarif moto et taxi, calculés pour vous.'],
            [ShieldCheck, 'Réservez en sécurité', 'Acompte par Mobile Money : le logement est bloqué à votre nom.'],
            [FileCheck, 'Gardez la preuve', 'Reçu PDF avec QR code vérifiable, et alerte WhatsApp ou SMS.']].map(([Icon, t, d], i) => (
            <li key={t} className="relative rounded-2xl border border-slate-200 bg-white p-5">
              <span className="absolute right-4 top-3 text-5xl font-extrabold text-slate-200" aria-hidden="true">{i + 1}</span>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-brand"><Icon aria-hidden="true" /></span>
              <h3 className="mt-3 text-lg font-bold">{t}</h3><p className="mt-1 text-sm leading-relaxed text-slate-600">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Cités certifiées */}
      <section className={`py-6 md:py-10 ${wrap}`}>
        <Head title="Cités certifiées" text="Contrôlées par notre équipe avant d'afficher le badge." to="/logements?certified=true" />
        <ListingsBlock state={certified} reload={reloadCertified}
          empty={<EmptyState icon={BadgeCheck} title="Les premières cités certifiées arrivent" text="En attendant, découvrez tous les logements près de votre campus." actions={<ButtonLink to="/logements">Voir tous les logements</ButtonLink>} />} />
      </section>

      {/* Les plus aimés */}
      {(popular.loading || popular.error || popular.data?.data.length > 0) && (
        <section className={`py-6 md:py-10 ${wrap}`}>
          <Head title="Les plus aimés" text="Les logements préférés des étudiants." to="/logements?sort=likes" />
          <ListingsBlock state={popular} reload={reloadPopular} empty={null} />
        </section>
      )}

      {/* Colocation */}
      <section className={`py-10 md:py-14 ${wrap}`}>
        <div className="grid items-center gap-6 overflow-hidden rounded-3xl bg-gradient-to-br from-safe-dark to-emerald-600 p-6 text-white md:grid-cols-[1.4fr_1fr] md:p-12">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-emerald-100"><Users size={18} aria-hidden="true" />Colocation</p>
            <h2 className="mt-2 text-2xl font-extrabold md:text-4xl">Trouvez un colocataire qui vous ressemble</h2>
            <p className="mt-3 max-w-xl leading-relaxed text-emerald-50">Budget, filière, calme ou festif, fumeur ou non, horaires de sommeil : chaque profil affiche son taux d'affinité avec le vôtre.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/colocataires" className="flex h-12 items-center rounded-xl bg-white px-6 font-bold text-safe-dark">Voir les profils</Link>
              <Link to="/profil-colocataire" className="flex h-12 items-center rounded-xl border-2 border-white px-6 font-bold text-white">Créer mon profil</Link>
            </div>
          </div>
          <div className="hidden justify-self-end md:block" aria-hidden="true">
            <div className="flex -space-x-4">{['A', 'D', 'S'].map((l, i) => <span key={l} className={`flex h-20 w-20 items-center justify-center rounded-full border-4 border-emerald-500 text-2xl font-extrabold ${['bg-white text-safe-dark', 'bg-blue-100 text-brand', 'bg-amber-100 text-amber-900'][i]}`}>{l}</span>)}</div>
            <p className="mt-3 text-right text-4xl font-extrabold">86 %</p><p className="text-right text-sm text-emerald-100">d'affinité</p>
          </div>
        </div>
      </section>

      {/* Vrais avis */}
      {reviews.data?.data.length > 0 && (
        <section className={`py-6 md:py-10 ${wrap}`}>
          <Head title="Ce que disent les étudiants" />
          <div className="grid gap-4 md:grid-cols-3">
            {reviews.data.data.map((r) => (
              <figure key={r._id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <Quote className="text-brand/40" aria-hidden="true" />
                <blockquote className="mt-2 line-clamp-5 leading-relaxed text-slate-700">{r.comment}</blockquote>
                <figcaption className="mt-4 flex items-center justify-between gap-2 text-sm"><span><b>{r.author}</b><Link to={`/logements/${r.listingId}`} className="block truncate text-slate-600 hover:text-brand">{r.listingTitle}</Link></span><Stars value={r.rating} /></figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Pourquoi */}
      <section className={`py-10 md:py-14 ${wrap}`}>
        <Head title="Pourquoi AcademiaSafe" />
        <ul className="grid gap-4 md:grid-cols-3">
          {[[ShieldCheck, 'Bailleurs vérifiés', "Les annonces sont modérées et les cités peuvent recevoir le badge « certifiée » après contrôle."],
            [Wallet, 'Aucune surprise', 'Loyer, caution, tarif des trajets et budget par jour : tout est visible dès la fiche.'],
            [FileCheck, 'Une preuve juridique', 'Chaque réservation produit un reçu PDF numéroté, avec un QR code qui prouve son authenticité.']].map(([Icon, t, d]) => (
            <li key={t} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5"><Icon className="mt-0.5 flex-none text-safe" aria-hidden="true" /><div><b className="text-lg">{t}</b><p className="mt-1 text-sm leading-relaxed text-slate-600">{d}</p></div></li>
          ))}
        </ul>
      </section>

      {/* Bailleurs */}
      <section className={`pb-14 ${wrap}`}>
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-brand-dark p-6 text-white md:p-12 dark:bg-slate-800">
          <div className="max-w-2xl"><p className="flex items-center gap-2 text-sm font-bold text-blue-200"><Building2 size={18} aria-hidden="true" />Vous êtes bailleur ?</p>
            <h2 className="mt-2 text-2xl font-extrabold md:text-3xl">Publiez votre logement et touchez des étudiants près de votre quartier</h2>
            <p className="mt-2 text-blue-100">Annonce gratuite, photos, trajet vers le campus calculé automatiquement, et alerte à chaque réservation.</p></div>
          <Link to="/bailleur/annonces/nouvelle" className="flex h-12 items-center gap-2 rounded-xl bg-white px-6 font-bold text-brand">Déposer une annonce<ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
      </section>
    </div>
  );
}

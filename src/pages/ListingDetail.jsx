import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, SearchX, Share2 } from 'lucide-react';
import { api, qs } from '../lib/api';
import { fcfa, priceLabel } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { Button, ButtonLink, CertBadge, Chip } from '../components/ui';
import { EmptyState, ErrorState, Loader, PageLoader } from '../components/feedback';
import Gallery from '../components/Gallery';
import LikeButton from '../components/LikeButton';
import FavoriteButton from '../components/FavoriteButton';
import ExpandableText from '../components/ExpandableText';
import CommuteCard from '../components/CommuteCard';
import ReviewsSection from '../components/ReviewsSection';
import ContactDialog from '../components/ContactDialog';
import { useToast } from '../context/ToastContext';
import GeoSearchInput from '../components/GeoSearchInput';

const RouteMap = lazy(() => import('../components/RouteMap')); // Leaflet ne se charge que sur la fiche

const box = 'rounded-2xl border border-slate-200 bg-white p-4';

// Trajet vers le campus (calculé à l'enregistrement), vers une autre université proche, ou vers une destination choisie par le visiteur.
function Commute({ listing }) {
  const [dest, setDest] = useState(null); // { label, lat, lng, state: 'loading'|'ok'|'error', commute, error }
  const [sel, setSel] = useState(0);
  const choose = async (it) => {
    const base = { label: it.name, lat: it.lat, lng: it.lng };
    setDest({ ...base, state: 'loading' });
    try {
      const d = await api.get(`/listings/${listing._id}/commute` + qs({ lat: it.lat, lng: it.lng }));
      setDest({ ...base, state: 'ok', commute: d.commute });
    } catch (e) { setDest({ ...base, state: 'error', error: e.message }); }
  };
  const custom = dest?.state === 'ok';
  const campuses = listing.campuses?.length ? listing.campuses
    : listing.campusLocation?.lat != null ? [{ name: listing.campusTarget, location: listing.campusLocation, commute: listing.commute }] : [];
  const cur = campuses[Math.min(sel, campuses.length - 1)];
  const hasFrom = listing.location?.lat != null;
  const active = custom ? { to: { lat: dest.lat, lng: dest.lng }, label: dest.label, commute: dest.commute } : cur && hasFrom ? { to: cur.location, label: cur.name, commute: cur.commute } : null;
  return (
    <section className={`${box} md:col-span-2`} aria-labelledby="trajet">
      <h2 id="trajet" className="mb-3 text-lg font-bold">Trajet vers le campus</h2>
      {campuses.length > 1 && !custom && (
        <div role="tablist" aria-label="Universités proches" className="mb-4 flex flex-wrap gap-2">
          {campuses.map((c, i) => (
            <button key={c.name} role="tab" aria-selected={i === sel} onClick={() => setSel(i)}
              className={`min-h-[2.75rem] rounded-full border px-4 py-1.5 text-left text-sm font-semibold ${i === sel ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white text-slate-700'}`}>
              {c.name} <span className="font-normal opacity-80">· {String(c.commute.distanceKm).replace('.', ',')} km</span>
            </button>
          ))}
        </div>
      )}
      {listing.campusAuto && !custom && <p className="mb-3 text-xs text-slate-600">Universités proches détectées automatiquement à partir de l'adresse du logement.</p>}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {active && (
          <Suspense fallback={<div className="grid h-64 place-items-center"><Loader label="Chargement de la carte…" /></div>}>
            <RouteMap from={listing.location} to={active.to} path={active.commute?.path} walkPath={active.commute?.walkPath} fromLabel={listing.title} toLabel={active.label} commute={active.commute} />
          </Suspense>
        )}
        <div className={active ? '' : 'lg:col-span-2'}>
          {active?.commute ? <CommuteCard commute={active.commute} title={`Trajet vers ${active.label}`} />
            : <p className="text-sm text-slate-600">Trajet non disponible pour cette annonce.</p>}
          {dest?.state === 'loading' && <div className="py-4"><Loader label="Calcul de l'itinéraire…" /></div>}
          {dest?.state === 'error' && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{dest.error}</p>}
          <div className="mt-4 border-t border-slate-200 pt-3">
            <GeoSearchInput id="dest" label="Calculer vers une autre destination" placeholder="Autre campus, travail, gare…" onSelect={choose} />
            {dest && <button type="button" onClick={() => setDest(null)} className="mt-1 h-11 text-sm font-bold text-brand">Revenir au campus</button>}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, requireAuth } = useAuth();
  const [state, setState] = useState({ loading: true, listing: null, shareUrl: '', error: '' });
  const toast = useToast();
  const [tries, setTries] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);
  const fetched = useRef(null);

  // GET /api/listings/:id : le serveur ne compte qu'une vue par personne. Le garde évite le double appel de StrictMode.
  useEffect(() => {
    const key = `${id}:${tries}`;
    if (fetched.current === key) return;
    fetched.current = key;
    setState({ loading: true, listing: null, error: '' });
    api.get(`/listings/${id}`)
      .then((d) => setState({ loading: false, listing: d.listing, shareUrl: d.shareUrl, error: '' }))
      .catch((e) => setState({ loading: false, listing: null, error: e.status === 404 ? '404' : e.message }));
  }, [id, tries]);

  if (state.loading) return <PageLoader label="Ouverture de la fiche…" />;
  if (state.error === '404') {
    return (
      <div className="px-4 py-12">
        <EmptyState icon={SearchX} title="Ce logement n'est plus disponible" text="Il a peut-être été retiré ou loué. D'autres logements vous attendent."
          actions={<><ButtonLink to="/logements">Voir les logements</ButtonLink><ButtonLink to="/" variant="outline">Accueil</ButtonLink></>} />
      </div>
    );
  }
  if (state.error) return <div className="px-4 py-12"><ErrorState message={state.error} onRetry={() => setTries((t) => t + 1)} /></div>;

  const l = state.listing;
  // Partage : WhatsApp affiche un aperçu avec la photo, le titre et le prix de l'annonce.
  const share = async () => {
    const url = state.shareUrl || window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: l.title, text: `${l.title} sur AcademiaSafe`, url });
      else { await navigator.clipboard.writeText(url); toast('Lien copié'); }
    } catch { /* partage annulé */ }
  };
  const blocked = !!user && user.role !== 'student'; // bailleur et admin ne réservent pas
  const taken = l.status !== 'available';          // déjà réservé ou loué
  const contact = () => requireAuth('Connectez-vous pour contacter le bailleur', () => setContactOpen(true), 'student');
  const reserve = () => requireAuth('Connectez-vous pour réserver', () => navigate(`/logements/${l._id}/reserver`));

  const actions = (
    <>
      <Button variant="outline" className="flex-1" onClick={contact} disabled={blocked}>Contacter</Button>
      <Button className="flex-1" onClick={reserve} disabled={blocked || taken}>{taken ? 'Déjà réservé' : 'Réserver'}</Button>
    </>
  );

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-8 lg:px-4 lg:py-6 2xl:grid-cols-[minmax(0,1fr)_460px]">
      <div className="min-w-0">
        <Gallery images={l.images} title={l.title}>
          <button aria-label="Retour" onClick={() => navigate(-1)} className="absolute left-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white"><ChevronLeft /></button>
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5"><button onClick={share} aria-label="Partager cette annonce" className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"><Share2 size={19} /></button><LikeButton listingId={l._id} count={l.likesCount} /><FavoriteButton listingId={l._id} /></div>
        </Gallery>

        <div className="space-y-5 p-4 lg:px-0">
          <div>
            {l.isCertified && <CertBadge />}
            <h1 className="mt-2 text-[22px] font-extrabold md:text-3xl">{l.title}</h1>
            <p className="text-sm text-slate-600">
              {l.neighborhood} · {l.reviewsCount ? <><span className="font-semibold text-amber-700">★ {String(l.averageRating).replace('.', ',')}</span> ({l.reviewsCount} avis)</> : 'Pas encore d’avis'} · {l.viewsCount} vue{l.viewsCount > 1 ? 's' : ''}
            </p>
            {l.landlord && <p className="text-sm text-slate-600">Bailleur : {l.landlord.name}{l.landlord.isIdentityVerified && ' · identité vérifiée'}</p>}
          </div>

          <div className="flex items-baseline justify-between lg:hidden">
            <b className="text-[22px] text-brand">{priceLabel(l.pricing)}</b>
            <span className="text-sm text-slate-600">Caution {fcfa(l.pricing.deposit)}</span>
          </div>

          {l.description && <ExpandableText text={l.description} />}
          {l.amenities.length > 0 && <div className="flex flex-wrap gap-1.5">{l.amenities.map((a) => <Chip key={a}>{a}</Chip>)}</div>}

          <div className="grid gap-4 md:grid-cols-2 md:items-start">
            <Commute listing={l} />
            <ReviewsSection listing={l} className="md:col-span-2" />
          </div>
          {blocked && <p className="text-sm text-slate-600 lg:hidden">Les actions de réservation sont réservées aux comptes étudiants.</p>}
        </div>
      </div>

      <ContactDialog open={contactOpen} onClose={() => setContactOpen(false)} start={{ kind: 'listing', listingId: l._id }} title="Écrire au bailleur" hint={`À propos de « ${l.title} ». Le bailleur répond dans votre messagerie.`} />

      <aside className="hidden lg:block">
        <div className="sticky top-32 space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
          <b className="block text-2xl text-brand">{priceLabel(l.pricing)}</b>
          <p className="text-sm text-slate-600">Caution {fcfa(l.pricing.deposit)}</p>
          <div className="flex gap-2.5">{actions}</div>
          {blocked && <p className="text-sm text-slate-600">Les actions de réservation sont réservées aux comptes étudiants.</p>}
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-16 z-20 border-t border-slate-200 bg-white px-4 py-3 md:bottom-0 lg:hidden">
        <div className="mx-auto flex max-w-2xl gap-2.5">{actions}</div>
      </div>
    </div>
  );
}

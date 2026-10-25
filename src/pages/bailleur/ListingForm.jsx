import { lazy, Suspense, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ImagePlus, LocateFixed, SearchX, X } from 'lucide-react';
import { api, assetUrl, qs } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { compressImage } from '../../lib/image';
import { Button, ButtonLink } from '../../components/ui';
import { EmptyState, ErrorState, Loader, PageLoader } from '../../components/feedback';
import GeoSearchInput from '../../components/GeoSearchInput';
import AmenityPicker from '../../components/AmenityPicker';
import CommuteCard from '../../components/CommuteCard';

const RouteMap = lazy(() => import('../../components/RouteMap'));

const PERIODS = [['daily', 'Jour'], ['weekly', 'Semaine'], ['monthly', 'Mois'], ['yearly', 'An']];
const input = 'mt-1 h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base';
const card = 'rounded-2xl border border-slate-200 bg-white p-4 md:p-6';
const EMPTY = { title: '', description: '', period: 'monthly', price: '', deposit: '', neighborhood: '', campusTarget: '', addressLabel: '' };
const MAX_IMAGES = 8;

const Field = ({ label, children }) => <label className="block text-sm font-semibold">{label}{children}</label>;

export default function ListingForm() {
  const { id } = useParams();
  const editing = !!id;
  const navigate = useNavigate();
  const toast = useToast();
  const [f, setF] = useState(EMPTY);
  const [loc, setLoc] = useState(null);       // position du logement { lat, lng }
  const [campus, setCampus] = useState(null); // position du campus
  const [preview, setPreview] = useState(null); // { state, commute, error }
  const [amenities, setAmenities] = useState([]);
  const [existing, setExisting] = useState([]);
  const [removed, setRemoved] = useState([]);
  const [files, setFiles] = useState([]);
  const [load, setLoad] = useState({ loading: editing, error: '', missing: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));

  const fetchListing = () => {
    setLoad({ loading: true, error: '', missing: false });
    api.get('/listings/mine').then((d) => {
      const l = d.data.find((x) => x._id === id);
      if (!l) return setLoad({ loading: false, error: '', missing: true });
      setF({ title: l.title, description: l.description || '', period: l.pricing.period, price: l.pricing.price, deposit: l.pricing.deposit || '',
        neighborhood: l.neighborhood, campusTarget: l.campusTarget, addressLabel: l.addressLabel || '' });
      setLoc(l.location ? { lat: l.location.lat, lng: l.location.lng } : null);
      setCampus(l.campusLocation ? { lat: l.campusLocation.lat, lng: l.campusLocation.lng } : null);
      setAmenities(l.amenities); setExisting(l.images);
      setLoad({ loading: false, error: '', missing: false });
    }).catch((e) => setLoad({ loading: false, error: e.message, missing: false }));
  };
  useEffect(() => { if (editing) fetchListing(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => files.forEach((x) => URL.revokeObjectURL(x.url)), []); // eslint-disable-line react-hooks/exhaustive-deps

  // Distance et trajet : calculés automatiquement dès que le logement et le campus sont choisis.
  useEffect(() => {
    if (!loc || !campus) return setPreview(null);
    setPreview({ state: 'loading' });
    const t = setTimeout(() => {
      api.get('/geo/commute' + qs({ fromLat: loc.lat, fromLng: loc.lng, toLat: campus.lat, toLng: campus.lng }))
        .then((d) => setPreview({ state: 'ok', commute: d.commute }))
        .catch((e) => setPreview({ state: 'error', error: e.message }));
    }, 300);
    return () => clearTimeout(t);
  }, [loc?.lat, loc?.lng, campus?.lat, campus?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  const kept = existing.filter((p) => !removed.includes(p));
  const room = MAX_IMAGES - kept.length - files.length;
  const addFiles = async (e) => {
    const list = [...e.target.files];
    e.target.value = '';
    const picked = list.slice(0, Math.max(0, room));
    if (list.length > picked.length) toast(`${MAX_IMAGES} photos maximum par annonce`, 'error');
    const small = await Promise.all(picked.map(compressImage)); // réduit chaque photo avant l'envoi
    setFiles((l) => [...l, ...small.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
  };
  const locate = () => {
    if (!navigator.geolocation) return toast("La localisation n'est pas disponible sur cet appareil", 'error');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setF((v) => ({ ...v, addressLabel: 'Ma position actuelle' })); },
      () => toast('Position refusée ou introuvable', 'error'));
  };
  const pickAddress = (it) => { setLoc({ lat: it.lat, lng: it.lng }); setF((v) => ({ ...v, addressLabel: it.name, neighborhood: v.neighborhood || it.area })); };
  const pickCampus = (it) => { setCampus({ lat: it.lat, lng: it.lng }); setF((v) => ({ ...v, campusTarget: it.name })); };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!loc) return setError("Choisissez l'adresse du logement dans la liste de suggestions, ou utilisez votre position.");
    if (!campus) return setError('Choisissez le campus dans la liste de suggestions.');
    setBusy(true);
    const body = {
      title: f.title, description: f.description, campusTarget: f.campusTarget, neighborhood: f.neighborhood, addressLabel: f.addressLabel,
      location: loc, campusLocation: campus, amenities, // la distance est calculée par le serveur
      pricing: { price: Number(f.price), period: f.period, deposit: Number(f.deposit) || 0 },
    };
    let listingId = id;
    try {
      listingId = editing ? (await api.patch(`/listings/${id}`, body)).listing._id : (await api.post('/listings', body)).listing._id;
    } catch (err) { setError(err.message); setBusy(false); return; }
    try {
      for (const path of removed) await api.del(`/listings/${listingId}/images?path=${encodeURIComponent(path)}`);
      if (files.length) {
        const fd = new FormData();
        files.forEach((x) => fd.append('images', x.file));
        await api.post(`/listings/${listingId}/images`, fd);
      }
    } catch (err) {
      toast(`Annonce enregistrée, mais les photos ont échoué : ${err.message}`, 'error');
      navigate(`/bailleur/annonces/${listingId}/modifier`, { replace: true });
      setBusy(false); return;
    }
    toast(editing ? 'Annonce mise à jour' : 'Annonce créée');
    navigate('/bailleur/annonces');
  };

  if (load.loading) return <PageLoader label="Chargement de l'annonce…" />;
  if (load.error) return <div className="px-4 py-12"><ErrorState message={load.error} onRetry={fetchListing} /></div>;
  if (load.missing) {
    return <div className="px-4 py-12"><EmptyState icon={SearchX} title="Annonce introuvable" text="Elle a peut-être été supprimée." actions={<ButtonLink to="/bailleur/annonces">Retour à mes annonces</ButtonLink>} /></div>;
  }

  const Thumb = ({ src, onRemove }) => (
    <div className="relative aspect-square overflow-hidden rounded-xl bg-blue-100">
      <img src={src} alt="" className="h-full w-full object-cover" />
      <button type="button" aria-label="Retirer la photo" onClick={onRemove} className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow"><X size={18} /></button>
    </div>
  );

  return (
    <form onSubmit={submit} className="grid gap-6 px-4 py-5 md:px-6 md:py-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] xl:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] xl:px-10">
      <h1 className="text-2xl font-extrabold md:text-3xl lg:col-span-2">{editing ? "Modifier l'annonce" : 'Nouvelle annonce'}</h1>

      <div className="min-w-0 space-y-6">
        <section className={`${card} space-y-4`}>
          <h2 className="text-lg font-bold">L'essentiel</h2>
          <Field label="Titre"><input className={input} required maxLength={120} value={f.title} onChange={set('title')} placeholder="Studio meublé avec gardien" /></Field>
          <Field label="Description"><textarea className={`${input} h-36 py-3`} maxLength={2000} value={f.description} onChange={set('description')} placeholder="État du logement, règles, voisinage…" /></Field>
        </section>

        <section className={`${card} space-y-4`}>
          <h2 className="text-lg font-bold">Tarif</h2>
          <div role="radiogroup" aria-label="Période du loyer" className="grid max-w-md grid-cols-4 gap-2">
            {PERIODS.map(([v, label]) => (
              <button key={v} type="button" role="radio" aria-checked={f.period === v} onClick={() => setF((x) => ({ ...x, period: v }))}
                className={`h-11 rounded-lg border text-sm font-bold ${f.period === v ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white text-slate-700'}`}>{label}</button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Loyer (FCFA)"><input className={input} type="number" inputMode="numeric" min="0" required value={f.price} onChange={set('price')} /></Field>
            <Field label="Caution (FCFA)"><input className={input} type="number" inputMode="numeric" min="0" value={f.deposit} onChange={set('deposit')} /></Field>
          </div>
        </section>

        <section className={`${card} space-y-4`}>
          <h2 className="text-lg font-bold">Emplacement</h2>
          <div className="grid items-end gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
            <GeoSearchInput id="addr" label="Adresse du logement" placeholder="Quartier, rue, repère…" initial={f.addressLabel} ok={!!loc} onSelect={pickAddress} onClear={() => setLoc(null)} />
            <Button type="button" variant="outline" onClick={locate}><LocateFixed size={18} className="mr-2" aria-hidden="true" />Ma position</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <GeoSearchInput id="campus" label="Campus ou université ciblé" placeholder="Université de Yaoundé I" initial={f.campusTarget} ok={!!campus} onSelect={pickCampus} onClear={() => setCampus(null)} />
            <Field label="Quartier"><input className={input} required value={f.neighborhood} onChange={set('neighborhood')} /></Field>
          </div>
        </section>

        <section className={`${card} space-y-3`}>
          <h2 className="text-lg font-bold">Commodités</h2>
          <AmenityPicker value={amenities} onChange={setAmenities} />
        </section>
      </div>

      <div className="min-w-0 space-y-6 lg:sticky lg:top-32 lg:self-start">
        <section className={`${card} space-y-3`}>
          <h2 className="text-lg font-bold">Trajet vers le campus</h2>
          {!loc || !campus ? <p className="text-sm text-slate-600">Choisissez l'adresse et le campus : la distance et le trajet se calculent tout seuls.</p>
            : preview?.state === 'loading' ? <div className="py-4"><Loader label="Calcul de l'itinéraire…" /></div>
            : preview?.state === 'error' ? <p role="alert" className="text-sm font-semibold text-red-700">{preview.error}</p>
            : preview?.state === 'ok' ? (
              <>
                <Suspense fallback={<div className="grid h-64 place-items-center"><Loader label="Chargement de la carte…" /></div>}>
                  <RouteMap from={loc} to={campus} path={preview.commute.path} walkPath={preview.commute.walkPath} fromLabel={f.title || 'Votre logement'} toLabel={f.campusTarget || 'Campus'} commute={preview.commute} />
                </Suspense>
                <CommuteCard commute={preview.commute} />
              </>
            ) : null}
        </section>

        <section className={`${card} space-y-3`}>
          <h2 className="text-lg font-bold">Photos <span className="text-sm font-normal text-slate-600">({kept.length + files.length}/{MAX_IMAGES})</span></h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
            {kept.map((p) => <Thumb key={p} src={assetUrl(p)} onRemove={() => setRemoved((l) => [...l, p])} />)}
            {files.map((x, i) => <Thumb key={x.url} src={x.url} onRemove={() => { URL.revokeObjectURL(x.url); setFiles((l) => l.filter((_, j) => j !== i)); }} />)}
            {room > 0 && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-400 bg-slate-50 text-center text-xs font-bold text-brand">
                <ImagePlus aria-hidden="true" /> Ajouter
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addFiles} className="sr-only" />
              </label>
            )}
          </div>
          <p className="text-xs text-slate-600">JPG, PNG ou WebP, 5 Mo maximum par photo. Les visiteurs pourront toutes les parcourir.</p>
        </section>
      </div>

      <div className="sticky bottom-16 z-20 -mx-4 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-white px-4 py-3 md:bottom-0 md:-mx-6 md:px-6 lg:col-span-2 xl:-mx-10 xl:px-10">
        {error && <p role="alert" className="mr-auto rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
        <ButtonLink to="/bailleur/annonces" variant="outline">Annuler</ButtonLink>
        <Button type="submit" className="sm:px-10" disabled={busy}>{busy ? 'Enregistrement…' : editing ? 'Enregistrer' : "Publier l'annonce"}</Button>
      </div>
    </form>
  );
}

import { Link } from 'react-router-dom';
import { Images } from 'lucide-react';
import { priceLabel } from '../lib/format';
import { assetUrl } from '../lib/api';
import { CertBadge } from './ui';
import LikeButton from './LikeButton';
import FavoriteButton from './FavoriteButton';

export default function ListingCard({ listing: l, photoHeight = 'h-32' }) {
  const walk = l.commute?.walk?.min, moto = l.commute?.moto?.fare;
  const chip = 'rounded-md bg-slate-100 px-2 py-1 text-slate-700';
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <div className={`relative ${photoHeight} overflow-hidden bg-blue-100`}>
        {l.images?.[0] && <img src={assetUrl(l.images[0])} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />}
        {l.isCertified && <span className="absolute left-2.5 top-2.5"><CertBadge /></span>}
        <div className="absolute right-2 top-2 flex items-center gap-1.5"><LikeButton listingId={l._id} count={l.likesCount} /><FavoriteButton listingId={l._id} /></div>
        {l.images?.length > 1 && (
          <span className="absolute bottom-2 left-2.5 flex items-center gap-1 rounded-full bg-ink/70 px-2 py-1 text-xs font-bold text-white"><Images size={13} aria-hidden="true" />{l.images.length}</span>
        )}
      </div>
      <Link to={`/logements/${l._id}`} className="block px-4 py-3.5">
        <h3 className="font-display text-lg font-bold leading-snug">{l.title}</h3>
        <p className="mt-0.5 text-sm text-slate-600">{l.neighborhood}</p>
        <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs font-semibold">
          <span className={chip}>{String(l.distanceToCampusKm).replace('.', ',')} km du campus</span>
          {walk != null && <span className={chip}>À pied {walk} min</span>}
          {moto != null && <span className="rounded-md bg-taxi px-2 py-1 text-ink">Moto {moto} F</span>}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <b className="text-lg text-brand">{priceLabel(l.pricing)}</b>
          <span className="text-sm font-semibold text-amber-700">{l.reviewsCount ? `★ ${String(l.averageRating).replace('.', ',')}` : 'Nouveau'}</span>
        </div>
      </Link>
    </article>
  );
}

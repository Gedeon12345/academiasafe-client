import { Link } from 'react-router-dom';
import { Images } from 'lucide-react';
import { priceLabel } from '../lib/format';
import { assetUrl } from '../lib/api';
import { CertBadge } from './ui';
import LikeButton from './LikeButton';
import FavoriteButton from './FavoriteButton';

export default function ListingCard({ listing: l, photoHeight = 'h-32' }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className={`relative ${photoHeight} bg-blue-100`}>
        {l.images?.[0] && <img src={assetUrl(l.images[0])} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
        {l.isCertified && <span className="absolute left-2.5 top-2.5"><CertBadge /></span>}
        <div className="absolute right-2 top-2 flex items-center gap-1.5"><LikeButton listingId={l._id} count={l.likesCount} /><FavoriteButton listingId={l._id} /></div>
        {l.images?.length > 1 && (
          <span className="absolute bottom-2 left-2.5 flex items-center gap-1 rounded-full bg-ink/70 px-2 py-1 text-xs font-bold text-white"><Images size={13} aria-hidden="true" />{l.images.length}</span>
        )}
      </div>
      <Link to={`/logements/${l._id}`} className="block px-3.5 py-3">
        <h3 className="font-bold">{l.title}</h3>
        <p className="mt-0.5 text-sm text-slate-600">{l.neighborhood} · {String(l.distanceToCampusKm).replace('.', ',')} km du campus</p>
        <div className="mt-2 flex items-center justify-between">
          <b className="text-brand">{priceLabel(l.pricing)}</b>
          <span className="text-sm font-semibold text-amber-700">{l.reviewsCount ? `★ ${String(l.averageRating).replace('.', ',')}` : 'Pas encore d’avis'}</span>
        </div>
      </Link>
    </article>
  );
}

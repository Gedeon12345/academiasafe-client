import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLikes } from '../context/LikesContext';
import { useToast } from '../context/ToastContext';

// Aimer une annonce : ouvert à tout compte connecté, sans réservation. Le compteur vient du serveur.
export default function LikeButton({ listingId, count = 0 }) {
  const { requireAuth } = useAuth();
  const { isLiked, toggle } = useLikes();
  const toast = useToast();
  const [n, setN] = useState(count);
  useEffect(() => setN(count), [count]);
  const liked = isLiked(listingId);

  const onClick = (e) => {
    e.preventDefault(); e.stopPropagation();
    requireAuth("Connectez-vous pour aimer ce logement", async () => {
      try { setN((await toggle(listingId)).likesCount); } catch (err) { toast(err.message, 'error'); }
    }, ['student', 'landlord', 'admin']);
  };

  return (
    <button onClick={onClick} aria-pressed={liked} aria-label={liked ? "Retirer mon j'aime" : "J'aime"}
      className="flex h-11 items-center gap-1.5 rounded-full bg-white px-3.5 text-sm font-bold shadow-sm">
      <Heart size={20} className={liked ? 'fill-red-600 text-red-600' : ''} /> {n}
    </button>
  );
}

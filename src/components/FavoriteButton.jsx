import { Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';

// Favori : enregistre le logement dans la liste personnelle de l'étudiant (pour le retrouver et le comparer).
export default function FavoriteButton({ listingId }) {
  const { user, requireAuth } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const toast = useToast();
  if (user && user.role !== 'student') return null; // les favoris sont un espace étudiant
  const on = isFavorite(listingId);

  const onClick = (e) => {
    e.preventDefault(); e.stopPropagation();
    requireAuth('Connectez-vous pour enregistrer ce logement dans vos favoris', async () => {
      try { toast((await toggle(listingId)) ? 'Ajouté à vos favoris' : 'Retiré de vos favoris'); } catch (err) { toast(err.message, 'error'); }
    }, 'student');
  };
  return (
    <button onClick={onClick} aria-pressed={on} aria-label={on ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
      <Bookmark size={20} className={on ? 'fill-brand text-brand' : ''} />
    </button>
  );
}

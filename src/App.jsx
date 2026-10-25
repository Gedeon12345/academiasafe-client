import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RequireRole from './components/RequireRole';
import Home from './pages/Home';
import ListingDetail from './pages/ListingDetail';
import Login from './pages/Login';
import Listings from './pages/Listings';
import NotFound from './pages/NotFound';
import MyListings from './pages/bailleur/MyListings';
import ListingForm from './pages/bailleur/ListingForm';
import Account from './pages/etudiant/Account';
import Favorites from './pages/etudiant/Favorites';
import Compare from './pages/etudiant/Compare';
import Reserve from './pages/etudiant/Reserve';
import Reservations from './pages/etudiant/Reservations';
import ReservationDetail from './pages/etudiant/ReservationDetail';
import ReviewForm from './pages/etudiant/ReviewForm';
import Verify from './pages/Verify';
import Roommates from './pages/Roommates';
import Faq from './pages/Faq';
import Disputes from './pages/Disputes';
import Certification from './pages/bailleur/Certification';
import AdminDashboard from './pages/admin/Dashboard';
import AdminListings from './pages/admin/AdminListings';
import AdminVerifications from './pages/admin/AdminVerifications';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminUsers from './pages/admin/AdminUsers';
import About from './pages/About';
import ReceivedBookings from './pages/bailleur/ReceivedBookings';
import Messages from './pages/Messages';
import RoommateProfileForm from './pages/etudiant/RoommateProfileForm';
import { EmptyState } from './components/feedback';
import { ButtonLink } from './components/ui';
import { Hammer } from 'lucide-react';

// Pages à construire aux étapes suivantes.
const Soon = ({ title }) => (
  <div className="px-4 py-12">
    <EmptyState icon={Hammer} title={title} text="Cette page arrive très bientôt. Nous la construisons étape par étape."
      actions={<ButtonLink to="/">Retour à l'accueil</ButtonLink>} />
  </div>
);
const guard = (roles, el) => <RequireRole roles={roles}>{el}</RequireRole>;

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Publiques (Guest-First) */}
        <Route path="/" element={<Home />} />
        <Route path="/logements" element={<Listings />} />
        <Route path="/logements/:id" element={<ListingDetail />} />
        <Route path="/colocataires" element={<Roommates />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verifier/:token" element={<Verify />} />

        {/* Étudiant uniquement */}
        <Route path="/compte" element={guard(['student'], <Account />)} />
        <Route path="/favoris" element={guard(['student'], <Favorites />)} />
        <Route path="/favoris/comparer" element={guard(['student'], <Compare />)} />
        <Route path="/reservations" element={guard(['student'], <Reservations />)} />
        <Route path="/reservations/:id" element={guard(['student'], <ReservationDetail />)} />
        <Route path="/profil-colocataire" element={guard(['student'], <RoommateProfileForm />)} />
        <Route path="/messages" element={guard(['student', 'landlord'], <Messages />)} />
        <Route path="/logements/:id/reserver" element={guard(['student'], <Reserve />)} />
        <Route path="/logements/:id/avis" element={guard(['student'], <ReviewForm />)} />

        {/* Bailleur uniquement */}
        <Route path="/bailleur/annonces" element={guard(['landlord'], <MyListings />)} />
        <Route path="/bailleur/certification" element={guard(['landlord'], <Certification />)} />
        <Route path="/litiges" element={guard(['student', 'landlord'], <Disputes />)} />
        <Route path="/bailleur/reservations" element={guard(['landlord'], <ReceivedBookings />)} />
        <Route path="/bailleur/annonces/nouvelle" element={guard(['landlord'], <ListingForm />)} />
        <Route path="/bailleur/annonces/:id/modifier" element={guard(['landlord'], <ListingForm />)} />

        {/* Admin uniquement */}
        <Route path="/admin" element={guard(['admin'], <AdminDashboard />)} />
        <Route path="/admin/annonces" element={guard(['admin'], <AdminListings />)} />
        <Route path="/admin/verifications" element={guard(['admin'], <AdminVerifications />)} />
        <Route path="/admin/litiges" element={guard(['admin'], <AdminDisputes />)} />
        <Route path="/admin/utilisateurs" element={guard(['admin'], <AdminUsers />)} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

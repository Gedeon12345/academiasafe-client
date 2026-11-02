import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RequireRole from './components/RequireRole';
import DashboardShell from './components/DashboardShell';
import LandlordOverview from './pages/bailleur/Overview';
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
import Feedback from './pages/Feedback';
import AdminFeedback from './pages/admin/AdminFeedback';
import { Terms, Privacy } from './pages/Legal';
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

const guard = (roles, el) => <RequireRole roles={roles}>{el}</RequireRole>;
// Les espaces connectés partagent une mise en page avec barre latérale.
const space = (roles) => guard(roles, <DashboardShell />);

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
        <Route path="/avis-site" element={<Feedback />} />
        <Route path="/conditions" element={<Terms />} />
        <Route path="/confidentialite" element={<Privacy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verifier/:token" element={<Verify />} />

        {/* Étudiant : actions plein écran */}
        <Route path="/logements/:id/reserver" element={guard(['student'], <Reserve />)} />
        <Route path="/logements/:id/avis" element={guard(['student'], <ReviewForm />)} />

        {/* Espace étudiant */}
        <Route element={space(['student'])}>
          <Route path="/compte" element={<Account />} />
          <Route path="/favoris" element={<Favorites />} />
          <Route path="/favoris/comparer" element={<Compare />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/reservations/:id" element={<ReservationDetail />} />
          <Route path="/profil-colocataire" element={<RoommateProfileForm />} />
        </Route>

        {/* Partagé étudiant et bailleur */}
        <Route element={space(['student', 'landlord'])}>
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:id" element={<Messages />} />
          <Route path="/litiges" element={<Disputes />} />
        </Route>

        {/* Espace bailleur */}
        <Route element={space(['landlord'])}>
          <Route path="/bailleur" element={<LandlordOverview />} />
          <Route path="/bailleur/annonces" element={<MyListings />} />
          <Route path="/bailleur/annonces/nouvelle" element={<ListingForm />} />
          <Route path="/bailleur/annonces/:id/modifier" element={<ListingForm />} />
          <Route path="/bailleur/reservations" element={<ReceivedBookings />} />
          <Route path="/bailleur/certification" element={<Certification />} />
        </Route>

        {/* Espace admin */}
        <Route element={space(['admin'])}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/annonces" element={<AdminListings />} />
          <Route path="/admin/verifications" element={<AdminVerifications />} />
          <Route path="/admin/avis" element={<AdminFeedback />} />
          <Route path="/admin/litiges" element={<AdminDisputes />} />
          <Route path="/admin/utilisateurs" element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

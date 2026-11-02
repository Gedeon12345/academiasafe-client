import { BadgeCheck, Building2, CalendarCheck, FileSearch, Heart, LayoutDashboard, MessageCircle, MessageSquareText, Plus, Scale, Users } from 'lucide-react';

// Menus de chaque espace : utilisés par la barre latérale (ordinateur), la bande de navigation (téléphone) et le menu général.
export const NAV = {
  student: [
    { title: 'Mon espace', items: [
      { to: '/compte', label: "Vue d'ensemble", icon: LayoutDashboard, end: true },
      { to: '/favoris', label: 'Favoris', icon: Heart },
      { to: '/reservations', label: 'Réservations', icon: CalendarCheck },
      { to: '/messages', label: 'Messagerie', icon: MessageCircle, badge: true },
      { to: '/profil-colocataire', label: 'Profil colocataire', icon: Users },
      { to: '/litiges', label: 'Signalements', icon: Scale },
    ] },
  ],
  landlord: [
    { title: 'Mon activité', items: [
      { to: '/bailleur', label: "Vue d'ensemble", icon: LayoutDashboard, end: true },
      { to: '/bailleur/annonces', label: 'Mes annonces', icon: Building2, activeIf: (p) => p === '/bailleur/annonces' || /^\/bailleur\/annonces\/[^/]+\/modifier/.test(p) },
      { to: '/bailleur/annonces/nouvelle', label: 'Nouvelle annonce', icon: Plus, end: true },
      { to: '/bailleur/reservations', label: 'Réservations reçues', icon: CalendarCheck },
      { to: '/messages', label: 'Messagerie', icon: MessageCircle, badge: true },
    ] },
    { title: 'Mon compte', items: [
      { to: '/bailleur/certification', label: 'Certification', icon: BadgeCheck },
      { to: '/litiges', label: 'Signalements', icon: Scale },
    ] },
  ],
  admin: [
    { title: 'Modération', items: [
      { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
      { to: '/admin/annonces', label: 'Annonces', icon: Building2 },
      { to: '/admin/verifications', label: 'Certifications', icon: FileSearch },
      { to: '/admin/litiges', label: 'Litiges', icon: Scale },
    ] },
    { title: 'Communauté', items: [
      { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
      { to: '/admin/avis', label: 'Avis du site', icon: MessageSquareText, badge: true },
    ] },
  ],
};

export const ROLE_LABEL = { student: 'Étudiant', landlord: 'Bailleur', admin: 'Administrateur' };
export const isActive = (it, p) => (it.activeIf ? it.activeIf(p) : it.end ? p === it.to : p === it.to || p.startsWith(`${it.to}/`));

// Données de démonstration : même forme que le schéma Mongoose Listing. À remplacer par l'API.
export const LISTINGS = [
  { _id: '1', title: 'Studio meublé avec gardien', neighborhood: 'Ngoa-Ekélé', campusTarget: 'Université de Yaoundé I',
    distanceToCampusKm: 0.8, pricing: { price: 45000, period: 'monthly', deposit: 45000 },
    amenities: ['Eau 24h', 'Wi-Fi', 'Compteur prépayé', 'Gardien'], viewsCount: 312, averageRating: 4.6, reviewsCount: 23, isCertified: true },
  { _id: '2', title: 'Chambre en cité, eau 24h', neighborhood: 'Melen', campusTarget: 'Université de Yaoundé I',
    distanceToCampusKm: 1.5, pricing: { price: 12000, period: 'weekly', deposit: 12000 },
    amenities: ['Eau 24h', 'Gardien'], viewsCount: 148, averageRating: 4.1, reviewsCount: 9, isCertified: false },
  { _id: '3', title: 'Résidence Campus Sud', neighborhood: 'Melen', campusTarget: 'Université de Yaoundé I',
    distanceToCampusKm: 1.5, pricing: { price: 38000, period: 'monthly', deposit: 38000 },
    amenities: ['Eau 24h', 'Wi-Fi'], viewsCount: 201, averageRating: 4.3, reviewsCount: 14, isCertified: true },
];

// Hypothèses de transport (FCFA par trajet) : à rendre configurables côté API.
export const TRANSPORT = { motoFare: 300, taxiFare: 250 };

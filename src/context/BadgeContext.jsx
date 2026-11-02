import { createContext, useContext } from 'react';

// Compteur de pastille (messages non lus, ou avis à lire pour l'admin), fourni par la mise en page.
export const BadgeContext = createContext({ unread: 0 });
export const useBadges = () => useContext(BadgeContext);

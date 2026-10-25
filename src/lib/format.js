export const PERIOD = { daily: 'jour', weekly: 'semaine', monthly: 'mois', yearly: 'an' };
export const fcfa = (n) => `${Number(n).toLocaleString('fr-FR')} FCFA`;
export const priceLabel = (p) => `${fcfa(p.price)} / ${PERIOD[p.period]}`;


// Taux d'affinité : anneau + pourcentage écrit (la couleur n'est jamais le seul indice).
export default function AffinityRing({ value }) {
  const r = 22, c = 2 * Math.PI * r;
  const color = value >= 70 ? '#059669' : value >= 40 ? '#D97706' : '#64748B';
  return (
    <div className="flex flex-none flex-col items-center" role="img" aria-label={`Affinité ${value} pour cent`}>
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
        <circle cx="28" cy="28" r={r} fill="none" stroke="currentColor" strokeOpacity=".15" strokeWidth="5" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform="rotate(-90 28 28)" />
        <text x="28" y="32" textAnchor="middle" fontSize="13" fontWeight="800" fill="currentColor">{value}%</text>
      </svg>
      <span className="text-[11px] font-semibold text-slate-600">affinité</span>
    </div>
  );
}

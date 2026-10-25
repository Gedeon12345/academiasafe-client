import { Scale } from 'lucide-react';
import { useApi } from '../lib/useApi';
import { ButtonLink } from '../components/ui';
import { EmptyState, ErrorState, PageLoader } from '../components/feedback';
import { Pill, when } from '../components/admin';

const STATUS = { open: ['Ouvert', 'bg-amber-100 text-amber-900'], in_review: ["En cours d'examen", 'bg-blue-50 text-brand'], resolved: ['Résolu', 'bg-safe-soft text-safe-dark'], rejected: ['Clos', 'bg-slate-200 text-slate-700'] };

export default function Disputes() {
  const [s, reload] = useApi('/disputes/mine');
  if (s.loading) return <PageLoader label="Chargement de vos signalements…" />;
  if (s.error) return <div className="px-4 py-12"><ErrorState message={s.error} onRetry={reload} /></div>;
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5 md:py-8">
      <h1 className="mb-5 text-2xl font-extrabold md:text-3xl">Mes signalements</h1>
      {s.data.data.length === 0 ? (
        <EmptyState icon={Scale} title="Aucun signalement" text="Un problème avec une réservation ? Ouvrez-la et utilisez « Signaler un problème » : notre équipe examine chaque cas."
          actions={<ButtonLink to="/reservations">Mes réservations</ButtonLink>} />
      ) : (
        <ul className="space-y-3">
          {s.data.data.map((d) => (
            <li key={d._id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-2"><Pill cls={STATUS[d.status][1]}>{STATUS[d.status][0]}</Pill><span className="text-sm text-slate-600">{when(d.createdAt)}</span></div>
              <h2 className="mt-1 font-bold">{d.reasonLabel}</h2>
              <p className="text-sm text-slate-600">{d.title} · reçu n° {d.receiptNumber} · {d.openedByMe ? 'signalé par vous' : 'vous concerne'}</p>
              <p className="mt-2 whitespace-pre-line text-sm">{d.description}</p>
              {d.resolution && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm"><b>Décision de l'équipe :</b> {d.resolution}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

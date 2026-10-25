import { useState } from 'react';
import { Users } from 'lucide-react';
import { api } from '../../lib/api';
import { useApi } from '../../lib/useApi';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui';
import { EmptyState, ErrorState, PageLoader } from '../../components/feedback';
import ReasonDialog from '../../components/ReasonDialog';
import { Pager, Pill } from '../../components/admin';

const ROLE = { student: 'Étudiant', landlord: 'Bailleur', admin: 'Admin' };

export default function AdminUsers() {
  const toast = useToast();
  const [role, setRole] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [s, reload] = useApi(`/admin/users?role=${role}&q=${encodeURIComponent(q)}&page=${page}`);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = async (u, suspended, reason) => {
    setBusy(true);
    try { await api.patch(`/admin/users/${u._id}/suspend`, { suspended, reason }); toast(suspended ? 'Compte suspendu' : 'Compte réactivé'); setTarget(null); reload(); }
    catch (e) { toast(e.message, 'error'); } finally { setBusy(false); }
  };

  return (
    <div className="px-4 py-5 md:px-6 md:py-8 xl:px-10">
      <h1 className="mb-4 text-2xl font-extrabold md:text-3xl">Utilisateurs</h1>
      <div className="mb-5 flex flex-wrap gap-3">
        <input type="search" aria-label="Rechercher un utilisateur" placeholder="Nom, e-mail ou numéro…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="h-12 w-full max-w-md rounded-lg border border-slate-300 bg-white px-3" />
        <select aria-label="Filtrer par rôle" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="h-12 rounded-lg border border-slate-300 bg-white px-3"><option value="">Tous les rôles</option><option value="student">Étudiants</option><option value="landlord">Bailleurs</option><option value="admin">Admins</option></select>
      </div>
      {s.loading && <PageLoader label="Chargement…" />}
      {s.error && <ErrorState message={s.error} onRetry={reload} />}
      {s.data && (s.data.data.length === 0 ? <EmptyState icon={Users} title="Aucun utilisateur trouvé" text="Essayez un autre nom ou retirez le filtre." actions={<Button onClick={() => { setQ(''); setRole(''); }}>Réinitialiser</Button>} />
        : (
          <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {s.data.data.map((u) => (
              <li key={u._id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0"><p className="flex flex-wrap items-center gap-2"><b>{u.name}</b><Pill cls="bg-slate-200 text-slate-700">{ROLE[u.role]}</Pill>{u.isIdentityVerified && u.role === 'landlord' && <Pill cls="bg-safe-soft text-safe-dark">Vérifié</Pill>}{u.isSuspended && <Pill cls="bg-red-50 text-red-700">Suspendu</Pill>}</p>
                  <p className="truncate text-sm text-slate-600">{u.email} · {u.phone}</p>{u.isSuspended && <p className="text-sm text-red-700">Motif : {u.suspendedReason}</p>}</div>
                {u.role !== 'admin' && (u.isSuspended ? <Button variant="outline" className="h-11 text-sm" disabled={busy} onClick={() => set(u, false)}>Réactiver</Button> : <Button variant="outline" className="h-11 text-sm" onClick={() => setTarget(u)}>Suspendre</Button>)}
              </li>
            ))}
          </ul>
        ))}
      {s.data && <Pager page={page} pages={s.data.pages} onChange={setPage} />}
      <ReasonDialog open={!!target} danger busy={busy} title={`Suspendre ${target?.name} ?`} text="La personne ne peut plus se connecter. Les annonces d'un bailleur suspendu sont retirées du site." confirmLabel="Suspendre" onConfirm={(r) => set(target, true, r)} onCancel={() => setTarget(null)} />
    </div>
  );
}

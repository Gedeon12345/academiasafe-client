import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, MessageCircle, Send } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ButtonLink } from '../components/ui';
import { EmptyState, ErrorState, PageLoader } from '../components/feedback';

const when = (d) => new Date(d).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

export default function Messages() {
  const { user } = useAuth();
  const [box, setBox] = useState('received');
  const [state, setState] = useState({ loading: true, data: [], error: '' });
  const [tries, setTries] = useState(0);

  useEffect(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    api.get(`/messages?box=${box}`).then(async (d) => {
      setState({ loading: false, data: d.data, error: '' });
      if (box === 'received' && d.data.some((m) => m.unread)) { await api.post('/messages/read-all').catch(() => {}); window.dispatchEvent(new Event('as:messages-read')); }
    }).catch((e) => setState({ loading: false, data: [], error: e.message }));
  }, [box, tries]);

  const tab = (v, label, Icon) => (
    <button role="tab" aria-selected={box === v} onClick={() => setBox(v)}
      className={`flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold ${box === v ? 'bg-brand text-white' : 'bg-white text-slate-700 border border-slate-300'}`}><Icon size={16} aria-hidden="true" />{label}</button>
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5 md:py-8">
      <h1 className="text-2xl font-extrabold md:text-3xl">Mes messages</h1>
      <div role="tablist" className="mb-5 mt-4 flex gap-2">{tab('received', 'Reçus', Inbox)}{user.role === 'student' && tab('sent', 'Envoyés', Send)}</div>

      {box === 'received' && <p className="-mt-2 mb-4 text-sm text-slate-600">« Répondre sur WhatsApp » ouvre la conversation avec un message déjà rédigé : il indique que vous répondez depuis AcademiaSafe, rappelle la référence et joint le lien du logement (WhatsApp en affiche la photo). Inutile de vous présenter à nouveau.</p>}
      {state.loading && <PageLoader label="Chargement des messages…" />}
      {state.error && <ErrorState message={state.error} onRetry={() => setTries((t) => t + 1)} />}
      {!state.loading && !state.error && (state.data.length === 0 ? (
        box === 'received'
          ? <EmptyState icon={Inbox} title="Aucun message reçu" text={user.role === 'landlord' ? 'Quand un étudiant vous écrit à propos d’une annonce, son message apparaît ici et vous êtes prévenu par WhatsApp ou SMS.' : 'Les réponses et demandes de colocation apparaîtront ici.'} />
          : <EmptyState icon={MessageCircle} title="Aucun message envoyé" text="Posez vos questions au bailleur avant de réserver, ou écrivez à un futur colocataire."
              actions={<ButtonLink to="/logements">Voir les logements</ButtonLink>} />
      ) : (
        <ul className="space-y-3">
          {state.data.map((m) => (
            <li key={m._id} className={`rounded-2xl border bg-white p-4 ${m.unread ? 'border-brand' : 'border-slate-200'}`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <b>{box === 'received' ? m.with : `À ${m.with}`}</b>
                {m.unread && <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white">Nouveau</span>}
                <span className="text-sm text-slate-600">{when(m.createdAt)} · réf. {m.ref}</span>
              </div>
              <p className="text-sm text-slate-600">À propos de : {m.listing ? <Link to={`/logements/${m.listing}`} className="font-semibold text-brand">{m.subject}</Link> : m.subject}</p>
              <p className="mt-2 whitespace-pre-line leading-relaxed">{m.body}</p>
              {box === 'received' && m.phone && (
                <a href={m.replyUrl} target="_blank" rel="noreferrer"
                  className="mt-3 inline-flex h-11 items-center rounded-xl border-2 border-brand px-4 text-sm font-bold text-brand">Répondre sur WhatsApp ({m.phone})</a>
              )}
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

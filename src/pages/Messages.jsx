import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { ButtonLink } from '../components/ui';
import { EmptyState, ErrorState, Loader, PageLoader } from '../components/feedback';

const ROLE = { student: 'Étudiant', landlord: 'Bailleur' };
const hhmm = (d) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
function dayLabel(d) {
  const y = new Date(); y.setDate(y.getDate() - 1);
  return sameDay(d, new Date()) ? "Aujourd'hui" : sameDay(d, y) ? 'Hier' : new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

// Appelle `fn` à intervalle régulier, seulement quand l'onglet est visible (messagerie quasi instantanée).
function usePolling(fn, ms, deps) {
  useEffect(() => {
    const t = setInterval(() => document.visibilityState === 'visible' && fn(), ms);
    return () => clearInterval(t);
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

function Inbox({ activeId }) {
  const [s, setS] = useState({ loading: true, data: [], error: '' });
  const load = useCallback(() => api.get('/chat/conversations').then((d) => setS({ loading: false, data: d.data, error: '' })).catch((e) => setS((x) => ({ ...x, loading: false, error: e.message }))), []);
  useEffect(() => { load(); }, [load, activeId]);
  usePolling(load, 15000, [load]);

  if (s.loading) return <PageLoader label="Chargement des discussions…" />;
  if (s.error && !s.data.length) return <ErrorState message={s.error} onRetry={load} />;
  if (!s.data.length) {
    return <EmptyState icon={MessageCircle} title="Aucune discussion" text="Écrivez à un bailleur depuis une annonce, ou à un futur colocataire : vos échanges apparaîtront ici."
      actions={<><ButtonLink to="/logements">Voir les logements</ButtonLink><ButtonLink to="/colocataires" variant="outline">Colocataires</ButtonLink></>} />;
  }
  return (
    <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {s.data.map((c) => (
        <li key={c._id}>
          <Link to={`/messages/${c._id}`} className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 ${c._id === activeId ? 'bg-blue-50' : ''}`}>
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-brand font-extrabold text-white" aria-hidden="true">{c.other.name.slice(0, 1)}</span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2"><b className="truncate">{c.other.name}</b><span className="flex-none text-xs text-slate-600">{c.lastMessageAt && hhmm(c.lastMessageAt)}</span></span>
              <span className="block truncate text-xs text-slate-600">{ROLE[c.other.role]} · {c.subject}</span>
              <span className={`block truncate text-sm ${c.unread ? 'font-bold' : 'text-slate-600'}`}>{c.lastMessageText}</span>
            </span>
            {c.unread > 0 && <span className="flex h-6 min-w-[1.5rem] flex-none items-center justify-center rounded-full bg-brand px-1.5 text-xs font-bold text-white" aria-label={`${c.unread} non lus`}>{c.unread}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Thread({ id }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [st, setSt] = useState({ loading: true, conv: null, msgs: [], error: '' });
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const last = useRef(null);   // date du dernier message reçu : sert à ne demander que les nouveaux
  const stick = useRef(true);  // reste en bas tant que la personne ne remonte pas lire
  const endRef = useRef(null);
  const byDate = (a, b) => new Date(a.createdAt) - new Date(b.createdAt);

  const load = useCallback(async (first) => {
    try {
      const q = !first && last.current ? `?after=${encodeURIComponent(last.current)}` : '';
      const d = await api.get(`/chat/conversations/${id}/messages${q}`);
      if (d.messages.length) last.current = d.messages[d.messages.length - 1].createdAt;
      setSt((s) => {
        const known = new Set(s.msgs.map((m) => m._id));
        const msgs = first ? d.messages : [...s.msgs, ...d.messages.filter((m) => !known.has(m._id))].sort(byDate);
        return { loading: false, conv: d.conversation, msgs, error: '' };
      });
      if (first || d.messages.length) window.dispatchEvent(new Event('as:messages-read'));
    } catch (e) { if (first) setSt({ loading: false, conv: null, msgs: [], error: e.status === 404 ? '404' : e.message }); }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { last.current = null; load(true); }, [load]);
  usePolling(() => load(false), 3000, [load]);
  useEffect(() => { if (stick.current) endRef.current?.scrollIntoView({ block: 'end' }); }, [st.msgs.length]);

  const submit = async (e) => {
    e?.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    const tmp = `tmp-${Date.now()}`;
    setSending(true); setText(''); stick.current = true;
    setSt((s) => ({ ...s, msgs: [...s.msgs, { _id: tmp, mine: true, body, createdAt: new Date().toISOString(), pending: true }] }));
    try {
      const d = await api.post(`/chat/conversations/${id}/messages`, { body });
      last.current = d.message.createdAt;
      setSt((s) => ({ ...s, msgs: [...s.msgs.filter((m) => m._id !== tmp && m._id !== d.message._id), d.message].sort(byDate) }));
    } catch (err) {
      toast(err.message, 'error'); setText(body);
      setSt((s) => ({ ...s, msgs: s.msgs.filter((m) => m._id !== tmp) }));
    } finally { setSending(false); }
  };

  if (st.loading) return <div className="flex h-[calc(100dvh-13rem)] min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white"><Loader label="Ouverture de la discussion…" /></div>;
  if (st.error === '404') return <EmptyState icon={MessageCircle} title="Discussion introuvable" actions={<ButtonLink to="/messages">Retour aux discussions</ButtonLink>} />;
  if (st.error) return <ErrorState message={st.error} onRetry={() => load(true)} />;

  const { conv } = st;
  return (
    <section className="flex h-[calc(100dvh-13rem)] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white" aria-label={`Discussion avec ${conv.other.name}`}>
      <header className="flex items-center gap-3 border-b border-slate-200 px-3 py-3">
        <button onClick={() => navigate('/messages')} aria-label="Retour aux discussions" className="flex h-11 w-11 flex-none items-center justify-center rounded-full hover:bg-slate-100 lg:hidden"><ArrowLeft /></button>
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-brand font-extrabold text-white" aria-hidden="true">{conv.other.name.slice(0, 1)}</span>
        <div className="min-w-0">
          <p className="truncate font-bold">{conv.other.name} <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">{ROLE[conv.other.role]}</span></p>
          <p className="truncate text-sm text-slate-600">{conv.kind === 'listing' && conv.listing ? <Link to={`/logements/${conv.listing}`} className="font-semibold text-brand">{conv.subject}</Link> : conv.subject}</p>
        </div>
      </header>

      <div className="flex-1 space-y-1 overflow-y-auto px-3 py-4 md:px-5" onScroll={(e) => { const el = e.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; }}>
        {st.msgs.length === 0 && <p className="py-10 text-center text-sm text-slate-600">Aucun message pour l'instant. Écrivez le premier.</p>}
        {st.msgs.map((m, i) => (
          <div key={m._id}>
            {(i === 0 || !sameDay(st.msgs[i - 1].createdAt, m.createdAt)) && <p className="my-3 text-center text-xs font-semibold text-slate-600">{dayLabel(m.createdAt)}</p>}
            <div className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 md:max-w-[70%] ${m.mine ? 'rounded-br-md bg-brand text-white' : 'rounded-bl-md bg-slate-200 text-ink'} ${m.pending ? 'opacity-60' : ''}`}>
                {m.body}
                <span className={`mt-0.5 block text-right text-[11px] ${m.mine ? 'text-blue-100' : 'text-slate-600'}`}>{hhmm(m.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="flex items-end gap-2 border-t border-slate-200 p-3">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={1} maxLength={1000} aria-label="Votre message" placeholder="Écrivez votre message…"
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
          className="max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base" />
        <button type="submit" disabled={!text.trim() || sending} aria-label="Envoyer" className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-brand text-white disabled:opacity-40"><Send size={20} /></button>
      </form>
    </section>
  );
}

export default function Messages() {
  const { id } = useParams();
  return (
    <div className="px-4 py-4 md:px-6 md:py-6 xl:px-10">
      <h1 className={`mb-4 text-2xl font-extrabold md:text-3xl ${id ? 'hidden lg:block' : ''}`}>Messagerie</h1>
      <div className="grid gap-4 lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)]">
        <div className={id ? 'hidden lg:block' : ''}><Inbox activeId={id} /></div>
        <div className={id ? '' : 'hidden lg:block'}>
          {id ? <Thread key={id} id={id} /> : <EmptyState icon={MessageCircle} title="Choisissez une discussion" text="Sélectionnez une conversation à gauche pour lire et répondre." />}
        </div>
      </div>
    </div>
  );
}

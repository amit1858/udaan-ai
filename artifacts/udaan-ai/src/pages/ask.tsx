import { MarketInspiration, marketQuestions } from '@/components/market-inspiration';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearch } from 'wouter';
import { ArrowUp, Mic, Sparkles, ArrowUpRight, CornerDownRight } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetConversation, getGetConversationQueryKey, useSendChat, type Message, type Opportunity,
} from '@workspace/api-client-react';
import { useOpportunities } from '@/hooks/use-opportunities';
import { useI18n, speechLang, type TKey } from '@/lib/i18n';
import { ListenButton } from '@/components/listen-button';
import { FinanceBreakdown } from '@/components/finance-breakdown';
import { OppImage } from '@/components/opp-image';
import { ErrorState } from '@/components/states';
import { UdaanMark } from '@/components/udaan-mark';
import { Skeleton } from '@/components/ui/skeleton';
import { inr, errMsg } from '@/lib/format';
import { cn } from '@/lib/utils';

type Rec = { start: () => void; stop: () => void; lang: string; interimResults: boolean; continuous: boolean; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };
const getRec = (): (new () => Rec) | null => {
  const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

export default function AskPage() {
  const { t, lang, setPrefs } = useI18n();
  const qc = useQueryClient();
  const search = useSearch();
  const conv = useGetConversation({ query: { queryKey: getGetConversationQueryKey() } });
  const opps = useOpportunities();
  const send = useSendChat();
  const [text, setText] = useState(() => new URLSearchParams(search).get('q') ?? '');
  const [pendingMsg, setPendingMsg] = useState<string | null>(null);
  const [failed, setFailed] = useState<{ msg: string; err: string } | null>(null);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState(false);
  const recRef = useRef<Rec | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const sendRef = useRef(send.mutate);
  sendRef.current = send.mutate;

  const messages = conv.data ?? [];
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages.length, pendingMsg]);

  const submit = (msg: string) => {
    const m = msg.trim();
    if (!m || send.isPending) return;
    setFailed(null); setPendingMsg(m); setText(''); setHeard(false);
    sendRef.current({ data: { message: m } }, {
      onSuccess: async () => { await qc.invalidateQueries({ queryKey: getGetConversationQueryKey() }); setPendingMsg(null); },
      onError: (e) => { setPendingMsg(null); setFailed({ msg: m, err: errMsg(e, t('ask.error')) }); setText(m); },
    });
  };
  const onSubmit = (e: FormEvent) => { e.preventDefault(); submit(text); };

  const Rec = typeof window !== 'undefined' ? getRec() : null;
  const startMic = () => {
    if (!Rec || listening) return;
    const r = new Rec();
    r.lang = speechLang(lang); r.interimResults = true; r.continuous = false;
    r.onresult = (e) => { let s = ''; for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript; setText(s); setHeard(true); };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recRef.current = r; setListening(true); r.start();
  };
  const stopMic = () => recRef.current?.stop();

  const oppMap = new Map((opps.data ?? []).map((o) => [o.id, o]));
  const suggestions: TKey[] = ['ask.s1', 'ask.s2', 'ask.s3', 'ask.s4', 'ask.s5'];

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-5.5rem)] max-w-3xl flex-col">
      <div className="flex-1 space-y-5 pb-6">
        <header className="rise flex items-start gap-3">
          <UdaanMark className="size-11 shrink-0" />
          <div><h1 className="font-display text-2xl font-bold">{t('ask.title')}</h1><p className="text-sm text-mist">{t('ask.intro')}</p></div>
        </header>
        <button data-testid="button-market-question" onClick={() => submit(marketQuestions[lang])} disabled={send.isPending} className="min-h-12 w-full rounded-2xl border border-intel/40 bg-intel/10 p-4 text-left text-sm leading-relaxed text-intel disabled:opacity-50">{marketQuestions[lang]}</button>

        {conv.isLoading && <div className="space-y-3"><Skeleton className="ml-auto h-12 w-2/3 rounded-3xl bg-raised" /><Skeleton className="h-40 w-full rounded-3xl bg-raised" /></div>}
        {conv.isError && <ErrorState onRetry={() => conv.refetch()} />}

        {messages.length === 0 && !conv.isLoading && !pendingMsg && (
          <div className="space-y-2 pt-2">
            <div className="text-[11px] uppercase tracking-[0.18em] text-intel">{t('ask.suggested')}</div>
            {suggestions.map((k) => (
              <button key={k} data-testid={'button-suggest-' + k} onClick={() => submit(t(k))}
                className="flex min-h-12 w-full items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-left text-[15px] text-snow transition hover:border-intel/50 active:scale-[.99]">
                <Sparkles className="size-4 shrink-0 text-intel" />{t(k)}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-5" aria-live="polite">
          {messages.map((m) => <Bubble key={m.id} m={m} opp={m.opportunityId ? oppMap.get(m.opportunityId) : undefined} onFollow={() => document.querySelector<HTMLTextAreaElement>('[data-testid="input-chat"]')?.focus()} busy={send.isPending} />)}
          {pendingMsg && (<>
            <UserBubble text={pendingMsg} />
            <div className="flex items-center gap-3 text-sm text-mist" data-testid="status-thinking"><span className="typing flex gap-1"><span /><span /><span /></span>{t('ask.thinking')}</div>
          </>)}
          {failed && (
            <div role="alert" className="rounded-3xl border border-[#ff7a6b]/30 bg-[#ff7a6b]/5 p-4 text-sm">
              <p className="text-snow">{failed.err}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button data-testid="button-chat-retry" onClick={() => submit(failed.msg)} className="min-h-11 rounded-full border border-line px-4">{t('common.retry')}</button>
                <button data-testid="button-chat-demo" onClick={() => setPrefs({ provider: 'demo' })} className="min-h-11 rounded-full border border-line px-4 text-intel">{t('ask.switchDemo')}</button>
              </div>
            </div>
          )}
        </div>
        <div ref={endRef} />
      </div>

      <form onSubmit={onSubmit} className="pb-safe sticky bottom-0 z-30 -mx-4 bg-gradient-to-t from-ink via-ink/95 to-transparent px-4 pb-3 pt-6">
        {messages.length > 0 && !pendingMsg && (
          <div className="scrollbar-none -mx-4 mb-2 flex gap-2 overflow-x-auto px-4">
            {suggestions.slice(1).map((k) => (
              <button type="button" key={k} onClick={() => setText(t(k))} data-testid={'chip-suggest-' + k}
                className="min-h-9 shrink-0 rounded-full border border-line bg-surface px-3 text-xs text-mist hover:text-snow">{t(k)}</button>
            ))}
          </div>
        )}
        {(listening || heard) && <p className="mb-1.5 px-2 text-xs text-intel" data-testid="status-mic">{listening ? t('ask.listening') : t('ask.transcriptNote')}</p>}
        <div className={cn('flex items-end gap-2 rounded-[26px] border bg-surface p-1.5 transition', listening ? 'border-intel/70' : 'border-line focus-within:border-intel/50')}>
          <button type="button" data-testid="button-mic" aria-label={Rec ? t('ask.mic') : t('ask.micUnsupported')} title={Rec ? t('ask.mic') : t('ask.micUnsupported')} disabled={!Rec}
            onPointerDown={startMic} onPointerUp={stopMic} onPointerLeave={stopMic}
            className={cn('relative grid size-11 shrink-0 place-items-center rounded-full transition disabled:opacity-40', listening ? 'bg-intel text-ink' : 'text-mist hover:text-snow')}>
            {listening && <span className="absolute inset-0 animate-ping rounded-full bg-intel/30" />}<Mic className="relative size-5" />
          </button>
          <textarea data-testid="input-chat" value={text} onChange={(e) => setText(e.target.value)} rows={1} maxLength={2000}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(text); } }}
            placeholder={t('ask.placeholder')} aria-label={t('ask.placeholder')}
            className="max-h-32 min-h-11 flex-1 resize-none bg-transparent py-2.5 text-[16px] text-snow placeholder:text-mist focus:outline-none" />
          <button type="submit" data-testid="button-send" aria-label={t('ask.send')} disabled={!text.trim() || send.isPending}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-signal text-ink transition active:scale-95 disabled:bg-line disabled:text-mist">
            <ArrowUp className="size-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return <div className="flex justify-end"><div className="max-w-[85%] rounded-[22px] rounded-br-md bg-intel/15 px-4 py-3 text-[15px] text-snow ring-1 ring-intel/25">{text}</div></div>;
}

function Bubble({ m, opp, onFollow, busy }: { m: Message; opp?: Opportunity; onFollow: (s: string) => void; busy: boolean }) {
  const { t } = useI18n();
  if (m.role === 'user') return <UserBubble text={m.content} />;
  const live = m.provider !== 'demo';
  return (
    <article data-testid={'message-assistant-' + m.id} className="rise space-y-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em]">
        <span className="font-semibold text-intel">Udaan</span>
        <span className={cn('rounded-full border px-2 py-0.5', live ? 'border-signal/40 text-signal' : 'border-line text-mist')} data-testid={'status-message-provider-' + m.id}>
          {live ? t('provider.live') + (m.model ? ' · ' + m.model : '') : t('provider.demo')}
        </span>
      </div>
      {m.market && <MarketInspiration market={m.market} provider={m.provider} opportunity={opp} interpretation={m.content} />}
      {!m.market && <div className="rounded-[24px] rounded-tl-md border border-line card-sheen p-4">
        <p className="whitespace-pre-line text-[15px] leading-relaxed text-snow">{m.content}</p>
        <div className="mt-3"><ListenButton id={'msg-' + m.id} text={m.speechText || m.content} /></div>
      </div>}
      {m.market && <ListenButton id={'msg-' + m.id} text={m.speechText || m.content} />}
      {opp && (
        <Link href={'/opportunity/' + opp.id} data-testid={'card-chat-opportunity-' + opp.id} className="group flex overflow-hidden rounded-[24px] border border-signal/30 bg-surface transition hover:border-signal/60">
          <OppImage src={opp.image} alt={opp.imageAlt} className="w-28 shrink-0 sm:w-40" />
          <div className="min-w-0 flex-1 p-4">
            <div className="text-[11px] uppercase tracking-[0.14em] text-signal">{t('ask.recommendation')}</div>
            <div className="mt-0.5 font-display text-lg font-semibold leading-snug">{opp.title}</div>
            <div className="mt-1 flex items-center gap-3 text-xs text-mist"><span>{t('common.budget')} <span className="font-mono text-snow">{inr(opp.budget)}</span></span><span>{t('common.days', { n: opp.durationDays })}</span></div>
            <div className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-signal">{t('common.explore')}<ArrowUpRight className="size-4" /></div>
          </div>
        </Link>
      )}
      {m.financials && <div className="rounded-[24px] border border-line bg-surface p-4"><div className="mb-3 text-[11px] uppercase tracking-[0.14em] text-intel">{t('fin.title')}</div><FinanceBreakdown f={m.financials} compact /></div>}
      {m.followUp && (
        <button disabled={busy} onClick={() => onFollow(m.followUp!)} data-testid={'button-followup-' + m.id}
          className="flex min-h-12 w-full items-start gap-2 rounded-2xl border border-intel/30 bg-intel/[.05] px-4 py-3 text-left text-sm text-snow transition hover:border-intel/60 disabled:opacity-50">
          <CornerDownRight className="mt-0.5 size-4 shrink-0 text-intel" /><span><span className="block text-[11px] uppercase tracking-[0.14em] text-intel">{t('ask.followUp')}</span>{m.followUp}</span>
        </button>
      )}
    </article>
  );
}

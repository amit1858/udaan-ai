import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, AudioLines, Check, KeyRound, Lock, LogOut, Mic, Play, PlugZap, RefreshCw, Repeat, ShieldAlert, Square, Wand2, Workflow, X,
} from 'lucide-react';
import {
  useGetVoiceLabStatus, getGetVoiceLabStatusQueryKey, loginVoiceLab, useLogoutVoiceLab, useAuthorizeVoiceLab,
  useTestVoiceLabConnection, useTranscribeVoice, useSynthesizeVoice, useSendChat, getGetConversationQueryKey,
  useGetUdaanState, getGetUdaanStateQueryKey, useGetProviders, getGetProvidersQueryKey,
  type VoiceLabStatus, type VoiceOperation, type Language,
} from '@workspace/api-client-react';
import { encodeRecording, audioUrl } from '@/lib/voice-audio';
import { useI18n, LANGS } from '@/lib/i18n';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ErrorState } from '@/components/states';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { errMsg } from '@/lib/format';
import { cn } from '@/lib/utils';

const TEST_PHRASE = 'Mere restaurant mein weekdays par customers kam aa rahe hain. Main kya kar sakta hoon?';
const SPEAKERS: Record<Language, string> = { en: 'simran_en_customer', hinglish: 'ishita_enhi_companion', hi: 'aayan_hi_conversational', kn: 'chaitra_kn_conversation' };
const SAMPLES: Record<Language, string> = {
  en: 'Weekday lunch is slow. Try a fixed-price thali combo from 12 to 3 and track orders for seven days.',
  hinglish: 'नमस्ते! अगर weekdays पर customers कम आ रहे हैं, तो एक छोटा lunch combo offer try कीजिए और सात दिन तक orders track कीजिए।',
  hi: 'नमस्ते! सप्ताह के दिनों में ग्राहक कम आ रहे हैं, तो दोपहर के लिए एक छोटा कॉम्बो ऑफ़र आज़माइए।',
  kn: 'ನಮಸ್ಕಾರ! ವಾರದ ದಿನಗಳಲ್ಲಿ ಗ್ರಾಹಕರು ಕಡಿಮೆ ಇದ್ದರೆ, ಮಧ್ಯಾಹ್ನದ ಸಣ್ಣ ಕಾಂಬೊ ಆಫರ್ ಪ್ರಯತ್ನಿಸಿ.',
};
const MAX_SEC = 10;

function httpStatus(e: unknown): number | undefined {
  const s = (e as { status?: unknown })?.status;
  return typeof s === 'number' ? s : undefined;
}
function friendlyError(e: unknown): string {
  const s = httpStatus(e);
  if (s === 402) return 'Sarvam reports insufficient credits (402). Top up the Sarvam account before trying again.';
  if (s === 429) return 'Rate limited or allowance exhausted (429). Nothing was retried automatically.';
  if (s === 401 || s === 403) return 'Admin session expired or the request was rejected. Unlock the lab again.';
  if (s === undefined) return 'Network error. The server could not be reached; nothing was retried.';
  return errMsg(e, 'Request failed (HTTP ' + s + ').');
}
const inr2 = (n: number) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ---------- recorder ---------- */
type RecState = 'idle' | 'requesting' | 'recording' | 'processing' | 'ready' | 'error';
function useRecorder() {
  const [state, setState] = useState<RecState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [secs, setSecs] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const urlRef = useRef<string | null>(null);

  const stopTracks = () => {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };
  const setObjUrl = (u: string | null) => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); urlRef.current = u; setUrl(u); };

  const reset = useCallback(() => {
    if (recRef.current && recRef.current.state !== 'inactive') { recRef.current.onstop = null; recRef.current.stop(); }
    recRef.current = null; stopTracks(); setObjUrl(null); setBlob(null); setSecs(0); setError(null); setState('idle');
  }, []);

  const stop = useCallback(() => {
    if (recRef.current && recRef.current.state !== 'inactive') recRef.current.stop();
    stopTracks();
  }, []);

  const start = useCallback(async () => {
    reset();
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { setError('This browser cannot record audio. Try a recent Chrome, Edge or Safari.'); setState('error'); return; }
    setState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const chunks: Blob[] = [];
      const rec = new MediaRecorder(stream);
      recRef.current = rec;
      rec.ondataavailable = (ev) => { if (ev.data.size) chunks.push(ev.data); };
      rec.onerror = () => { stopTracks(); setError('Recording failed.'); setState('error'); };
      rec.onstop = async () => {
        stopTracks();
        const raw = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
        if (!raw.size) { setError('No audio was captured. Check the microphone and try again.'); setState('error'); return; }
        setState('processing');
        try {
          const wav = await encodeRecording(raw);
          setBlob(wav); setObjUrl(URL.createObjectURL(wav)); setState('ready');
        } catch (e) { setError(errMsg(e, 'Could not process the recording.')); setState('error'); }
      };
      rec.start();
      setState('recording');
      const t0 = Date.now();
      timerRef.current = window.setInterval(() => {
        const s = (Date.now() - t0) / 1000;
        setSecs(Math.min(MAX_SEC, s));
        if (s >= MAX_SEC) stop();
      }, 200);
    } catch (e) {
      stopTracks();
      const name = (e as { name?: string })?.name;
      setError(name === 'NotAllowedError' ? 'Microphone permission was denied. Allow it in the browser address bar, then try again.' : name === 'NotFoundError' ? 'No microphone was found on this device.' : errMsg(e, 'Could not start the microphone.'));
      setState('error');
    }
  }, [reset, stop]);

  useEffect(() => () => {
    if (recRef.current && recRef.current.state !== 'inactive') { recRef.current.onstop = null; recRef.current.stop(); }
    if (timerRef.current) window.clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  return { state, error, blob, url, secs, start, stop, reset };
}

/* ---------- player ---------- */
function usePlayer() {
  const [url, setUrlState] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const urlRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const release = () => {
    audioRef.current?.pause(); audioRef.current = null;
    if (urlRef.current?.startsWith('blob:')) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
  };
  const play = useCallback((fromStart = false) => {
    const a = audioRef.current; if (!a) return;
    if (fromStart) a.currentTime = 0;
    a.play().then(() => { setPlaying(true); setBlocked(false); }).catch(() => { setPlaying(false); setBlocked(true); });
  }, []);
  const load = useCallback((op: VoiceOperation) => {
    release();
    if (!op.audioBase64) { setUrlState(null); return; }
    const u = audioUrl(op.audioBase64, op.audioMime);
    urlRef.current = u; setUrlState(u);
    const a = new Audio(u);
    a.onended = () => setPlaying(false);
    audioRef.current = a;
    play(true);
  }, [play]);
  const stop = useCallback(() => { const a = audioRef.current; if (a) { a.pause(); a.currentTime = 0; } setPlaying(false); }, []);
  const clear = useCallback(() => { release(); setUrlState(null); setPlaying(false); setBlocked(false); }, []);
  useEffect(() => () => release(), []);
  return { url, playing, blocked, load, play, stop, clear };
}

/* ---------- small UI ---------- */
const STATE_META: Record<VoiceLabStatus['state'], { label: string; cls: string }> = {
  not_configured: { label: 'Not configured', cls: 'border-line text-mist' },
  ready_to_test: { label: 'Ready to test', cls: 'border-intel/50 text-intel' },
  connected: { label: 'Connected', cls: 'border-signal/60 text-signal bg-signal/[.06]' },
  error: { label: 'Error', cls: 'border-[#ff7a6b]/50 text-[#ff7a6b]' },
};

function Panel({ step, title, icon, children, tone, testid }: { step?: string; title: string; icon: ReactNode; children: ReactNode; tone?: 'muted'; testid?: string }) {
  return (
    <section data-testid={testid} className={cn('rise card-sheen rounded-3xl border border-line p-5 transition', tone === 'muted' && 'opacity-80')}>
      <div className="mb-3 flex items-center gap-3">
        {step && <span className="font-mono text-[11px] text-mist">{step}</span>}
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold">{icon}{title}</h2>
      </div>
      {children}
    </section>
  );
}
function Btn({ children, onClick, disabled, kind = 'ghost', testid, type = 'button' }: { children: ReactNode; onClick?: () => void; disabled?: boolean; kind?: 'primary' | 'ghost' | 'danger'; testid: string; type?: 'button' | 'submit' }) {
  return (
    <button type={type} data-testid={testid} disabled={disabled} onClick={onClick}
      className={cn('inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-40',
        kind === 'primary' && 'bg-signal text-ink hover:bg-signal/90',
        kind === 'ghost' && 'border border-line text-snow hover:border-intel/50',
        kind === 'danger' && 'border border-[#ff7a6b]/40 text-[#ff7a6b]')}>
      {children}
    </button>
  );
}
function Note({ tone, children, testid }: { tone: 'warn' | 'error' | 'ok' | 'info'; children: ReactNode; testid?: string }) {
  return (
    <p data-testid={testid} role={tone === 'error' ? 'alert' : undefined} className={cn('mt-3 rounded-2xl border px-3 py-2 text-sm',
      tone === 'warn' && 'border-[#ffb86b]/30 bg-[#ffb86b]/[.05] text-[#ffb86b]',
      tone === 'error' && 'border-[#ff7a6b]/30 bg-[#ff7a6b]/[.05] text-[#ff7a6b]',
      tone === 'ok' && 'border-signal/30 bg-signal/[.05] text-signal',
      tone === 'info' && 'border-intel/25 bg-intel/[.04] text-intel')}>{children}</p>
  );
}
function OpCard({ op, testid }: { op: VoiceOperation; testid: string }) {
  const ok = !op.error && !/fail|error/i.test(op.status);
  return (
    <dl data-testid={testid} className={cn('mt-3 grid grid-cols-2 gap-x-4 gap-y-2 rounded-2xl border p-3 text-xs sm:grid-cols-4', ok ? 'border-signal/25' : 'border-[#ff7a6b]/30')}>
      <div><dt className="text-[10px] uppercase tracking-wider text-mist">Operation</dt><dd className="font-mono">{op.operation}</dd></div>
      <div><dt className="text-[10px] uppercase tracking-wider text-mist">Model</dt><dd className="font-mono">{op.model}</dd></div>
      <div><dt className="text-[10px] uppercase tracking-wider text-mist">Status</dt><dd className={cn('font-mono', ok ? 'text-signal' : 'text-[#ff7a6b]')}>{op.status}{op.httpStatus ? ' · ' + op.httpStatus : ''}</dd></div>
      <div><dt className="text-[10px] uppercase tracking-wider text-mist">Latency</dt><dd className="font-mono">{op.latencyMs} ms</dd></div>
      {op.speaker && <div><dt className="text-[10px] uppercase tracking-wider text-mist">Speaker</dt><dd className="font-mono">{op.speaker}</dd></div>}
      <div><dt className="text-[10px] uppercase tracking-wider text-mist">Est. cost</dt><dd className="font-mono">{inr2(op.estimatedCostInr)}</dd></div>
      {op.inputCharacters != null && <div><dt className="text-[10px] uppercase tracking-wider text-mist">Chars</dt><dd className="font-mono">{op.inputCharacters}</dd></div>}
      {op.inputSeconds != null && <div><dt className="text-[10px] uppercase tracking-wider text-mist">Seconds</dt><dd className="font-mono">{op.inputSeconds.toFixed(1)}</dd></div>}
      {op.requestId && <div className="col-span-2"><dt className="text-[10px] uppercase tracking-wider text-mist">Request ID</dt><dd className="break-all font-mono">{op.requestId}</dd></div>}
      {op.error && <div className="col-span-full"><dt className="text-[10px] uppercase tracking-wider text-mist">Error</dt><dd className="text-[#ff7a6b]">{op.error}</dd></div>}
    </dl>
  );
}
function Recorder({ rec, prefix }: { rec: ReturnType<typeof useRecorder>; prefix: string }) {
  const busy = rec.state === 'requesting' || rec.state === 'processing';
  return (
    <div className="rounded-2xl border border-line bg-raised/50 p-4">
      <div className="flex flex-wrap items-center gap-3">
        {rec.state === 'recording'
          ? <Btn kind="danger" testid={prefix + '-stop-recording'} onClick={rec.stop}><Square className="size-4" />Stop recording</Btn>
          : <Btn kind="ghost" testid={prefix + '-start-recording'} disabled={busy} onClick={rec.start}><Mic className="size-4 text-intel" />{rec.state === 'ready' ? 'Record again' : 'Record (free, local)'}</Btn>}
        <span data-testid={prefix + '-rec-state'} className="flex items-center gap-2 font-mono text-xs text-mist">
          {rec.state === 'recording' && <span className="eq text-[#ff7a6b]"><span /><span /><span /></span>}
          {rec.state === 'requesting' && 'Waiting for microphone permission'}
          {rec.state === 'recording' && rec.secs.toFixed(1) + ' / ' + MAX_SEC + 's'}
          {rec.state === 'processing' && 'Converting to 16 kHz mono WAV'}
          {rec.state === 'ready' && 'Ready · ' + rec.secs.toFixed(1) + 's captured'}
          {rec.state === 'idle' && 'Up to ' + MAX_SEC + ' seconds'}
        </span>
      </div>
      {rec.state === 'recording' && <div className="mt-3 h-1 overflow-hidden rounded-full bg-line"><div className="h-full origin-left bg-[#ff7a6b] transition-transform duration-200" style={{ transform: `scaleX(${rec.secs / MAX_SEC})` }} /></div>}
      {rec.url && <audio data-testid={prefix + '-local-audio'} controls src={rec.url} className="mt-3 w-full" />}
      {rec.error && <Note tone="error" testid={prefix + '-rec-error'}>{rec.error}</Note>}
    </div>
  );
}
function PlayerControls({ p, prefix }: { p: ReturnType<typeof usePlayer>; prefix: string }) {
  if (!p.url) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {p.playing
        ? <Btn testid={prefix + '-stop-audio'} onClick={p.stop}><Square className="size-4" />Stop</Btn>
        : <Btn kind="primary" testid={prefix + '-play-audio'} onClick={() => p.play()}><Play className="size-4" />Play</Btn>}
      <Btn testid={prefix + '-replay-audio'} onClick={() => p.play(true)}><Repeat className="size-4" />Replay</Btn>
      {p.playing && <span className="eq text-signal"><span /><span /><span /></span>}
      {p.blocked && <span className="text-xs text-[#ffb86b]">Autoplay was blocked. Press Play.</span>}
    </div>
  );
}

/* ---------- page ---------- */
type Pending = { title: string; body: ReactNode; run: () => void } | null;

export default function VoiceLabPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { lang } = useI18n();
  const status = useGetVoiceLabStatus({ query: { queryKey: getGetVoiceLabStatusQueryKey() } });
  const s = status.data;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <Link href="/settings" data-testid="link-back-settings" className="inline-flex min-h-11 items-center gap-2 text-sm text-mist hover:text-snow"><ArrowLeft className="size-4" />Settings · Integrations</Link>
      <header className="rise">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-intel">Internal · development only</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-4xl font-bold">Sarvam Voice Lab</h1>
          {s && s.access === 'admin' && <span data-testid="status-voice-lab" className={cn('rounded-full border px-3 py-1 text-[11px] uppercase tracking-wider', STATE_META[s.state].cls)}>{STATE_META[s.state].label}</span>}
        </div>
        <p className="mt-2 max-w-xl text-sm text-mist">Test Sarvam speech-to-text and text-to-speech against Udaan's real reasoning. Every paid call is counted, confirmed and shown with its actual result.</p>
      </header>

      {status.isLoading && <div className="space-y-3"><Skeleton className="h-32 rounded-3xl bg-raised" /><Skeleton className="h-48 rounded-3xl bg-raised" /></div>}
      {status.isError && <ErrorState message="Could not load Voice Lab status." onRetry={() => status.refetch()} />}
      {s && s.access === 'disabled' && <DisabledView />}
      {s && s.access === 'locked' && <LockedView setupRequired={s.setupRequired} onUnlocked={(n) => qc.setQueryData(getGetVoiceLabStatusQueryKey(), n)} />}
      {s && s.access === 'admin' && <AdminLab key="admin" s={s} lang={lang} refresh={() => status.refetch()} refreshing={status.isFetching}
        onStatus={(n) => qc.setQueryData(getGetVoiceLabStatusQueryKey(), n)} toast={toast} />}
    </div>
  );
}

function DisabledView() {
  return (
    <Panel title="Voice Lab is disabled here" icon={<Lock className="size-5 text-mist" />} testid="panel-disabled">
      <p className="text-sm text-mist">This lab only runs in the development environment. The published app keeps Demo Mode and normal text chat fully available; no speech providers are reachable from this page.</p>
    </Panel>
  );
}

function LockedView({ setupRequired, onUnlocked }: { setupRequired: boolean; onUnlocked: (s: VoiceLabStatus) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (setupRequired) {
    return (
      <Panel title="Admin password not set" icon={<KeyRound className="size-5 text-[#ffb86b]" />} testid="panel-setup">
        <ol className="space-y-2 text-sm text-mist">
          <li><span className="font-mono text-intel">1.</span> Open Tools, then Secrets, in this Replit project.</li>
          <li><span className="font-mono text-intel">2.</span> Add <code className="font-mono text-snow">VOICE_LAB_ADMIN_PASSWORD</code> with at least 12 characters.</li>
          <li><span className="font-mono text-intel">3.</span> Restart the API server, then reload this page.</li>
        </ol>
      </Panel>
    );
  }
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const el = ref.current; if (!el) return;
    const password = el.value; el.value = '';
    if (password.length < 12) { setError('The admin password has at least 12 characters.'); return; }
    setBusy(true); setError(null);
    try { onUnlocked(await loginVoiceLab({ password })); }
    catch (err) { const st = httpStatus(err); setError(st === 401 || st === 403 ? 'That password was not accepted.' : st === 429 ? 'Too many attempts. Wait a minute and try again.' : friendlyError(err)); }
    finally { setBusy(false); }
  };
  return (
    <Panel title="Locked" icon={<Lock className="size-5 text-intel" />} testid="panel-locked">
      <p className="text-sm text-mist">Enter the Voice Lab admin password. It is sent once over HTTPS and never stored in this browser. Sessions last 30 minutes.</p>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input ref={ref} type="password" autoComplete="off" data-testid="input-admin-password" aria-label="Admin password" placeholder="Admin password"
          className="min-h-11 flex-1 rounded-full border border-input bg-raised px-4 text-sm outline-none focus:border-intel" />
        <Btn type="submit" kind="primary" testid="button-unlock" disabled={busy}><KeyRound className="size-4" />{busy ? 'Checking' : 'Unlock'}</Btn>
      </form>
      {error && <Note tone="error" testid="text-login-error">{error}</Note>}
    </Panel>
  );
}

function AdminLab({ s, lang, refresh, refreshing, onStatus, toast }: {
  s: VoiceLabStatus; lang: Language; refresh: () => void; refreshing: boolean; onStatus: (s: VoiceLabStatus) => void; toast: ReturnType<typeof useToast>['toast'];
}) {
  const qc = useQueryClient();
  const st = useGetUdaanState({ query: { queryKey: getGetUdaanStateQueryKey() } });
  const prov = useGetProviders({ query: { queryKey: getGetProvidersQueryKey() } });
  const logout = useLogoutVoiceLab();
  const authorize = useAuthorizeVoiceLab();
  const test = useTestVoiceLabConnection();
  const stt = useTranscribeVoice();
  const tts = useSynthesizeVoice();
  const chat = useSendChat();

  const [pending, setPending] = useState<Pending>(null);
  const [max, setMax] = useState(s.maxRequests || 6);
  const [credit, setCredit] = useState(false);
  const [testOp, setTestOp] = useState<VoiceOperation | null>(null);
  const [testErr, setTestErr] = useState<string | null>(null);

  // STT
  const rec = useRecorder();
  const [sttOp, setSttOp] = useState<VoiceOperation | null>(null);
  const [sttText, setSttText] = useState('');
  const [sttErr, setSttErr] = useState<string | null>(null);
  // TTS
  const player = usePlayer();
  const [ttsText, setTtsText] = useState(SAMPLES[lang]);
  const [ttsOp, setTtsOp] = useState<VoiceOperation | null>(null);
  const [ttsErr, setTtsErr] = useState<string | null>(null);
  // E2E
  const eRec = useRecorder();
  const ePlayer = usePlayer();
  const [eStt, setEStt] = useState<VoiceOperation | null>(null);
  const [eText, setEText] = useState('');
  const [eReply, setEReply] = useState<string | null>(null);
  const [eSpeech, setESpeech] = useState('');
  const [eTts, setETts] = useState<VoiceOperation | null>(null);
  const [eErr, setEErr] = useState<string | null>(null);

  const remaining = Math.max(0, s.maxRequests - s.usedRequests);
  const canBill = s.configured && s.paidEnabled && remaining > 0;
  const anyPending = test.isPending || stt.isPending || tts.isPending || chat.isPending;
  const blockReason = !s.configured ? 'Add SARVAM_API_KEY in Replit Secrets first.' : !s.paidEnabled ? 'Authorize paid attempts first.' : remaining <= 0 ? 'Allowance used up. Raise it to continue.' : null;

  const provider = st.data?.preferences.provider ?? 'demo';
  const pStatus = prov.data?.find((p) => p.id === provider);
  const reasoningOk = provider !== 'demo' && !!pStatus?.configured && !!pStatus?.paidCallsAllowed
    && pStatus.status !== 'authorized_call_limit_reached';
  const langMeta = LANGS.find((l) => l.id === lang);

  const afterOp = () => qc.invalidateQueries({ queryKey: getGetVoiceLabStatusQueryKey() });
  const confirmBill = (title: string, what: string, run: () => void) => setPending({
    title, run,
    body: <>{what} This uses 1 of your {remaining} remaining authorized attempts. Estimated worst case is shown before GST and is not an invoice.</>,
  });

  const doLogout = () => logout.mutate(undefined, {
    onSettled: () => {
      rec.reset(); eRec.reset(); player.clear(); ePlayer.clear();
      setSttOp(null); setSttText(''); setTtsOp(null); setTestOp(null); setEStt(null); setEText(''); setEReply(null); setESpeech(''); setETts(null);
      qc.invalidateQueries({ queryKey: getGetVoiceLabStatusQueryKey() });
    },
  });
  const doAuthorize = (enabled: boolean) => authorize.mutate({ data: { enabled, maxRequests: max, confirmed: true, creditCoverageConfirmed: enabled ? credit : false } }, {
    onSuccess: (n) => { onStatus(n); toast({ title: enabled ? 'Paid attempts authorized' : 'Paid attempts disabled', description: enabled ? n.maxRequests + ' total attempts. No provider call was made.' : undefined }); },
    onError: (e) => toast({ title: 'Authorization failed', description: friendlyError(e), variant: 'destructive' }),
  });
  const runTest = () => { setTestErr(null); test.mutate({ data: { confirmed: true } }, {
    onSuccess: (op) => { setTestOp(op); afterOp(); },
    onError: (e) => { setTestErr(friendlyError(e)); afterOp(); },
  }); };
  const runStt = (blob: Blob, onDone: (op: VoiceOperation) => void, onErr: (m: string) => void) => stt.mutate({ data: blob, params: { language: lang, confirmed: true } }, {
    onSuccess: (op) => { onDone(op); afterOp(); }, onError: (e) => { onErr(friendlyError(e)); afterOp(); },
  });
  const runTts = (text: string, onDone: (op: VoiceOperation) => void, onErr: (m: string) => void) => tts.mutate({ data: { language: lang, text, confirmed: true } }, {
    onSuccess: (op) => { onDone(op); afterOp(); }, onError: (e) => { onErr(friendlyError(e)); afterOp(); },
  });
  const runChat = () => { setEErr(null); chat.mutate({ data: { message: eText.trim(), voice: true } }, {
    onSuccess: (m) => { setEReply(m.content); setESpeech(m.speechText ?? m.content); qc.invalidateQueries({ queryKey: getGetConversationQueryKey() }); qc.invalidateQueries({ queryKey: getGetProvidersQueryKey() }); },
    onError: (e) => { setEErr('Udaan reasoning failed: ' + friendlyError(e) + ' Normal text chat on Ask is unaffected.'); qc.invalidateQueries({ queryKey: getGetProvidersQueryKey() }); },
  }); };

  const estTts = (n: number) => inr2((n / 1000) * 2);
  const used = s.maxRequests ? s.usedRequests / s.maxRequests : 0;

  return (
    <>
      {/* status + config */}
      <Panel step="01" title="Configuration" icon={<PlugZap className="size-5 text-intel" />} testid="panel-config">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-line bg-raised/40 p-3"><p className="text-[10px] uppercase tracking-wider text-mist">SARVAM_API_KEY</p><p data-testid="text-key-status" className={cn('mt-1 text-sm font-medium', s.configured ? 'text-signal' : 'text-[#ffb86b]')}>{s.configured ? 'Present in Secrets' : 'Missing'}</p></div>
          <div className="rounded-2xl border border-line bg-raised/40 p-3"><p className="text-[10px] uppercase tracking-wider text-mist">Allowance</p><p data-testid="text-allowance" className="mt-1 font-mono text-sm">{s.paidEnabled ? `${s.usedRequests} / ${s.maxRequests} used` : 'Paid calls off'}</p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-line"><div className={cn('h-full origin-left transition-transform duration-500', remaining ? 'bg-intel' : 'bg-[#ff7a6b]')} style={{ transform: `scaleX(${used})` }} /></div></div>
          <div className="rounded-2xl border border-line bg-raised/40 p-3"><p className="text-[10px] uppercase tracking-wider text-mist">Estimated spend</p><p data-testid="text-est-cost" className="mt-1 font-mono text-sm">{inr2(s.estimatedCostInr)} <span className="text-mist">pre-GST</span></p></div>
        </div>
        {!s.configured && <Note tone="warn" testid="text-key-instructions">Add <code className="font-mono">SARVAM_API_KEY</code> in Tools, then Secrets. Keys are never entered on this page. Then press Refresh status.</Note>}
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn testid="button-refresh-status" disabled={refreshing} onClick={refresh}><RefreshCw className={cn('size-4', refreshing && 'animate-spin')} />Refresh status</Btn>
          <Btn testid="button-logout" disabled={logout.isPending} onClick={doLogout}><LogOut className="size-4" />Lock lab</Btn>
        </div>
      </Panel>

      <Panel step="02" title="Spending authorization" icon={<ShieldAlert className="size-5 text-[#ffb86b]" />} testid="panel-authorize">
        <p className="text-sm text-mist">Set a hard cap on total Sarvam attempts (1 to 10). The cap persists across refreshes. Estimates: TTS up to ₹2 per 1,000 characters, STT ₹0.49 per minute, before GST. Authorizing makes no provider call.</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-3 text-sm">Total attempts
            <input type="number" min={1} max={10} value={max} data-testid="input-max-requests" onChange={(e) => setMax(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
              className="min-h-11 w-20 rounded-full border border-input bg-raised px-4 font-mono text-sm" />
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" data-testid="checkbox-credit" checked={credit} onChange={(e) => setCredit(e.target.checked)} className="size-4 accent-[#bdf52f]" />
            I confirm my Sarvam credits cover these attempts
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn kind="primary" testid="button-authorize" disabled={!credit || authorize.isPending} onClick={() => doAuthorize(true)}><Check className="size-4" />{s.paidEnabled ? 'Update cap' : 'Authorize'}</Btn>
          {s.paidEnabled && <Btn kind="danger" testid="button-disable-paid" disabled={authorize.isPending} onClick={() => doAuthorize(false)}><X className="size-4" />Disable paid calls</Btn>}
        </div>
      </Panel>

      <Panel step="03" title="Test connection" icon={<PlugZap className="size-5 text-signal" />} testid="panel-test">
        <p className="text-sm text-mist">Sends one minimal text-to-speech request using bulbul:v4-flash.</p>
        <div className="mt-3"><Btn kind="primary" testid="button-test-connection" disabled={!canBill || anyPending}
          onClick={() => confirmBill('Test Sarvam connection', 'One minimal TTS request will be sent.', runTest)}>{test.isPending ? <span className="typing"><span /><span /><span /></span> : <PlugZap className="size-4" />}Test connection</Btn></div>
        {blockReason && <p className="mt-2 text-xs text-mist">{blockReason}</p>}
        {testOp && <OpCard op={testOp} testid="card-test-result" />}
        {testErr && <Note tone="error" testid="text-test-error">{testErr}</Note>}
      </Panel>

      <Panel step="04" title="Speech to text" icon={<Mic className="size-5 text-intel" />} testid="panel-stt">
        <p className="text-sm text-mist">Model saaras:v4 · Language <span className="text-snow">{langMeta?.label}</span> (change in Settings). Try: <span className="italic text-snow">{TEST_PHRASE}</span></p>
        <div className="mt-3"><Recorder rec={rec} prefix="stt" /></div>
        <div className="mt-3"><Btn kind="primary" testid="button-transcribe" disabled={!canBill || anyPending || !rec.blob}
          onClick={() => rec.blob && confirmBill('Upload for transcription', 'The recording (max 10s) will be sent to Sarvam STT.', () => { setSttErr(null); runStt(rec.blob!, (op) => { setSttOp(op); setSttText(op.transcript ?? ''); }, setSttErr); })}>
          {stt.isPending ? <span className="typing"><span /><span /><span /></span> : <AudioLines className="size-4" />}Transcribe</Btn></div>
        {sttOp && <OpCard op={sttOp} testid="card-stt-result" />}
        {sttOp && <textarea data-testid="input-stt-transcript" value={sttText} onChange={(e) => setSttText(e.target.value)} rows={3} className="mt-3 w-full rounded-2xl border border-input bg-raised p-3 text-sm" />}
        {sttErr && <Note tone="error" testid="text-stt-error">{sttErr}</Note>}
      </Panel>

      <Panel step="05" title="Text to speech" icon={<AudioLines className="size-5 text-signal" />} testid="panel-tts">
        <p className="text-sm text-mist">Model bulbul:v4-flash · Speaker <span className="font-mono text-snow">{SPEAKERS[lang]}</span></p>
        <textarea data-testid="input-tts-text" value={ttsText} maxLength={1000} onChange={(e) => setTtsText(e.target.value)} rows={4} className="mt-3 w-full rounded-2xl border border-input bg-raised p-3 text-sm" />
        <div className="flex justify-between text-xs text-mist"><span>{ttsText.length} / 1000</span><span>Est. up to {estTts(ttsText.length)}</span></div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn testid="button-sample-text" onClick={() => setTtsText(SAMPLES[lang])}><Wand2 className="size-4" />Reset sample</Btn>
          <Btn kind="primary" testid="button-synthesize" disabled={!canBill || anyPending || !ttsText.trim()}
            onClick={() => confirmBill('Synthesize speech', `${ttsText.length} characters will be sent to Sarvam TTS (est. up to ${estTts(ttsText.length)}).`, () => { setTtsErr(null); runTts(ttsText.trim(), (op) => { setTtsOp(op); player.load(op); }, setTtsErr); })}>
            {tts.isPending ? <span className="typing"><span /><span /><span /></span> : <Play className="size-4" />}Synthesize</Btn>
        </div>
        {ttsOp && <OpCard op={ttsOp} testid="card-tts-result" />}
        {ttsOp && !ttsOp.audioBase64 && <Note tone="warn">No audio was returned.</Note>}
        <PlayerControls p={player} prefix="tts" />
        {ttsErr && <Note tone="error" testid="text-tts-error">{ttsErr}</Note>}
      </Panel>

      <Panel step="06" title="End-to-end" icon={<Workflow className="size-5 text-intel" />} testid="panel-e2e">
        <ol className="mb-3 flex flex-wrap gap-2 font-mono text-[11px] text-mist">
          {['Record', 'STT', 'Edit', 'Udaan', 'TTS', 'Play'].map((x, i) => {
            const done = [!!eRec.blob, !!eStt, !!eText && !!eStt, !!eReply, !!eTts, ePlayer.playing || !!eTts?.audioBase64][i];
            return <li key={x} className={cn('rounded-full border px-2.5 py-1 transition', done ? 'border-signal/50 text-signal' : 'border-line')}>{i + 1} {x}</li>;
          })}
        </ol>
        {!reasoningOk ? (
          <Note tone="warn" testid="text-e2e-blocked">Select a configured OpenAI or Anthropic provider with paid calls allowed in Settings. Demo Mode cannot run this test, and the lab will not switch providers for you.</Note>
        ) : (
          <Note tone="info">Uses {pStatus?.name} with your existing business context, market and learning. Its own call cap is unchanged; at least one reasoning call should remain before you continue.</Note>
        )}
        {reasoningOk && <>
          <div className="mt-3"><Recorder rec={eRec} prefix="e2e" /></div>
          <div className="mt-3"><Btn kind="primary" testid="button-e2e-transcribe" disabled={!canBill || anyPending || !eRec.blob}
            onClick={() => eRec.blob && confirmBill('Step 2: transcribe', 'Your recording will be sent to Sarvam STT.', () => { setEErr(null); setEReply(null); setETts(null); ePlayer.clear(); runStt(eRec.blob!, (op) => { setEStt(op); setEText(op.transcript ?? ''); }, setEErr); })}>
            <AudioLines className="size-4" />Transcribe</Btn></div>
          {eStt && <OpCard op={eStt} testid="card-e2e-stt" />}
          {eStt && <>
            <label className="mt-3 block text-xs text-mist">Approve or edit the transcript. Nothing is sent automatically.</label>
            <textarea data-testid="input-e2e-transcript" value={eText} maxLength={2000} onChange={(e) => setEText(e.target.value)} rows={3} className="mt-1 w-full rounded-2xl border border-input bg-raised p-3 text-sm" />
            <div className="mt-2"><Btn kind="primary" testid="button-e2e-continue" disabled={!eText.trim() || anyPending} onClick={() => setPending({ title: 'Continue with Udaan', body: 'This uses one ' + (pStatus?.name ?? '') + ' reasoning call from its existing cap.', run: runChat })}>
              {chat.isPending ? <span className="typing"><span /><span /><span /></span> : <Workflow className="size-4" />}Continue with Udaan</Btn></div>
          </>}
          {eReply && <div className="rise mt-3 rounded-2xl border border-intel/25 bg-intel/[.04] p-3 text-sm" data-testid="text-e2e-reply">{eReply}</div>}
          {eReply && <>
            <label className="mt-3 block text-xs text-mist">Speech text ({eSpeech.length} / 1000)</label>
            <textarea data-testid="input-e2e-speech" value={eSpeech} onChange={(e) => setESpeech(e.target.value)} rows={3} className="mt-1 w-full rounded-2xl border border-input bg-raised p-3 text-sm" />
            {eSpeech.length > 1000 && <Note tone="warn" testid="text-e2e-too-long">Speech text is over 1,000 characters. Shorten it before synthesis; it is never truncated silently.</Note>}
            <div className="mt-2"><Btn kind="primary" testid="button-e2e-speak" disabled={!canBill || anyPending || !eSpeech.trim() || eSpeech.length > 1000}
              onClick={() => confirmBill('Step 5: speak reply', `${eSpeech.length} characters will be sent to Sarvam TTS (est. up to ${estTts(eSpeech.length)}).`, () => { setEErr(null); runTts(eSpeech.trim(), (op) => { setETts(op); ePlayer.load(op); }, setEErr); })}>
              <Play className="size-4" />Synthesize reply</Btn></div>
          </>}
          {eTts && <OpCard op={eTts} testid="card-e2e-tts" />}
          <PlayerControls p={ePlayer} prefix="e2e" />
        </>}
        {blockReason && reasoningOk && <p className="mt-2 text-xs text-mist">{blockReason}</p>}
        {eErr && <Note tone="error" testid="text-e2e-error">{eErr}</Note>}
      </Panel>

      <Panel step="07" title="Request log" icon={<RefreshCw className="size-5 text-mist" />} testid="panel-log">
        {s.requests.length === 0 ? <p className="text-sm text-mist">No Sarvam requests yet. Attempts will appear here with their real outcome.</p>
          : <div className="space-y-1">{s.requests.slice().reverse().map((op, i) => <OpCard key={op.id} op={op} testid={'row-request-' + i} />)}</div>}
      </Panel>

      {pending && <ConfirmDialog open onOpenChange={(v) => !v && setPending(null)} title={pending.title} body={pending.body} onConfirm={() => { const r = pending.run; setPending(null); r(); }} />}
    </>
  );
}

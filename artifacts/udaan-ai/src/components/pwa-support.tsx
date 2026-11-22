import { useEffect, useState } from 'react';
import { Download, RefreshCw, WifiOff } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useOnline } from '@/lib/pwa';
import { useI18n } from '@/lib/i18n';
import { UdaanMark } from './udaan-mark';
import { ConfirmDialog } from './confirm-dialog';
interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
let deferredInstall: InstallEvent | null = null;

const offlineCopy = {
  en: ['You’re offline', 'Open inputs stay on this screen. Reconnect to save experiments and use AI, Sarvam voice or live restaurant inspiration.', 'Your private business context is not cached offline.', 'Reconnect to continue'],
  hinglish: ['Abhi internet nahi hai', 'Is screen ke inputs yahin hain. Experiments save karne, AI, Sarvam voice aur restaurant inspiration ke liye reconnect karein.', 'Aapka private business context offline cache nahi hota.', 'Reconnect karke aage badhein'],
  hi: ['अभी internet नहीं है', 'इस screen के inputs यहीं हैं। Experiments save करने, AI, Sarvam voice और restaurant inspiration के लिए reconnect करें।', 'आपका private business context offline cache नहीं होता।', 'Reconnect करके आगे बढ़ें'],
  kn: ['ಈಗ internet ಸಂಪರ್ಕ ಇಲ್ಲ', 'ಈ screenನ inputs ಇಲ್ಲೇ ಇವೆ. Experiments save ಮಾಡಲು, AI, Sarvam voice ಮತ್ತು restaurant inspiration ಬಳಸಲು reconnect ಮಾಡಿ.', 'ನಿಮ್ಮ private business context offline cache ಆಗುವುದಿಲ್ಲ.', 'Reconnect ಮಾಡಿ ಮುಂದುವರಿಯಿರಿ'],
} as const;

export function OfflineLaunch() {
  const { lang } = useI18n(); const c = offlineCopy[lang];
  return <main data-testid="offline-launch" className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center gap-5 px-6 py-16">
    <UdaanMark className="size-16" /><p className="font-mono text-xs uppercase tracking-widest text-intel">Udaan AI · Offline</p>
    <h1 className="font-display text-4xl font-bold">{c[0]}</h1>
    <p className="text-mist">{c[2]} Reconnect for saved experiments, OpenAI/Anthropic, Sarvam and IndiaRestros.</p>
    <button onClick={() => location.reload()} className="min-h-12 rounded-full bg-signal px-5 font-semibold text-ink">{c[3]}</button>
    <p className="text-xs text-mist">Saved experiments remain on the server. No offline synchronization or automatic submission occurs.</p>
  </main>;
}
export function PwaRuntime() {
  const online = useOnline(); const { lang } = useI18n();
  const [confirm, setConfirm] = useState(false);
  const [registrationError, setRegistrationError] = useState(false);
  useEffect(() => {
    const capture = (event: Event) => {
      event.preventDefault(); deferredInstall = event as InstallEvent;
      window.dispatchEvent(new Event('udaan-install-ready'));
    };
    window.addEventListener('beforeinstallprompt', capture);
    return () => window.removeEventListener('beforeinstallprompt', capture);
  }, []);
  const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW({
    onRegisterError: () => setRegistrationError(true),
  });
  if (online && !needRefresh && !registrationError) return null;
  return <>
    <aside role="status" data-testid="pwa-status" className="fixed bottom-[calc(6.3rem+env(safe-area-inset-bottom))] left-3 right-3 z-40 rounded-2xl border border-intel/40 bg-surface p-4 shadow-xl md:bottom-6 md:left-auto md:max-w-sm">
      {!online ? <><p className="flex items-center gap-2 font-semibold text-intel"><WifiOff className="size-4" />{offlineCopy[lang][0]}</p><p className="mt-1 text-xs text-mist">{offlineCopy[lang][1]}</p></>
        : registrationError ? <><p className="font-semibold text-[#ffb86b]">Offline setup unavailable</p><p className="mt-1 text-xs text-mist">Udaan still works online. Reopen in a standalone HTTPS browser tab when your inputs are saved.</p></>
        : <><p className="font-semibold">Udaan update ready</p><p className="mt-1 text-xs text-mist">Save or copy open inputs first. Nothing reloads automatically.</p>
          <div className="mt-2 flex gap-3"><button data-testid="pwa-update" onClick={() => setConfirm(true)} className="min-h-11 rounded-full bg-signal px-4 text-sm font-semibold text-ink">Review update</button>
            <button onClick={() => setNeedRefresh(false)} className="min-h-11 px-3 text-sm text-mist">Later</button></div></>}
    </aside>
    <ConfirmDialog open={confirm} onOpenChange={setConfirm} title="Reload to apply the update?" body="Saved experiments will not change. Unsaved inputs on this screen will be lost if you reload. Save or copy them before continuing." onConfirm={() => { setConfirm(false); void updateServiceWorker(true); }} />
  </>;
}
export function PwaInstall() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(deferredInstall);
  const [installed, setInstalled] = useState(() => matchMedia('(display-mode: standalone)').matches);
  useEffect(() => {
    const capture = () => setPrompt(deferredInstall);
    const done = () => { setInstalled(true); setPrompt(null); };
    window.addEventListener('udaan-install-ready', capture); window.addEventListener('appinstalled', done);
    return () => { window.removeEventListener('udaan-install-ready', capture); window.removeEventListener('appinstalled', done); };
  }, []);
  return <section data-testid="pwa-install" className="rounded-3xl border border-line bg-surface p-5">
    <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Download className="size-5 text-intel" />Install Udaan</h2>
    {installed ? <p className="mt-2 text-sm text-signal">Running in a standalone app window.</p> : <>
      <p className="mt-2 text-sm text-mist">Android Chrome: open Udaan in its own browser tab, then choose Install app in the menu. iPhone Safari: Share → Add to Home Screen.</p>
      {prompt && <button data-testid="pwa-install-button" onClick={async () => { await prompt.prompt(); await prompt.userChoice; deferredInstall = null; setPrompt(null); }} className="mt-3 min-h-11 rounded-full bg-signal px-4 font-semibold text-ink">Install Udaan</button>}
      {import.meta.env.DEV && <p className="mt-2 text-xs text-mist">Development preview: installation and offline caching activate in the production build on HTTPS. Embedded previews may not offer installation.</p>}
    </>}
    <p className="mt-3 flex items-start gap-2 text-xs text-mist"><RefreshCw className="mt-0.5 size-4 shrink-0" />Only the public app shell is cached. AI, Sarvam voice, saved business context and live restaurant data require a connection. Updates ask before reloading.</p>
  </section>;
}

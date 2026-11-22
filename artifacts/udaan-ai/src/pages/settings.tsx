import { useState } from 'react';
import { useLocation } from 'wouter';
import { Check, Cpu, RotateCcw, Volume2, PlugZap } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetProviders, getGetProvidersQueryKey, useTestProvider, useResetDemo, getGetUdaanStateQueryKey,
  useGetUdaanState, type ProviderStatus,
} from '@workspace/api-client-react';
import { useI18n, LANGS } from '@/lib/i18n';
import { speechSupported } from '@/lib/speech';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ErrorState } from '@/components/states';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { errMsg } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { t, lang, setLang, setPrefs } = useI18n();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, nav] = useLocation();
  const st = useGetUdaanState({ query: { queryKey: getGetUdaanStateQueryKey() } });
  const prov = useGetProviders({ query: { queryKey: getGetProvidersQueryKey() } });
  const test = useTestProvider();
  const reset = useResetDemo();
  const [testing, setTesting] = useState<ProviderStatus | null>(null);
  const [failedId, setFailedId] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const current = st.data?.preferences.provider ?? 'demo';

  const runTest = (p: ProviderStatus) => test.mutate({ data: { provider: p.id, confirmed: true } }, {
    onSuccess: (r) => { qc.invalidateQueries({ queryKey: getGetProvidersQueryKey() }); const ok = !/fail|error/i.test(r.status); setFailedId(ok ? null : p.id); toast({ title: ok ? t('settings.testDone') : t('settings.testFailed'), description: r.lastTest, variant: ok ? 'default' : 'destructive' }); },
    onError: (e) => { setFailedId(p.id); qc.invalidateQueries({ queryKey: getGetProvidersQueryKey() }); toast({ title: t('settings.testFailed'), description: errMsg(e, ''), variant: 'destructive' }); },
  });
  const doReset = () => reset.mutate({ data: { confirmed: true } }, {
    onSuccess: (s) => { qc.setQueryData(getGetUdaanStateQueryKey(), s); qc.invalidateQueries(); toast({ title: t('settings.resetDone') }); nav('/'); },
    onError: (e) => toast({ title: errMsg(e, t('error.generic')), variant: 'destructive' }),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="rise font-display text-4xl font-bold">{t('settings.title')}</h1>

      <section>
        <h2 className="font-display text-xl font-semibold">{t('settings.language')}</h2>
        <p className="mb-3 text-sm text-mist">{t('settings.languageNote')}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="radiogroup">
          {LANGS.map((l) => (
            <button key={l.id} role="radio" aria-checked={lang === l.id} data-testid={'button-lang-' + l.id} onClick={() => setLang(l.id)}
              className={cn('relative flex min-h-24 flex-col justify-between rounded-3xl border p-4 text-left transition active:scale-[.97]', lang === l.id ? 'border-signal/70 bg-signal/[.06]' : 'border-line bg-surface hover:border-intel/40')}>
              <span className={cn('font-display text-2xl font-bold', lang === l.id ? 'text-signal' : 'text-intel')}>{l.glyph}</span>
              <span><span className="block font-semibold">{l.label}</span><span className="block text-xs text-mist">{l.sub}</span></span>
              {lang === l.id && <Check className="absolute right-3 top-3 size-4 text-signal" />}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Cpu className="size-5 text-intel" />{t('settings.providers')}</h2>
        <p className="mb-3 text-sm text-mist">{t('settings.providersNote')}</p>
        {prov.isLoading && <Skeleton className="h-40 rounded-3xl bg-raised" />}
        {prov.isError && <ErrorState onRetry={() => prov.refetch()} />}
        <div className="space-y-3">
          {prov.data?.map((p) => {
            const inUse = current === p.id;
            const canUse = p.id === 'demo' || p.configured;
            return (
              <div key={p.id} data-testid={'card-provider-' + p.id} className={cn('rounded-3xl border p-4', inUse ? 'border-signal/50 bg-signal/[.03]' : 'border-line bg-surface')}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold">{p.name}</div>
                  <span className={cn('rounded-full border px-2.5 py-0.5 text-[11px] uppercase tracking-wider', p.configured ? 'border-intel/40 text-intel' : 'border-line text-mist')}>{p.configured ? t('settings.configured') : t('settings.notConfigured')}</span>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div><dt className="text-[11px] text-mist">{t('settings.model')}</dt><dd className="font-mono text-xs">{p.model || '—'}</dd></div>
                  <div><dt className="text-[11px] text-mist">{t('settings.status')}</dt><dd className="text-xs" data-testid={'status-provider-' + p.id}>{p.status}</dd></div>
                  <div className="col-span-2"><dt className="text-[11px] text-mist">{t('settings.lastTest')}</dt><dd className="text-xs">{p.lastTest || t('settings.never')}</dd></div>
                </dl>
                {p.id !== 'demo' && !p.paidCallsAllowed && <p className="mt-2 text-xs text-[#ffb86b]">{t('settings.paidBlocked')}</p>}
                {failedId === p.id && <p role="alert" className="mt-2 text-xs text-[#ff7a6b]">{t('settings.testFailed')}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button data-testid={'button-use-' + p.id} disabled={inUse || !canUse} onClick={() => setPrefs({ provider: p.id })}
                    className={cn('min-h-11 rounded-full px-4 text-sm font-medium', inUse ? 'bg-signal/15 text-signal' : 'bg-snow text-ink disabled:opacity-40')}>
                    {inUse ? t('settings.inUse') : t('settings.use')}
                  </button>
                  {p.id !== 'demo' && (
                    <button data-testid={'button-test-' + p.id} disabled={!p.configured || !p.paidCallsAllowed || test.isPending} onClick={() => setTesting(p)}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm disabled:opacity-40"><PlugZap className="size-4" />{failedId === p.id ? t('common.retry') : t('settings.test')}</button>
                  )}
                  {failedId === p.id && current !== 'demo' && <button data-testid="button-back-demo" onClick={() => setPrefs({ provider: 'demo' })} className="min-h-11 rounded-full border border-line px-4 text-sm text-intel">{t('ask.switchDemo')}</button>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-surface p-5">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Volume2 className="size-5 text-intel" />{t('settings.voice')}</h2>
        <p className={cn('mt-1 text-sm', speechSupported ? 'text-signal' : 'text-[#ffb86b]')}>{speechSupported ? t('settings.voiceAvailable') : t('settings.voiceMissing')}</p>
        <p className="mt-2 text-sm text-mist">{t('settings.voiceNote')}</p>
      </section>

      <section className="rounded-3xl border border-line bg-surface p-5">
        <h2 className="font-display text-xl font-semibold">{t('settings.demo')}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button data-testid="button-replay-intro" onClick={() => setPrefs({ onboarded: false })} className="min-h-11 rounded-full border border-line px-4 text-sm">{t('settings.replayIntro')}</button>
          <button data-testid="button-reset-demo" disabled={reset.isPending} onClick={() => setResetOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#ff7a6b]/40 px-4 text-sm text-[#ff7a6b]"><RotateCcw className="size-4" />{t('settings.reset')}</button>
        </div>
      </section>

      {testing && <ConfirmDialog open onOpenChange={(v) => !v && setTesting(null)} title={t('settings.test')} body={t('settings.testBody', { name: testing.name })} onConfirm={() => { runTest(testing); setTesting(null); }} />}
      <ConfirmDialog open={resetOpen} onOpenChange={setResetOpen} title={t('settings.reset')} body={t('settings.resetBody')} tone="danger" onConfirm={() => { setResetOpen(false); doReset(); }} />
    </div>
  );
}

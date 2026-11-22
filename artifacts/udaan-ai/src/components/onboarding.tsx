import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import type { Language } from '@workspace/api-client-react';
import { useI18n, LANGS } from '@/lib/i18n';
import { SunriseArt, UdaanMark } from '@/components/udaan-mark';
import { cn } from '@/lib/utils';

export function Onboarding() {
  const { lang, t, setPrefs, saving } = useI18n();
  const [pick, setPick] = useState<Language>(lang);
  const choose = (l: Language) => { setPick(l); setPrefs({ language: l }); };
  return (
    <div className="pt-safe pb-safe relative min-h-[100dvh] overflow-hidden">
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 pb-6 pt-6">
        <div className="rise flex items-center gap-2.5"><UdaanMark /><span className="font-display text-lg font-bold">Udaan<span className="text-intel"> AI</span></span></div>
        <SunriseArt className="rise -mx-5 mt-2 w-[calc(100%+2.5rem)]" />
        <h1 className="rise font-display text-[2rem] font-bold leading-[1.05] text-snow" style={{ animationDelay: '80ms' }}>{t('onboard.title')}</h1>
        <p className="rise mt-3 text-[15px] leading-relaxed text-mist" style={{ animationDelay: '140ms' }}>{t('onboard.meet')}</p>
        <h2 className="rise mt-6 text-xs font-medium uppercase tracking-[0.18em] text-intel" style={{ animationDelay: '200ms' }}>{t('onboard.pick')}</h2>
        <div className="mt-3 grid grid-cols-2 gap-3" role="radiogroup">
          {LANGS.map((l, i) => {
            const on = pick === l.id;
            return (
              <button key={l.id} role="radio" aria-checked={on} data-testid={'button-onboard-' + l.id} onClick={() => choose(l.id)}
                style={{ animationDelay: 240 + i * 60 + 'ms' }}
                className={cn('rise relative flex min-h-[104px] flex-col items-start justify-between rounded-3xl border p-4 text-left transition-all active:scale-[.97]',
                  on ? 'border-signal/70 bg-signal/[.07]' : 'border-line bg-surface hover:border-intel/40')}>
                <span className={cn('font-display text-3xl font-bold', on ? 'text-signal' : 'text-intel')}>{l.glyph}</span>
                <span><span className="block font-semibold text-snow">{l.label}</span><span className="block text-xs text-mist">{l.sub}</span></span>
                {on && <Check className="absolute right-3 top-3 size-4 text-signal" />}
              </button>
            );
          })}
        </div>
        <div className="mt-auto pt-6">
          <button data-testid="button-start-demo" disabled={saving} onClick={() => setPrefs({ language: pick, onboarded: true })}
            className="group flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-signal font-semibold text-ink transition active:scale-[.98] disabled:opacity-60">
            {t('onboard.start')}<ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
          </button>
          <p className="mt-3 text-center text-xs text-mist">{t('onboard.fictional')}</p>
        </div>
      </div>
    </div>
  );
}

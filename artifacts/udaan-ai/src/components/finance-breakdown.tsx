import type { Financials } from '@workspace/api-client-react';
import { Info } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { inr, num } from '@/lib/format';
import { cn } from '@/lib/utils';

export function FinanceBreakdown({ f, pending, compact }: { f: Financials; pending?: boolean; compact?: boolean }) {
  const { t } = useI18n();
  const total = Math.max(f.revenue, f.variableCosts + f.promotionCost, 1);
  const w = (n: number) => Math.max(0, (n / total) * 100) + '%';
  const after = f.contributionAfterPromotion;
  return (
    <div data-testid="finance-breakdown" className={cn('space-y-4 transition-opacity', pending && 'opacity-60')}>
      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs uppercase tracking-[0.14em] text-mist">{t('fin.after')}</span>
          {pending && <span className="text-xs text-intel">{t('fin.calculating')}</span>}
        </div>
        <div data-testid="text-contribution-after" className={cn('font-display text-4xl font-bold tabular-nums', after >= 0 ? 'text-signal' : 'text-[#ff7a6b]')}>{inr(after)}</div>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-line" aria-hidden>
        <div className="h-full bg-mist/50" style={{ width: w(f.variableCosts) }} />
        <div className="h-full bg-intel" style={{ width: w(f.promotionCost) }} />
        <div className="h-full bg-signal" style={{ width: w(Math.max(after, 0)) }} />
      </div>
      <dl className="divide-y divide-line rounded-2xl border border-line bg-ink/40 font-mono text-sm">
        <Row k={t('fin.revenue')} v={inr(f.revenue)} sub={num(f.units) + ' × ' + inr(f.revenue / Math.max(f.units, 1))} />
        <Row k={t('fin.makingTotal')} v={'− ' + inr(f.variableCosts)} dot="bg-mist/50" />
        <Row k={t('fin.before')} v={inr(f.contributionBeforePromotion)} />
        <Row k={t('fin.promotion')} v={'− ' + inr(f.promotionCost)} dot="bg-intel" />
        <Row k={t('fin.after')} v={inr(after)} dot="bg-signal" strong />
        {!compact && <Row k={t('fin.unit')} v={inr(f.unitContribution)} />}
        <Row k={t('fin.breakEven')} v={f.breakEvenUnits === null ? t('fin.noBreakEven') : num(f.breakEvenUnits)} />
      </dl>
      {f.overheadExcluded && (
        <p className="flex gap-2 text-xs leading-relaxed text-mist"><Info className="mt-0.5 size-3.5 shrink-0 text-intel" />{t('fin.overhead')}</p>
      )}
    </div>
  );
}

function Row({ k, v, sub, dot, strong }: { k: string; v: string; sub?: string; dot?: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5">
      <dt className="flex items-center gap-2 font-sans text-mist">{dot && <span className={cn('size-2 rounded-full', dot)} />}{k}{sub && <span className="hidden text-[11px] text-mist/70 sm:inline">{sub}</span>}</dt>
      <dd className={cn('tabular-nums text-snow', strong && 'font-semibold text-signal')}>{v}</dd>
    </div>
  );
}

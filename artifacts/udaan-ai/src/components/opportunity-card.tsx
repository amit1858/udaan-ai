import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import type { Opportunity } from '@workspace/api-client-react';
import { OppImage } from '@/components/opp-image';
import { ListenButton } from '@/components/listen-button';
import { useI18n } from '@/lib/i18n';
import { inr } from '@/lib/format';
import { cn } from '@/lib/utils';

export const catTone: Record<string, string> = { experiment: 'text-signal', story: 'text-intel', technology: 'text-[#c9b8ff]' };

export function OpportunityCard({ o, variant = 'full', className }: { o: Opportunity; variant?: 'full' | 'mini' | 'feature'; className?: string }) {
  const { t } = useI18n();
  const catKey = ('cat.' + o.category) as 'cat.story';
  if (variant === 'mini') {
    return (
      <Link href={'/opportunity/' + o.id} data-testid={'card-opportunity-mini-' + o.id}
        className={cn('group block w-[78%] shrink-0 snap-start overflow-hidden rounded-3xl border border-line card-sheen transition hover:border-intel/40 sm:w-auto', className)}>
        <OppImage src={o.image} alt={o.imageAlt} className="aspect-[16/10]" />
        <div className="p-4">
          <div className={cn('text-[11px] font-medium uppercase tracking-[0.16em]', catTone[o.category])}>{t(catKey)}</div>
          <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-snow">{o.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-mist">{o.description}</p>
        </div>
      </Link>
    );
  }
  return (
    <article data-testid={'card-opportunity-' + o.id} className={cn('group overflow-hidden rounded-[28px] border border-line card-sheen transition hover:border-intel/30', className)}>
      <Link href={'/opportunity/' + o.id} className="relative block" tabIndex={-1} aria-hidden>
        <OppImage src={o.image} alt={o.imageAlt} className={variant === 'feature' ? 'aspect-[16/10] md:aspect-[21/9]' : 'aspect-[16/10]'} />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/10 to-transparent" />
        <span className={cn('absolute left-4 top-4 rounded-full border border-line bg-ink/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] backdrop-blur', catTone[o.category])}>{t(catKey)}</span>
      </Link>
      <div className="-mt-10 relative space-y-3 p-5">
        <h3 className={cn('font-display font-bold leading-tight text-snow', variant === 'feature' ? 'text-3xl' : 'text-2xl')}>{o.title}</h3>
        {o.category === 'story' && <p className="text-[11px] uppercase tracking-wider text-mist/80">{t('cat.illustrative')}</p>}
        <p className="text-[15px] leading-relaxed text-mist">{o.description}</p>
        <div className="rounded-2xl border border-line bg-ink/50 p-3.5">
          <div className="text-[11px] uppercase tracking-[0.14em] text-intel">{t('common.whyFits')}</div>
          <p className="mt-1 text-sm text-snow/90">{o.whyItFits}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-line p-3"><div className="text-[11px] text-mist">{t('common.budget')}</div><div className="font-mono text-lg text-snow">{inr(o.budget)}</div></div>
          <div className="rounded-2xl border border-line p-3"><div className="text-[11px] text-mist">{t('common.benefit')}</div><div className="text-sm leading-snug text-signal">{o.benefit}</div></div>
        </div>
        {o.assumptions.length > 0 && (
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-mist">{t('common.assumptions')}</div>
            <ul className="mt-1.5 space-y-1">{o.assumptions.slice(0, 2).map((a) => <li key={a} className="flex gap-2 text-sm text-mist"><span className="mt-2 size-1 shrink-0 rounded-full bg-intel" />{a}</li>)}</ul>
          </div>
        )}
        <div className="flex items-center gap-2 pt-1">
          <Link href={'/opportunity/' + o.id} data-testid={'button-explore-' + o.id}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-signal px-5 text-sm font-semibold text-ink transition active:scale-[.98]">
            {t('common.explore')}<ArrowUpRight className="size-4" />
          </Link>
          <ListenButton id={'opp-' + o.id} text={o.title + '. ' + o.description + ' ' + o.whyItFits} />
        </div>
      </div>
    </article>
  );
}

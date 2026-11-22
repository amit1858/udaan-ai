import { useState } from 'react';
import { useOpportunities } from '@/hooks/use-opportunities';
import { useI18n, type TKey } from '@/lib/i18n';
import { OpportunityCard } from '@/components/opportunity-card';
import { ErrorState, PageSkeleton } from '@/components/states';
import { cn } from '@/lib/utils';

const TABS: { id: string; key: TKey }[] = [
  { id: 'all', key: 'discover.all' }, { id: 'experiment', key: 'discover.try' },
  { id: 'story', key: 'discover.stories' }, { id: 'technology', key: 'discover.tech' },
];

export default function DiscoverPage() {
  const { t } = useI18n();
  const q = useOpportunities();
  const [tab, setTab] = useState('all');
  if (q.isLoading) return <PageSkeleton />;
  if (q.isError || !q.data) return <ErrorState onRetry={() => q.refetch()} />;
  const list = q.data.filter((o) => tab === 'all' || o.category === tab);
  const [lead, ...rest] = list;
  return (
    <div className="space-y-6">
      <header className="rise">
        <h1 className="font-display text-4xl font-bold md:text-5xl">{t('discover.title')}</h1>
        <p className="mt-2 max-w-xl text-mist">{t('discover.subtitle')}</p>
      </header>
      <div role="tablist" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
        {TABS.map((x) => (
          <button key={x.id} role="tab" aria-selected={tab === x.id} data-testid={'tab-' + x.id} onClick={() => setTab(x.id)}
            className={cn('min-h-11 shrink-0 rounded-full border px-5 text-sm transition', tab === x.id ? 'border-snow bg-snow text-ink' : 'border-line text-mist hover:text-snow')}>
            {t(x.key)}
          </button>
        ))}
      </div>
      {!lead ? <div className="rounded-3xl border border-dashed border-line p-8 text-center text-mist">{t('discover.empty')}</div> : (
        <>
          <OpportunityCard o={lead} variant="feature" className="rise" />
          <div className="grid gap-5 md:grid-cols-2">
            {rest.map((o) => <OpportunityCard key={o.id} o={o} className="rise" />)}
          </div>
        </>
      )}
    </div>
  );
}

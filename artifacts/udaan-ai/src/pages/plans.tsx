import { Link } from 'wouter';
import { ArrowRight, FlaskConical } from 'lucide-react';
import { useGetExperiments, getGetExperimentsQueryKey, useGetUdaanState, getGetUdaanStateQueryKey } from '@workspace/api-client-react';
import { useOpportunities } from '@/hooks/use-opportunities';
import { useI18n, type TKey } from '@/lib/i18n';
import { OppImage } from '@/components/opp-image';
import { StatusPill, MiniStepper } from '@/components/lifecycle';
import { ErrorState, PageSkeleton, SectionTitle } from '@/components/states';
import { inr } from '@/lib/format';

export default function PlansPage() {
  const { t } = useI18n();
  const q = useGetExperiments({ query: { queryKey: getGetExperimentsQueryKey() } });
  const st = useGetUdaanState({ query: { queryKey: getGetUdaanStateQueryKey() } });
  const opps = useOpportunities();
  if (q.isLoading) return <PageSkeleton />;
  if (q.isError || !q.data) return <ErrorState onRetry={() => q.refetch()} />;
  const om = new Map((opps.data ?? []).map((o) => [o.id, o]));
  const list = [...q.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <div className="space-y-8">
      <header className="rise">
        <h1 className="font-display text-4xl font-bold md:text-5xl">{t('plans.title')}</h1>
        <p className="mt-2 max-w-xl text-mist">{t('plans.subtitle')}</p>
        {st.data && (
          <div className="mt-4 flex gap-3">
            <div className="rounded-2xl border border-line bg-surface px-4 py-3"><div className="text-[11px] text-mist">{t('plans.total')}</div><div className="font-mono text-2xl" data-testid="text-experiment-count">{st.data.experimentCount}</div></div>
            <div className="rounded-2xl border border-line bg-surface px-4 py-3"><div className="text-[11px] text-mist">{t('plans.completed')}</div><div className="font-mono text-2xl text-signal" data-testid="text-completed-count">{st.data.completedCount}</div></div>
          </div>
        )}
      </header>
      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[32px] border border-dashed border-line p-10 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-signal/10 text-signal"><FlaskConical className="size-6" /></span>
          <p className="max-w-sm text-mist">{t('plans.empty')}</p>
          <Link href="/discover" data-testid="link-find-idea" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-signal px-6 font-semibold text-ink">{t('plans.findIdea')}<ArrowRight className="size-4" /></Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((e) => {
            const o = om.get(e.opportunityId);
            return (
              <Link key={e.id} href={'/plans/' + e.id} data-testid={'card-experiment-' + e.id} className="rise flex gap-4 overflow-hidden rounded-[28px] border border-line card-sheen p-3 transition hover:border-intel/40">
                {o && <OppImage src={o.image} alt={o.imageAlt} className="w-24 shrink-0 rounded-2xl" />}
                <div className="min-w-0 flex-1 space-y-2 py-1 pr-1">
                  <div className="flex items-center justify-between gap-2"><StatusPill status={e.status} />{e.parentExperimentId && <span className="text-[10px] uppercase tracking-wider text-intel">follow-up</span>}</div>
                  <h3 className="font-display text-lg font-semibold leading-snug">{e.title}</h3>
                  <MiniStepper status={e.status} />
                  <div className="text-xs text-mist">{e.learning ? <span className="text-signal">{t(('outcome.' + e.learning.outcome) as TKey)}</span> : <>{t('plans.expected')} <span className="font-mono text-snow">{inr(e.expected.contributionAfterPromotion)}</span></>}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      {st.data && st.data.recentLearning.length > 0 && (
        <section>
          <SectionTitle title={t('home.recentLearning')} />
          <div className="space-y-3">{st.data.recentLearning.map((l) => (
            <div key={l.experimentId} className="rounded-3xl border border-line bg-surface p-4"><div className="text-[11px] uppercase tracking-[0.16em] text-intel">{t(('outcome.' + l.outcome) as TKey)}</div><p className="mt-1 text-sm">{l.whatWeLearned}</p></div>
          ))}</div>
        </section>
      )}
    </div>
  );
}

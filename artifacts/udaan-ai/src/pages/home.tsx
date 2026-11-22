import { Link } from 'wouter';
import { ArrowRight, MessageCircle, Sparkles, TrendingUp } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import {
  useGetUdaanState, getGetUdaanStateQueryKey, useGetExperiments, getGetExperimentsQueryKey,
} from '@workspace/api-client-react';
import { useOpportunities } from '@/hooks/use-opportunities';
import { useI18n, type TKey } from '@/lib/i18n';
import { OppImage } from '@/components/opp-image';
import { ListenButton } from '@/components/listen-button';
import { OpportunityCard } from '@/components/opportunity-card';
import { ErrorState, PageSkeleton, SectionTitle } from '@/components/states';
import { StatusPill } from '@/components/lifecycle';
import { inr, num } from '@/lib/format';

export default function HomePage() {
  const { t } = useI18n();
  const state = useGetUdaanState({ query: { queryKey: getGetUdaanStateQueryKey() } });
  const opps = useOpportunities();
  const exps = useGetExperiments({ query: { queryKey: getGetExperimentsQueryKey() } });

  if (state.isLoading || opps.isLoading) return <PageSkeleton />;
  if (state.isError || opps.isError || !state.data || !opps.data)
    return <ErrorState onRetry={() => { state.refetch(); opps.refetch(); }} />;

  const s = state.data;
  const list = opps.data;
  const nextId = s.recentLearning[0]?.nextOpportunityId;
  const featured = list.find((o) => o.id === nextId) ?? list.find((o) => o.actionable) ?? list[0];
  const story = list.find((o) => o.category === 'story');
  const tech = list.find((o) => o.category === 'technology');
  const other = list.find((o) => o.category === 'experiment' && o.id !== featured?.id);
  const secondary = [story, tech, other].filter(Boolean) as typeof list;
  const h = new Date().getHours();
  const greet = h < 12 ? 'home.morning' : h < 17 ? 'home.afternoon' : 'home.evening';
  const sales = s.sales.slice(-28).map((x) => ({ d: x.date.slice(5), revenue: x.revenue }));
  const active = exps.data?.find((e) => e.status === 'Running' || e.status === 'Approved' || e.status === 'Draft');

  return (
    <div className="space-y-10">
      <section className="rise">
        <p className="text-sm text-mist" data-testid="text-greeting">{t(greet as TKey)}, <span className="text-snow">{s.profile.ownerName}</span> · {s.profile.shopName}</p>
        <h1 className="mt-1 max-w-2xl font-display text-[1.85rem] font-bold leading-[1.08] md:text-5xl">{t('home.question')}</h1>
      </section>

      {featured && (
        <section className="rise lg:grid lg:grid-cols-[1.35fr_1fr] lg:gap-6" style={{ animationDelay: '80ms' }}>
          <article data-testid="card-featured" className="relative overflow-hidden rounded-[32px] border border-line card-sheen">
            <Link href={'/opportunity/' + featured.id} tabIndex={-1} aria-hidden className="relative block">
              <OppImage src={featured.image} alt={featured.imageAlt} className="aspect-[4/3.4] sm:aspect-[16/10]" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-signal/40 bg-ink/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-signal backdrop-blur">
                <Sparkles className="size-3.5" />{t('home.todayIdea')}
              </span>
            </Link>
            <div className="relative -mt-24 space-y-4 p-5 sm:p-6">
              <h2 className="font-display text-[2rem] font-extrabold leading-[1.02] sm:text-4xl" data-testid="text-featured-title">{featured.title}</h2>
              <p className="text-[15px] leading-relaxed text-snow/85">{featured.description}</p>
              <p className="border-l-2 border-intel pl-3 text-sm text-mist"><span className="text-intel">{t('common.whyFits')}. </span>{featured.whyItFits}</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-line bg-ink/50 p-3"><div className="text-[11px] text-mist">{t('common.budget')}</div><div className="font-mono text-xl text-snow">{inr(featured.budget)}</div></div>
                <div className="rounded-2xl border border-line bg-ink/50 p-3"><div className="text-[11px] text-mist">{t('common.benefit')}</div><div className="text-sm leading-snug text-signal">{featured.benefit}</div></div>
              </div>
              <div className="flex gap-2">
                <Link href={'/opportunity/' + featured.id} data-testid="button-explore-featured"
                  className="group inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-signal px-6 font-semibold text-ink transition active:scale-[.98]">
                  {t('home.exploreIdea')}<ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <ListenButton id="featured" text={featured.title + '. ' + featured.description + ' ' + featured.whyItFits} compact className="min-h-[52px] px-4" />
              </div>
            </div>
          </article>

          <div className="mt-6 space-y-4 lg:mt-0">
            <Link href="/ask" data-testid="link-ask-home" className="flex min-h-14 items-center gap-3 rounded-3xl border border-line bg-surface p-4 transition hover:border-intel/50">
              <span className="grid size-10 place-items-center rounded-2xl bg-intel/10 text-intel"><MessageCircle className="size-5" /></span>
              <span className="flex-1 text-sm text-mist">{t('home.askPrompt')}</span><ArrowRight className="size-4 text-mist" />
            </Link>
            {active && (
              <Link href={'/plans/' + active.id} data-testid="link-active-plan" className="block rounded-3xl border border-signal/30 bg-signal/[.04] p-4">
                <div className="flex items-center justify-between"><span className="text-[11px] uppercase tracking-[0.16em] text-signal">{t('home.activePlan')}</span><StatusPill status={active.status} /></div>
                <div className="mt-1 font-display text-lg font-semibold">{active.title}</div>
              </Link>
            )}
            <div className="rounded-3xl border border-line bg-surface p-4">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display font-semibold"><TrendingUp className="size-4 text-intel" />{t('home.pulse')}</h2>
                <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wider text-mist">{t('common.synthetic')}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <Stat k={t('home.revenue')} v={inr(s.baseline.revenue)} />
                <Stat k={t('home.orders')} v={num(s.baseline.orders)} />
                <Stat k={t('home.aov')} v={inr(s.baseline.averageOrderValue)} />
                <Stat k={t('home.contribution')} v={inr(s.baseline.contribution)} accent />
              </div>
              <div className="mt-1 text-[11px] text-mist">{t('home.weekly')}</div>
              {sales.length > 1 && (
                <div className="mt-3">
                  <div className="mb-1 text-[11px] text-mist">{t('home.salesChart')}</div>
                  <div className="h-24" data-testid="chart-sales">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sales} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                        <defs><linearGradient id="sg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#5CC6FF" stopOpacity={0.35} /><stop offset="1" stopColor="#5CC6FF" stopOpacity={0} /></linearGradient></defs>
                        <XAxis dataKey="d" hide />
                        <Tooltip cursor={{ stroke: '#202638' }} contentStyle={{ background: '#0A0D16', border: '1px solid #202638', borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [inr(v), t('home.revenue')]} />
                        <Area type="monotone" dataKey="revenue" stroke="#5CC6FF" strokeWidth={1.5} fill="url(#sg)" isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {secondary.length > 0 && (
        <section>
          <SectionTitle title={t('home.more')} action={<Link href="/discover" data-testid="link-discover-all" className="min-h-11 content-center text-sm text-intel">{t('nav.discover')}</Link>} />
          <div className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0">
            {secondary.map((o) => <OpportunityCard key={o.id} o={o} variant="mini" />)}
          </div>
        </section>
      )}

      <section>
        <SectionTitle title={t('home.recentLearning')} />
        {s.recentLearning.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line p-5 text-sm text-mist">{t('home.noLearning')}</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {s.recentLearning.slice(0, 2).map((l) => (
              <Link key={l.experimentId} href={'/plans/' + l.experimentId} data-testid={'card-learning-' + l.experimentId} className="block rounded-3xl border border-line bg-surface p-4 transition hover:border-intel/40">
                <div className="text-[11px] uppercase tracking-[0.16em] text-intel">{t(('outcome.' + l.outcome) as TKey)}</div>
                <p className="mt-1 text-sm text-snow">{l.whatWeLearned}</p>
                <p className="mt-2 text-sm text-signal">{l.nextAction}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return <div><div className="text-[11px] text-mist">{k}</div><div className={'font-mono ' + (accent ? 'text-signal' : 'text-snow')}>{v}</div></div>;
}

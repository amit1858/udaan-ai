import { useState } from 'react';
import { Link, useParams } from 'wouter';
import { ArrowLeft, ArrowUpRight, Lock, Check, Play, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, Legend } from 'recharts';
import {
  useGetExperiments, getGetExperimentsQueryKey, getGetUdaanStateQueryKey, useTransitionExperiment, useRecordResults,
  type Experiment, type TransitionInputStatus,
} from '@workspace/api-client-react';
import { useOpportunities } from '@/hooks/use-opportunities';
import { useI18n, type TKey } from '@/lib/i18n';
import { OppImage } from '@/components/opp-image';
import { FinanceBreakdown } from '@/components/finance-breakdown';
import { ListenButton } from '@/components/listen-button';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { StatusPill, Timeline } from '@/components/lifecycle';
import { ErrorState, PageSkeleton } from '@/components/states';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { inr, num, signed, pct, errMsg } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const { toast } = useToast();
  const qc = useQueryClient();
  const q = useGetExperiments({ query: { queryKey: getGetExperimentsQueryKey() } });
  const opps = useOpportunities();
  const tr = useTransitionExperiment();
  const [dlg, setDlg] = useState<TransitionInputStatus | null>(null);

  if (q.isLoading) return <PageSkeleton />;
  if (q.isError || !q.data) return <ErrorState onRetry={() => q.refetch()} />;
  const e = q.data.find((x) => x.id === id);
  if (!e) return <ErrorState message={t('plans.notFound')} />;
  const o = opps.data?.find((x) => x.id === e.opportunityId);
  const child = q.data.find((x) => x.parentExperimentId === e.id);

  const refresh = () => { qc.invalidateQueries({ queryKey: getGetExperimentsQueryKey() }); qc.invalidateQueries({ queryKey: getGetUdaanStateQueryKey() }); };
  const doTransition = (status: TransitionInputStatus) => tr.mutate({ id: e.id, data: { status, confirmed: true } }, {
    onSuccess: () => { refresh(); toast({ title: t('plan.updated') }); },
    onError: (err) => toast({ title: errMsg(err, t('error.generic')), variant: 'destructive' }),
  });
  const dlgCopy: Record<TransitionInputStatus, { title: TKey; body: string }> = {
    Approved: { title: 'plan.approve', body: t('plan.approveBody', { budget: inr(e.promotionBudget) }) },
    Running: { title: 'plan.start', body: t('plan.startBody') },
    Cancelled: { title: 'plan.cancel', body: t('plan.cancelBody') },
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/plans" data-testid="link-back-plans" className="inline-flex min-h-11 items-center gap-2 text-sm text-mist hover:text-snow"><ArrowLeft className="size-4" />{t('plans.title')}</Link>
      <header className="rise flex items-center gap-4">
        {o && <OppImage src={o.image} alt={o.imageAlt} className="size-20 shrink-0 rounded-3xl border border-line" />}
        <div className="min-w-0"><StatusPill status={e.status} /><h1 className="mt-1.5 font-display text-2xl font-bold leading-tight sm:text-3xl" data-testid="text-plan-title">{e.title}</h1>
          <div className="text-xs text-mist">{t('common.days', { n: e.durationDays })} · {t('common.budget')} <span className="font-mono text-snow">{inr(e.promotionBudget)}</span></div></div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {(e.status === 'Draft' || e.status === 'Approved') && (
            <div className="flex flex-wrap gap-2">
              {e.status === 'Draft' && <button data-testid="button-approve" disabled={tr.isPending} onClick={() => setDlg('Approved')} className="inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full bg-signal px-6 font-semibold text-ink disabled:opacity-50"><Check className="size-5" />{t('plan.approve')}</button>}
              {e.status === 'Approved' && <button data-testid="button-start" disabled={tr.isPending} onClick={() => setDlg('Running')} className="inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full bg-signal px-6 font-semibold text-ink disabled:opacity-50"><Play className="size-5" />{t('plan.start')}</button>}
              <button data-testid="button-cancel-plan" disabled={tr.isPending} onClick={() => setDlg('Cancelled')} className="inline-flex min-h-14 items-center gap-2 rounded-full border border-line px-5 text-mist hover:text-snow"><X className="size-4" />{t('plan.cancel')}</button>
            </div>
          )}
          {e.status === 'Running' && <ResultsForm e={e} onDone={refresh} onCancel={() => setDlg('Cancelled')} />}
          {e.status === 'Completed' && e.actual && <Outcome e={e} child={child?.id} />}
          <section className="rounded-[28px] border border-line card-sheen p-5">
            <h2 className="mb-4 font-display text-lg font-semibold">{t('plan.expectedTitle')}</h2>
            <FinanceBreakdown f={e.expected} />
          </section>
        </div>
        <aside className="h-fit rounded-[28px] border border-line bg-surface p-5">
          <h2 className="mb-4 text-[11px] uppercase tracking-[0.16em] text-mist">{t('plan.lifecycle')}</h2>
          <Timeline e={e} />
          {e.status === 'Completed' && <p className="mt-5 flex gap-2 text-xs text-mist"><Lock className="size-3.5 shrink-0" />{t('plan.immutable')}</p>}
        </aside>
      </div>
      {dlg && <ConfirmDialog open onOpenChange={(v) => !v && setDlg(null)} title={t(dlgCopy[dlg].title)} body={dlgCopy[dlg].body} tone={dlg === 'Cancelled' ? 'danger' : 'signal'} onConfirm={() => { doTransition(dlg); setDlg(null); }} />}
    </div>
  );
}

function ResultsForm({ e, onDone, onCancel }: { e: Experiment; onDone: () => void; onCancel: () => void }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const rec = useRecordResults();
  const [units, setUnits] = useState('');
  const [spend, setSpend] = useState('');
  const [feedback, setFeedback] = useState('');
  const [obs, setObs] = useState('');
  const [synthetic, setSynthetic] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const valid = units !== '' && spend !== '' && Number(units) >= 0 && Number(spend) >= 0;
  const sample = (n: number) => { setUnits(String(n)); setSpend('1500'); setSynthetic(true); setConfirmed(false); setFeedback(t(n < 100 ? 'results.sampleFeedbackLow' : 'results.sampleFeedbackHigh')); };
  const save = () => rec.mutate({ id: e.id, data: { actualUnits: Math.round(Number(units)), actualPromotionSpend: Number(spend), feedback, observations: obs || undefined, confirmed: true, synthetic } }, {
    onSuccess: () => { onDone(); toast({ title: t('results.saved') }); },
    onError: (err) => toast({ title: errMsg(err, t('error.generic')), variant: 'destructive' }),
  });
  const inputCls = 'mt-1 min-h-12 w-full rounded-2xl border border-line bg-ink/50 px-4 font-mono text-lg text-snow focus:border-intel/60 focus:outline-none';
  return (
    <section className="space-y-4 rounded-[28px] border border-signal/30 bg-signal/[.03] p-5" data-testid="form-results">
      <h2 className="font-display text-2xl font-bold">{t('results.title')}</h2>
      <div>
        <div className="mb-2 text-[11px] uppercase tracking-[0.16em] text-mist">{t('results.sample')}</div>
        <div className="grid grid-cols-2 gap-2">
          <button data-testid="button-sample-low" onClick={() => sample(70)} className="min-h-12 rounded-2xl border border-line bg-surface px-3 text-sm hover:border-intel/50">{t('results.sampleLow')}</button>
          <button data-testid="button-sample-high" onClick={() => sample(130)} className="min-h-12 rounded-2xl border border-line bg-surface px-3 text-sm hover:border-intel/50">{t('results.sampleHigh')}</button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-mist">{t('results.units')}<input data-testid="input-actual-units" inputMode="numeric" value={units} onChange={(x) => setUnits(x.target.value.replace(/\D/g, ''))} className={inputCls} /><span className="text-xs">/ {num(e.expectedUnits)}</span></label>
        <label className="block text-sm text-mist">{t('results.spend')}<input data-testid="input-actual-spend" inputMode="numeric" value={spend} onChange={(x) => setSpend(x.target.value.replace(/\D/g, ''))} className={inputCls} /></label>
      </div>
      <label className="block text-sm text-mist">{t('results.feedback')}<textarea data-testid="input-feedback" maxLength={2000} value={feedback} onChange={(x) => setFeedback(x.target.value)} rows={2} className="mt-1 w-full rounded-2xl border border-line bg-ink/50 p-3 text-[15px] text-snow focus:border-intel/60 focus:outline-none" /></label>
      <label className="block text-sm text-mist">{t('results.observations')}<textarea data-testid="input-observations" maxLength={2000} value={obs} onChange={(x) => setObs(x.target.value)} rows={2} className="mt-1 w-full rounded-2xl border border-line bg-ink/50 p-3 text-[15px] text-snow focus:border-intel/60 focus:outline-none" /></label>
      <label className="flex min-h-11 items-center justify-between gap-3 text-sm"><span>{t('results.syntheticLabel')}</span><Switch data-testid="switch-synthetic" checked={synthetic} onCheckedChange={setSynthetic} /></label>
      <label className="flex items-start gap-3 rounded-2xl border border-line p-3 text-sm"><Checkbox data-testid="checkbox-confirm" checked={confirmed} onCheckedChange={(v) => setConfirmed(v === true)} className="mt-0.5 size-5" /><span>{t('results.confirm')}</span></label>
      <div className="flex gap-2">
        <button data-testid="button-save-results" disabled={!valid || !confirmed || rec.isPending} onClick={save} className="min-h-14 flex-1 rounded-full bg-signal font-semibold text-ink disabled:opacity-40">{rec.isPending ? t('common.loading') : t('results.save')}</button>
        <button data-testid="button-cancel-running" onClick={onCancel} className="min-h-14 rounded-full border border-line px-5 text-mist">{t('common.cancel')}</button>
      </div>
    </section>
  );
}

function Outcome({ e, child }: { e: Experiment; child?: string }) {
  const { t } = useI18n();
  const opps = useOpportunities();
  const l = e.learning;
  const a = e.actual!;
  const data = [
    { k: t('learn.units'), expected: e.expected.units, actual: a.units },
  ];
  const money = [
    { k: t('fin.revenue'), expected: e.expected.revenue, actual: a.revenue },
    { k: t('home.contribution'), expected: e.expected.contributionAfterPromotion, actual: a.contributionAfterPromotion },
  ];
  const next = l ? opps.data?.find((o) => o.id === l.nextOpportunityId) : undefined;
  const p = l ? pct(l.achievement) : 0;
  return (
    <section className="space-y-4" data-testid="section-outcome">
      <div className="rounded-[28px] border border-line card-sheen p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-2xl font-bold">{t('learn.compare')}</h2>
          {e.synthetic && <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wider text-mist">{t('common.synthetic')}</span>}
        </div>
        {l && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-line p-3"><div className="text-[11px] text-mist">{t('learn.target')}</div><div className={cn('font-mono text-2xl', p >= 100 ? 'text-signal' : 'text-snow')} data-testid="text-achievement">{p}%</div></div>
            <div className="rounded-2xl border border-line p-3"><div className="text-[11px] text-mist">{t('learn.unitVar')}</div><div className="font-mono text-lg">{signed(l.unitVariance)}</div></div>
            <div className="rounded-2xl border border-line p-3"><div className="text-[11px] text-mist">{t('learn.contribVar')}</div><div className={cn('font-mono text-lg', l.contributionVariance >= 0 ? 'text-signal' : 'text-[#ff7a6b]')}>{signed(l.contributionVariance, true)}</div></div>
          </div>
        )}
        <div className="mt-4 h-52" data-testid="chart-expected-actual">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={money} margin={{ top: 8, right: 4, left: 4, bottom: 0 }} barGap={6}>
              <XAxis dataKey="k" tick={{ fill: '#8C93A6', fontSize: 12 }} axisLine={{ stroke: '#202638' }} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,.03)' }} contentStyle={{ background: '#0A0D16', border: '1px solid #202638', borderRadius: 12, fontSize: 12 }} formatter={(v: number) => inr(v)} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#8C93A6' }} />
              <Bar dataKey="expected" name={t('learn.expected')} fill="#5CC6FF" radius={[8, 8, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="actual" name={t('learn.actual')} fill="#BDF52F" radius={[8, 8, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-sm text-mist">{data[0].k}: <span className="font-mono text-intel">{num(data[0].expected)}</span> → <span className="font-mono text-signal">{num(data[0].actual)}</span></div>
      </div>

      {l && (
        <div className="space-y-3 rounded-[28px] border border-intel/25 bg-intel/[.04] p-5" data-testid="section-learning">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-2xl font-bold">{t('learn.title')}</h2>
            <span className="rounded-full border border-intel/40 px-2.5 py-1 text-[11px] uppercase tracking-wider text-intel">{t(('outcome.' + l.outcome) as TKey)}</span>
          </div>
          <div><div className="text-[11px] uppercase tracking-[0.16em] text-mist">{t('learn.happened')}</div><p className="mt-1 text-[15px]">{l.whatHappened}</p></div>
          <div><div className="text-[11px] uppercase tracking-[0.16em] text-mist">{t('learn.learned')}</div><p className="mt-1 text-[15px]">{l.whatWeLearned}</p></div>
          <ListenButton id={'learn-' + e.id} text={[l.whatHappened, l.whatWeLearned, l.nextAction].join(' ')} />
        </div>
      )}

      {l && (
        <div className="overflow-hidden rounded-[28px] border border-signal/40 bg-surface" data-testid="card-next-recommendation">
          {next && <OppImage src={next.image} alt={next.imageAlt} className="aspect-[21/9]" />}
          <div className="space-y-3 p-5">
            <div className="text-[11px] uppercase tracking-[0.16em] text-signal">{t('learn.next')}</div>
            {next && <h3 className="font-display text-2xl font-bold">{next.title}</h3>}
            <p className="text-[15px] text-snow/90">{l.nextAction}</p>
            {child ? (
              <Link href={'/plans/' + child} data-testid="link-follow-up-plan" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-signal/50 px-5 text-signal">{t('learn.openFollowUp')}<ArrowUpRight className="size-4" /></Link>
            ) : (
              <Link href={'/opportunity/' + l.nextOpportunityId + '?parent=' + e.id + '&budget=' + l.nextBudget} data-testid="link-explore-next"
                className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-signal px-5 font-semibold text-ink">{t('learn.exploreNext', { budget: inr(l.nextBudget) })}<ArrowUpRight className="size-4" /></Link>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

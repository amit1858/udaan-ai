import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams, useSearch } from 'wouter';
import { ArrowLeft, CalendarDays, Footprints, MessageCircle, Plus, Minus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useEvaluateFinance, useCreateExperiment, getGetExperimentsQueryKey, getGetUdaanStateQueryKey,
  type Financials, type FinanceInput,
} from '@workspace/api-client-react';
import { useOpportunities } from '@/hooks/use-opportunities';
import { useI18n, type TKey } from '@/lib/i18n';
import { OppImage } from '@/components/opp-image';
import { ListenButton } from '@/components/listen-button';
import { FinanceBreakdown } from '@/components/finance-breakdown';
import { catTone } from '@/components/opportunity-card';
import { ErrorState, PageSkeleton } from '@/components/states';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { inr, num, errMsg } from '@/lib/format';
import { cn } from '@/lib/utils';

type Inputs = { sellingPrice: string; makingCost: string; promotionBudget: string; expectedUnits: string };

export default function OpportunityPage() {
  const { id } = useParams<{ id: string }>();
  const search = new URLSearchParams(useSearch());
  const parent = search.get('parent') ?? undefined;
  const nextBudget = search.get('budget');
  const { t } = useI18n();
  const { toast } = useToast();
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const q = useOpportunities();
  const o = q.data?.find((x) => x.id === id);

  const [inp, setInp] = useState<Inputs | null>(null);
  const [fin, setFin] = useState<Financials | null>(null);
  const [finKey, setFinKey] = useState('');
  const [finErr, setFinErr] = useState<string | null>(null);
  const evalM = useEvaluateFinance();
  const evalRef = useRef(evalM.mutate); evalRef.current = evalM.mutate;
  const create = useCreateExperiment();
  const initFor = useRef<string | null>(null);

  useEffect(() => {
    if (o && initFor.current !== o.id) {
      initFor.current = o.id;
      setInp({ sellingPrice: String(o.sellingPrice), makingCost: String(o.makingCost), promotionBudget: String(nextBudget ?? o.promotionBudget), expectedUnits: String(o.expectedUnits) });
    }
  }, [o, nextBudget]);

  const parsed: FinanceInput | null = inp ? {
    sellingPrice: Number(inp.sellingPrice), makingCost: Number(inp.makingCost), promotionBudget: Number(inp.promotionBudget), expectedUnits: Number(inp.expectedUnits),
  } : null;
  const valid = !!parsed && Object.values(parsed).every((v) => Number.isFinite(v) && v >= 0) && Number.isInteger(parsed.expectedUnits) && parsed.expectedUnits >= 1 && inp!.sellingPrice !== '' && inp!.makingCost !== '' && inp!.promotionBudget !== '';
  const key = parsed ? JSON.stringify(parsed) : '';

  useEffect(() => {
    if (!key || !valid || !o?.actionable) return;
    const tm = setTimeout(() => {
      setFin(null);
      evalRef.current({ data: JSON.parse(key) as FinanceInput }, { onSuccess: (r) => { setFin(r); setFinKey(key); setFinErr(null); }, onError: (e) => { setFin(null); setFinKey(''); setFinErr(errMsg(e, t('error.generic'))); } });
    }, 350);
    return () => clearTimeout(tm);
  }, [key, valid, o?.actionable, t]);

  if (q.isLoading) return <PageSkeleton />;
  if (q.isError) return <ErrorState onRetry={() => q.refetch()} />;
  if (!o) return <ErrorState message={t('opp.notFound')} />;

  const createDraft = () => {
    if (!parsed || !valid || finKey !== key) return;
    create.mutate({ data: { ...parsed, opportunityId: o.id, durationDays: 7, ...(parent ? { parentExperimentId: parent } : {}) } }, {
      onSuccess: (e) => {
        qc.invalidateQueries({ queryKey: getGetExperimentsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetUdaanStateQueryKey() });
        toast({ title: t('opp.draftCreated') });
        nav('/plans/' + e.id);
      },
      onError: (e) => toast({ title: errMsg(e, t('error.generic')), variant: 'destructive' }),
    });
  };

  const field = (k: keyof Inputs, label: TKey, step: number, prefix?: string) => (
    <label className="block rounded-2xl border border-line bg-ink/40 p-3">
      <span className="text-xs text-mist">{t(label)}</span>
      <div className="mt-1 flex items-center gap-1">
        <button type="button" aria-label={'-' + step} data-testid={'button-dec-' + k} onClick={() => setInp((p) => p && { ...p, [k]: String(Math.max(0, Number(p[k] || 0) - step)) })} className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-mist active:scale-90"><Minus className="size-4" /></button>
        <div className="flex min-w-0 flex-1 items-center justify-center font-mono text-xl text-snow">
          {prefix && <span className="text-mist">{prefix}</span>}
          <input data-testid={'input-' + k} inputMode="numeric" value={inp?.[k] ?? ''} onChange={(e) => setInp((p) => p && { ...p, [k]: e.target.value.replace(/[^0-9.]/g, '') })}
            className="w-full min-w-0 bg-transparent text-center focus:outline-none" aria-label={t(label)} />
        </div>
        <button type="button" aria-label={'+' + step} data-testid={'button-inc-' + k} onClick={() => setInp((p) => p && { ...p, [k]: String(Number(p[k] || 0) + step) })} className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-mist active:scale-90"><Plus className="size-4" /></button>
      </div>
    </label>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/discover" data-testid="link-back" className="inline-flex min-h-11 items-center gap-2 text-sm text-mist hover:text-snow"><ArrowLeft className="size-4" />{t('nav.discover')}</Link>
      <div className="lg:grid lg:grid-cols-[1.1fr_1fr] lg:gap-8">
        <section className="rise space-y-5">
          <div className="relative overflow-hidden rounded-[32px] border border-line">
            <OppImage src={o.image} alt={o.imageAlt} className="aspect-[4/3]" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <div className={cn('text-[11px] font-semibold uppercase tracking-[0.16em]', catTone[o.category])}>{t(('cat.' + o.category) as TKey)}</div>
              <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight sm:text-4xl" data-testid="text-opportunity-title">{o.title}</h1>
            </div>
          </div>
          {parent && <div className="rounded-2xl border border-signal/30 bg-signal/5 px-4 py-2.5 text-sm text-signal">{t('opp.followUpOf')}</div>}
          <p className="text-[16px] leading-relaxed text-snow/90">{o.description}</p>
          {o.actionable && <a href="#evaluate" className="inline-flex min-h-12 items-center justify-center rounded-full bg-signal px-5 text-sm font-semibold text-ink">{t('opp.evaluate')}</a>}
          <div className="flex flex-wrap gap-2"><ListenButton id={'detail-' + o.id} text={[o.title, o.description, o.whyItFits, o.story, o.firstStep].filter(Boolean).join('. ')} /></div>
          <Block title={t('common.whyFits')} accent>{o.whyItFits}</Block>
          {o.story && <Block title={t('opp.story')} note={o.category === 'story' ? t('cat.illustrative') : undefined}>{o.story}</Block>}
          {o.firstStep && <Block title={t('common.firstStep')} icon={<Footprints className="size-4 text-signal" />}>{o.firstStep}</Block>}
          <div className="rounded-3xl border border-line bg-surface p-5">
            <div className="text-[11px] uppercase tracking-[0.16em] text-mist">{t('common.assumptions')}</div>
            <ul className="mt-2 space-y-2">{o.assumptions.map((x) => <li key={x} className="flex gap-2.5 text-sm text-snow/85"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-intel" />{x}</li>)}</ul>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4">
              <div><div className="text-[11px] text-mist">{t('common.budget')}</div><div className="font-mono text-lg">{inr(o.budget)}</div></div>
              <div><div className="text-[11px] text-mist">{t('common.benefit')}</div><div className="text-sm text-signal">{o.benefit}</div></div>
            </div>
          </div>
        </section>

        <section id="evaluate" className="mt-8 scroll-mt-24 lg:mt-0">
          {o.actionable ? (
            <div className="space-y-4 rounded-[32px] border border-line card-sheen p-5 lg:sticky lg:top-24">
              <div>
                <h2 className="font-display text-2xl font-bold">{t('opp.evaluate')}</h2>
                <p className="mt-1 text-sm text-mist">{t('opp.evaluateNote')}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {field('sellingPrice', 'opp.sellingPrice', 5, '₹')}
                {field('makingCost', 'opp.makingCost', 5, '₹')}
                {field('promotionBudget', 'opp.promotion', 250, '₹')}
                {field('expectedUnits', 'opp.units', 10)}
              </div>
              <div className="flex items-center gap-2 text-sm text-mist"><CalendarDays className="size-4 text-intel" />{t('opp.duration')}: <span className="text-snow">{t('common.days', { n: 7 })}</span></div>
              {!valid && <p className="text-sm text-[#ff7a6b]" role="alert">{t('opp.invalid')}</p>}
              {finErr && <ErrorState message={finErr} />}
              {fin ? (<>
                <FinanceBreakdown f={fin} pending={evalM.isPending} />
                <div className="rounded-2xl border border-intel/25 bg-intel/[.05] p-4">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-intel">{t('fin.forecast')}</div>
                  <p className="mt-1 text-sm text-snow" data-testid="text-forecast">{t('fin.forecastLine', { units: num(fin.units), amount: inr(fin.contributionAfterPromotion), be: fin.breakEvenUnits === null ? t('fin.noBreakEven') : num(fin.breakEvenUnits) })}</p>
                  {fin.breakEvenUnits !== null && fin.units > 0 && (
                    <div className="relative mt-3 h-2 rounded-full bg-line" aria-hidden>
                      <div className="absolute inset-y-0 left-0 rounded-full bg-signal" style={{ width: Math.min(100, (fin.units / Math.max(fin.units, fin.breakEvenUnits) ) * 100) + '%' }} />
                      <div className="absolute -top-1 h-4 w-0.5 bg-snow" style={{ left: Math.min(100, (fin.breakEvenUnits / Math.max(fin.units, fin.breakEvenUnits)) * 100) + '%' }} />
                    </div>
                  )}
                </div>
              </>) : valid && <Skeleton className="h-64 w-full rounded-2xl bg-raised" />}
              <button data-testid="button-create-draft" disabled={!valid || !fin || finKey !== key || create.isPending} onClick={createDraft}
                className="flex min-h-14 w-full items-center justify-center rounded-full bg-signal font-semibold text-ink transition active:scale-[.98] disabled:opacity-50">
                {create.isPending ? t('common.loading') : t('opp.createDraft')}
              </button>
            </div>
          ) : (
            <Link href={'/ask?q=' + encodeURIComponent(t('opp.askTemplate', { title: o.title }))} data-testid="button-ask-about"
              className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-intel font-semibold text-ink">
              <MessageCircle className="size-5" />{t('opp.askAbout')}
            </Link>
          )}
        </section>
      </div>
    </div>
  );
}

function Block({ title, children, accent, icon, note }: { title: string; children: React.ReactNode; accent?: boolean; icon?: React.ReactNode; note?: string }) {
  return (
    <div className={cn('rounded-3xl border p-5', accent ? 'border-intel/25 bg-intel/[.04]' : 'border-line bg-surface')}>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-intel">{icon}{title}</div>
      {note && <div className="mt-1 text-[11px] text-mist">{note}</div>}
      <p className="mt-2 text-[15px] leading-relaxed text-snow/90">{children}</p>
    </div>
  );
}

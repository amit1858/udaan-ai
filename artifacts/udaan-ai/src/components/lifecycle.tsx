import type { Experiment } from '@workspace/api-client-react';
import { format } from 'date-fns';
import { useI18n, type TKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const STEPS = ['Draft', 'Approved', 'Running', 'Completed'] as const;

export function StatusPill({ status }: { status: string }) {
  const { t } = useI18n();
  const tone: Record<string, string> = {
    Draft: 'border-line text-mist', Approved: 'border-intel/40 text-intel', Running: 'border-signal/50 text-signal bg-signal/[.06]',
    Completed: 'border-snow/30 text-snow', Cancelled: 'border-[#ff7a6b]/40 text-[#ff7a6b]',
  };
  return <span data-testid="status-experiment" className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider', tone[status])}>
    {status === 'Running' && <span className="size-1.5 animate-pulse rounded-full bg-signal" />}{t(('status.' + status) as TKey)}</span>;
}

export function MiniStepper({ status }: { status: string }) {
  const idx = STEPS.indexOf(status as (typeof STEPS)[number]);
  return (
    <div className="flex items-center gap-1" aria-hidden>
      {STEPS.map((s, i) => (<span key={s} className={cn('h-1 flex-1 rounded-full', status === 'Cancelled' ? 'bg-line' : i <= idx ? (i === 3 ? 'bg-snow' : 'bg-signal') : 'bg-line')} />))}
    </div>
  );
}

export function Timeline({ e }: { e: Experiment }) {
  const { t } = useI18n();
  const at = (s: string) => e.timeline.find((x) => x.status === s)?.at;
  const steps: string[] = e.status === 'Cancelled' ? [...e.timeline.map((x) => x.status)] : [...STEPS];
  return (
    <ol className="relative space-y-0" data-testid="timeline-experiment">
      {steps.map((s, i) => {
        const time = at(s);
        const done = !!time;
        const current = s === e.status;
        return (
          <li key={s + i} className="relative flex gap-4 pb-5 last:pb-0">
            {i < steps.length - 1 && <span className={cn('absolute left-[11px] top-6 h-[calc(100%-12px)] w-px', done && at(steps[i + 1]) ? 'bg-signal/60' : 'bg-line')} />}
            <span className={cn('relative z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border',
              current ? 'border-signal bg-signal/15' : done ? 'border-signal/60 bg-surface' : 'border-line bg-surface')}>
              <span className={cn('size-2 rounded-full', done ? 'bg-signal' : 'bg-line', s === 'Cancelled' && 'bg-[#ff7a6b]')} />
            </span>
            <div>
              <div className={cn('text-sm font-medium', done ? 'text-snow' : 'text-mist')}>{t(('status.' + s) as TKey)}</div>
              <div className="font-mono text-xs text-mist">{time ? format(new Date(time), 'd MMM, h:mm a') : '—'}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

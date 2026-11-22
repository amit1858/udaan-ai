import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/lib/i18n';

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useI18n();
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-3xl border border-[#ff7a6b]/30 bg-[#ff7a6b]/5 p-5">
      <AlertTriangle className="size-5 text-[#ff7a6b]" />
      <p className="text-sm text-snow">{message ?? t('error.load')}</p>
      {onRetry && (
        <button data-testid="button-retry" onClick={onRetry} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm hover:border-intel/50">
          <RefreshCw className="size-4" />{t('common.retry')}
        </button>
      )}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-6 w-40 bg-raised" />
      <Skeleton className="aspect-[4/3] w-full rounded-3xl bg-raised" />
      <Skeleton className="h-4 w-3/4 bg-raised" />
      <Skeleton className="h-4 w-1/2 bg-raised" />
      <div className="grid grid-cols-2 gap-3"><Skeleton className="h-28 rounded-2xl bg-raised" /><Skeleton className="h-28 rounded-2xl bg-raised" /></div>
    </div>
  );
}

export function SectionTitle({ kicker, title, action }: { kicker?: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        {kicker && <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-intel">{kicker}</div>}
        <h2 className="font-display text-xl font-semibold text-snow">{title}</h2>
      </div>
      {action}
    </div>
  );
}

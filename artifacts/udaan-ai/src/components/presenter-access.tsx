import { useState } from 'react';
import { LockKeyhole, Unlock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetLiveAccess, getGetLiveAccessQueryKey, useUnlockLiveAccess, useLockLiveAccess,
  getGetProvidersQueryKey, getGetUdaanStateQueryKey,
} from '@workspace/api-client-react';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { errMsg } from '@/lib/format';

export function PresenterAccess() {
  const [password, setPassword] = useState('');
  const qc = useQueryClient();
  const { setPrefs } = useI18n();
  const { toast } = useToast();
  const status = useGetLiveAccess({ query: { queryKey: getGetLiveAccessQueryKey(), staleTime: 10000 } });
  const unlock = useUnlockLiveAccess();
  const lock = useLockLiveAccess();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: getGetLiveAccessQueryKey() });
    qc.invalidateQueries({ queryKey: getGetProvidersQueryKey() });
    qc.invalidateQueries({ queryKey: getGetUdaanStateQueryKey() });
  };
  const access = status.data;
  return (
    <section data-testid="presenter-access" className="rounded-3xl border border-line bg-surface p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        <LockKeyhole className="size-5 text-intel" /> Controlled live demonstration
      </h2>
      <p className="mt-2 text-sm text-mist" role="status">
        {status.isLoading ? 'Checking live access…' : access?.message || 'Unable to check live access. Written Demo Mode is still available.'}
      </p>
      {status.isError && <button type="button" onClick={() => status.refetch()} className="mt-2 min-h-11 text-sm text-intel">Retry access check</button>}
      {access?.requiresUnlock && !access.unlocked && access.configured && (
        <form className="mt-4 space-y-3" onSubmit={(event) => {
          event.preventDefault();
          unlock.mutate({ data: { password } }, {
            onSuccess: (result) => {
              setPassword('');
              qc.setQueryData(getGetLiveAccessQueryKey(), result);
              if (result.enabled) setPrefs({ provider: 'openai' });
              refresh();
              toast({ title: result.enabled ? 'Presenter unlocked — OpenAI selected' : 'Unlocked; paid traffic remains disabled' });
            },
            onError: (error) => { setPassword(''); toast({ title: errMsg(error, 'Unable to unlock'), variant: 'destructive' }); },
          });
        }}>
          <label htmlFor="presenter-password" className="block text-sm">Presenter password</label>
          <input id="presenter-password" data-testid="presenter-password" type="password" value={password}
            onChange={(event) => setPassword(event.target.value)} maxLength={256} autoComplete="current-password"
            className="min-h-12 w-full rounded-xl border border-line bg-ink px-4 text-base"
            required disabled={unlock.isPending} />
          <p className="text-xs text-mist">Use your presenter password, or the existing internal Lab password if a separate presenter password has not been configured. Never enter an API key.</p>
          <button type="submit" data-testid="button-unlock-presenter" disabled={unlock.isPending || !password}
            className="flex min-h-11 items-center gap-2 rounded-full bg-snow px-4 text-sm font-semibold text-ink disabled:opacity-40">
            <Unlock className="size-4" />{unlock.isPending ? 'Unlocking…' : access.enabled ? 'Unlock and use OpenAI' : 'Unlock presenter'}
          </button>
        </form>
      )}
      {access?.requiresUnlock && access.unlocked && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-signal">Combined daily calls remaining: {access.dailyRemaining}/{access.dailyLimit}. This session: {access.sessionRemaining}/{access.sessionLimit}.</p>
          {access.expiresAt && <p className="text-xs text-mist">The approved live window closes at {new Date(access.expiresAt).toLocaleString()}. It never renews automatically.</p>}
          <button type="button" data-testid="button-lock-presenter" disabled={lock.isPending}
            onClick={() => lock.mutate(undefined, {
              onSuccess: (result) => { qc.setQueryData(getGetLiveAccessQueryKey(), result); refresh(); },
              onError: (error) => toast({ title: errMsg(error, 'Unable to lock'), variant: 'destructive' }),
            })}
            className="min-h-11 rounded-full border border-line px-4 text-sm">Lock and return to Demo</button>
        </div>
      )}
      <p className="mt-3 text-xs text-mist">OpenAI is primary. Anthropic is an explicitly selected alternative; neither paid provider is automatically retried. Demo Mode remains available. Unlocking does not unlock the Sarvam Lab or enable speech spending.</p>
    </section>
  );
}

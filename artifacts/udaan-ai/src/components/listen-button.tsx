import { Square, Volume2, RotateCcw } from 'lucide-react';
import { useI18n, speechLang } from '@/lib/i18n';
import { speak, stopSpeech, useSpeaking, speechSupported, hasPlayed } from '@/lib/speech';
import { cn } from '@/lib/utils';

export function ListenButton({ id, text, className, compact }: { id: string; text: string; className?: string; compact?: boolean }) {
  const { t, lang } = useI18n();
  const speaking = useSpeaking();
  if (!speechSupported || !text) return null;
  const on = speaking === id;
  const label = on ? t('common.stop') : hasPlayed(id) ? t('common.replay') : t('common.listen');
  return (
    <button
      type="button"
      data-testid={'button-listen-' + id}
      aria-label={label}
      aria-pressed={on}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (on) stopSpeech(); else speak(id, text, speechLang(lang)); }}
      className={cn('inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all active:scale-95',
        on ? 'border-intel/60 bg-intel/10 text-intel' : 'border-line bg-ink/60 text-snow hover:border-intel/40', compact && 'px-3', className)}
    >
      {on ? (<><span className="eq flex items-end gap-[2px]" aria-hidden><span /><span /><span /></span><Square className="size-3.5 fill-current" /></>)
        : hasPlayed(id) ? <RotateCcw className="size-4" /> : <Volume2 className="size-4" />}
      {!compact && <span>{label}</span>}
    </button>
  );
}

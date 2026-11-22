import type { ReactNode } from 'react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useI18n } from '@/lib/i18n';

export function ConfirmDialog({ open, onOpenChange, title, body, onConfirm, tone = 'signal' }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; body: ReactNode; onConfirm: () => void; tone?: 'signal' | 'danger';
}) {
  const { t } = useI18n();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-3xl border-line bg-surface">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-xl">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-mist">{body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel data-testid="button-dialog-cancel" className="min-h-11 rounded-full border-line bg-transparent">{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction data-testid="button-dialog-confirm" onClick={onConfirm}
            className={tone === 'danger' ? 'min-h-11 rounded-full bg-[#ff7a6b] text-ink hover:bg-[#ff7a6b]/90' : 'min-h-11 rounded-full bg-signal text-ink hover:bg-signal/90'}>
            {t('common.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

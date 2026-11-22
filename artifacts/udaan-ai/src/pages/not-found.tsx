import { Link } from 'wouter';
import { useI18n } from '@/lib/i18n';
import { SunriseArt } from '@/components/udaan-mark';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-10 text-center">
      <SunriseArt className="w-full" />
      <h1 className="mt-4 font-display text-3xl font-bold">{t('notFound.title')}</h1>
      <Link href="/" data-testid="link-home" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-signal px-6 font-semibold text-ink">{t('notFound.home')}</Link>
    </div>
  );
}

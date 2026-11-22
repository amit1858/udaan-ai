import type { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Compass, Home, MessageCircle, ListChecks, Settings, Store, Check, Languages } from 'lucide-react';
import { useGetUdaanState, getGetUdaanStateQueryKey } from '@workspace/api-client-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n, LANGS } from '@/lib/i18n';
import { UdaanMark } from '@/components/udaan-mark';
import { cn } from '@/lib/utils';

export function LanguageMenu() {
  const { lang, setLang, t } = useI18n();
  const cur = LANGS.find((l) => l.id === lang)!;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger data-testid="button-language-menu" aria-label={t('nav.language')}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface/80 px-3 text-sm text-snow transition hover:border-intel/40">
        <Languages className="size-4 text-intel" /><span>{cur.label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl border-line bg-surface p-1.5">
        {LANGS.map((l) => (
          <DropdownMenuItem key={l.id} data-testid={'option-language-' + l.id} onSelect={() => setLang(l.id)} className="min-h-11 rounded-xl">
            <span className="grid size-8 place-items-center rounded-lg border border-line font-display text-intel">{l.glyph}</span>
            <span className="flex-1"><span className="block text-snow">{l.label}</span><span className="block text-xs text-mist">{l.sub}</span></span>
            {l.id === lang && <Check className="size-4 text-signal" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const NAV = [
  { href: '/', key: 'nav.home', icon: Home },
  { href: '/discover', key: 'nav.discover', icon: Compass },
  { href: '/ask', key: 'nav.ask', icon: MessageCircle },
  { href: '/plans', key: 'nav.plans', icon: ListChecks },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [loc] = useLocation();
  const { data } = useGetUdaanState({ query: { queryKey: getGetUdaanStateQueryKey() } });
  const live = data && data.preferences.provider !== 'demo';
  const active = (h: string) => (h === '/' ? loc === '/' : loc.startsWith(h) || (h === '/discover' && loc.startsWith('/opportunity')));
  const hideNavOnAsk = loc.startsWith('/ask');

  return (
    <div className="min-h-[100dvh]">
      <header className="glass pt-safe sticky top-0 z-40 border-b border-line/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
          <Link href="/" data-testid="link-brand" className="flex min-h-11 items-center gap-2.5">
            <UdaanMark />
            <span className="font-display text-lg font-bold tracking-tight">Udaan<span className="text-intel"> AI</span></span>
          </Link>
          <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} data-testid={'link-top-' + n.key}
                className={cn('rounded-full px-4 py-2 text-sm transition', active(n.href) ? 'bg-raised text-snow' : 'text-mist hover:text-snow')}>
                {t(n.key)}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            {data && (
              <Link href="/settings" data-testid="status-provider"
                className={cn('hidden min-h-8 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-medium uppercase tracking-wider sm:inline-flex',
                  live ? 'border-signal/40 text-signal' : 'border-line text-mist')}>
                <span className={cn('size-1.5 rounded-full', live ? 'bg-signal' : 'bg-mist')} />
                {live ? t('provider.live') : t('provider.demo')}
              </Link>
            )}
            <LanguageMenu />
            <Link href="/shop" aria-label={t('nav.shop')} data-testid="link-shop" className="grid size-11 place-items-center rounded-full text-mist hover:text-snow"><Store className="size-5" /></Link>
            <Link href="/settings" aria-label={t('nav.settings')} data-testid="link-settings" className="grid size-11 place-items-center rounded-full text-mist hover:text-snow"><Settings className="size-5" /></Link>
          </div>
        </div>
      </header>

      <main className={cn('mx-auto w-full max-w-6xl px-4 pt-5', hideNavOnAsk ? 'pb-4' : 'pb-32 md:pb-16')}>{children}</main>

      <nav aria-label="Primary mobile" className={cn('pb-safe fixed inset-x-0 bottom-0 z-40 md:hidden', hideNavOnAsk && 'hidden')}>
        <div className="glass mx-3 mb-3 grid grid-cols-4 rounded-[26px] border border-line p-1.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,.9)]">
          {NAV.map((n) => {
            const on = active(n.href);
            const Icon = n.icon;
            return (
              <Link key={n.href} href={n.href} data-testid={'link-nav-' + n.href.replace('/', '') || 'home'} aria-current={on ? 'page' : undefined}
                className={cn('flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-[20px] text-[11px] font-medium transition-all active:scale-95',
                  on ? 'bg-raised text-snow' : 'text-mist')}>
                <Icon className={cn('size-5', on && (n.href === '/ask' ? 'text-intel' : 'text-signal'))} />
                <span className="max-w-full truncate px-1">{t(n.key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

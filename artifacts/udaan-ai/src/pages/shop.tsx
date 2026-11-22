import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetUdaanState, getGetUdaanStateQueryKey, useUpdateProfile, type Profile, type BusinessState } from '@workspace/api-client-react';
import { useI18n, type TKey } from '@/lib/i18n';
import { ErrorState, PageSkeleton } from '@/components/states';
import { useToast } from '@/hooks/use-toast';
import { errMsg } from '@/lib/format';

type Menu = { name: string; price: string; cost: string }[];
const ic = 'mt-1 min-h-12 w-full rounded-2xl border border-line bg-ink/50 px-4 text-[16px] text-snow focus:border-intel/60 focus:outline-none';

export default function ShopPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const qc = useQueryClient();
  const q = useGetUdaanState({ query: { queryKey: getGetUdaanStateQueryKey() } });
  const upd = useUpdateProfile();
  const [p, setP] = useState<Omit<Profile, 'menu' | 'provenance' | 'budget' | 'averageOrders'> & { budget: string; averageOrders: string } | null>(null);
  const [menu, setMenu] = useState<Menu>([]);
  const init = useRef(false);
  useEffect(() => {
    if (q.data && !init.current) {
      init.current = true;
      const pr = q.data.profile;
      setP({ shopName: pr.shopName, ownerName: pr.ownerName, category: pr.category, location: pr.location, openingHours: pr.openingHours, challenge: pr.challenge, budget: String(pr.budget), averageOrders: String(pr.averageOrders) });
      setMenu(pr.menu.map((m) => ({ name: m.name, price: String(m.price), cost: String(m.cost) })));
    }
  }, [q.data]);
  if (q.isLoading || (!p && !q.isError)) return <PageSkeleton />;
  if (q.isError || !q.data || !p) return <ErrorState onRetry={() => q.refetch()} />;

  const save = () => {
    if (!p.shopName.trim() || !p.ownerName.trim()) { toast({ title: t('shop.invalid'), variant: 'destructive' }); return; }
    upd.mutate({ data: { ...p, budget: Number(p.budget) || 0, averageOrders: Number(p.averageOrders) || 0,
      menu: menu.filter((m) => m.name.trim()).map((m) => ({ name: m.name.trim(), price: Number(m.price) || 0, cost: Number(m.cost) || 0 })) } }, {
      onSuccess: (profile) => { qc.setQueryData<BusinessState>(getGetUdaanStateQueryKey(), (o) => (o ? { ...o, profile } : o)); qc.invalidateQueries({ queryKey: ['/api/udaan/opportunities'] }); toast({ title: t('shop.saved') }); },
      onError: (e) => toast({ title: errMsg(e, t('error.generic')), variant: 'destructive' }),
    });
  };
  const fld = (k: keyof typeof p, label: TKey, numeric?: boolean) => (
    <label className="block text-sm text-mist">{t(label)}
      <input data-testid={'input-' + k} inputMode={numeric ? 'numeric' : undefined} value={p[k]} onChange={(e) => setP({ ...p, [k]: numeric ? e.target.value.replace(/\D/g, '') : e.target.value })} className={ic} />
    </label>
  );
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="rise">
        <h1 className="font-display text-4xl font-bold">{t('shop.title')}</h1>
        <p className="mt-2 text-mist">{t('shop.subtitle')}</p>
        <p className="mt-2 text-xs text-mist">{t('shop.provenance')}: <span className="text-intel" data-testid="text-provenance">{q.data.profile.provenance}</span></p>
      </header>
      <section className="grid gap-4 rounded-[28px] border border-line card-sheen p-5 sm:grid-cols-2">
        {fld('shopName', 'shop.shopName')}{fld('ownerName', 'shop.ownerName')}{fld('category', 'shop.category')}{fld('location', 'shop.location')}
        {fld('openingHours', 'shop.hours')}{fld('averageOrders', 'shop.avgOrders', true)}{fld('budget', 'shop.budget', true)}
        <label className="block text-sm text-mist sm:col-span-2">{t('shop.challenge')}
          <textarea data-testid="input-challenge" rows={2} value={p.challenge} onChange={(e) => setP({ ...p, challenge: e.target.value })} className={ic + ' py-3'} />
        </label>
      </section>
      <section className="rounded-[28px] border border-line bg-surface p-5">
        <h2 className="font-display text-xl font-semibold">{t('shop.menu')}</h2>
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-[1fr_72px_72px_44px] gap-2 px-1 text-[11px] uppercase tracking-wider text-mist"><span>{t('shop.item')}</span><span>{t('shop.price')}</span><span>{t('shop.cost')}</span><span /></div>
          {menu.map((m, i) => (
            <div key={i} className="grid grid-cols-[1fr_72px_72px_44px] gap-2">
              <input data-testid={'input-menu-name-' + i} value={m.name} onChange={(e) => setMenu(menu.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} className="min-h-11 min-w-0 rounded-xl border border-line bg-ink/50 px-3 text-snow focus:outline-none focus:border-intel/60" aria-label={t('shop.item')} />
              <input data-testid={'input-menu-price-' + i} inputMode="numeric" value={m.price} onChange={(e) => setMenu(menu.map((x, j) => (j === i ? { ...x, price: e.target.value.replace(/\D/g, '') } : x)))} className="min-h-11 min-w-0 rounded-xl border border-line bg-ink/50 px-2 font-mono text-snow focus:outline-none" aria-label={t('shop.price')} />
              <input data-testid={'input-menu-cost-' + i} inputMode="numeric" value={m.cost} onChange={(e) => setMenu(menu.map((x, j) => (j === i ? { ...x, cost: e.target.value.replace(/\D/g, '') } : x)))} className="min-h-11 min-w-0 rounded-xl border border-line bg-ink/50 px-2 font-mono text-snow focus:outline-none" aria-label={t('shop.cost')} />
              <button data-testid={'button-remove-menu-' + i} aria-label={t('shop.remove')} onClick={() => setMenu(menu.filter((_, j) => j !== i))} className="grid size-11 place-items-center rounded-xl text-mist hover:text-[#ff7a6b]"><Trash2 className="size-4" /></button>
            </div>
          ))}
        </div>
        <button data-testid="button-add-menu" onClick={() => setMenu([...menu, { name: '', price: '', cost: '' }])} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm text-intel"><Plus className="size-4" />{t('shop.addItem')}</button>
      </section>
      <div className="pb-safe sticky bottom-24 md:bottom-4">
        <button data-testid="button-save-profile" disabled={upd.isPending} onClick={save} className="min-h-14 w-full rounded-full bg-signal font-semibold text-ink shadow-[0_10px_40px_-10px_rgba(189,245,47,.4)] disabled:opacity-50">{upd.isPending ? t('common.loading') : t('common.save')}</button>
      </div>
    </div>
  );
}

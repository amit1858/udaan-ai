import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetUdaanState, getGetUdaanStateQueryKey, getGetExperimentsQueryKey, useUpdatePreferences,
  type Language, type BusinessState, type Preferences,
} from '@workspace/api-client-react';
import en from '@/locales/en.json';
import hinglish from '@/locales/hinglish.json';
import hi from '@/locales/hi.json';
import kn from '@/locales/kn.json';

export type Dict = typeof en;
export type TKey = keyof Dict;
const dicts: Record<Language, Dict> = { en, hinglish, hi, kn };

export const LANGS: { id: Language; label: string; sub: string; glyph: string; speech: string }[] = [
  { id: 'en', label: 'English', sub: 'Simple Indian English', glyph: 'Aa', speech: 'en-IN' },
  { id: 'hinglish', label: 'Hinglish', sub: 'Aapki apni language', glyph: 'Hi', speech: 'hi-IN' },
  { id: 'hi', label: 'हिन्दी', sub: 'अपनी भाषा में', glyph: 'अ', speech: 'hi-IN' },
  { id: 'kn', label: 'ಕನ್ನಡ', sub: 'ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ', glyph: 'ಕ', speech: 'kn-IN' },
];
export const speechLang = (l: Language) => LANGS.find((x) => x.id === l)?.speech ?? 'en-IN';

type Ctx = {
  lang: Language;
  t: (k: TKey, vars?: Record<string, string | number>) => string;
  setLang: (l: Language) => void;
  setPrefs: (p: Partial<Preferences>, onDone?: () => void) => void;
  saving: boolean;
};
const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const { data } = useGetUdaanState({ query: { queryKey: getGetUdaanStateQueryKey() } });
  const [override, setOverride] = useState<Language | null>(null);
  const lang: Language = override ?? data?.preferences.language ?? 'en';
  const mut = useUpdatePreferences();
  const mutate = mut.mutate;

  const setPrefs = useCallback((p: Partial<Preferences>, onDone?: () => void) => {
    if (p.language) setOverride(p.language);
    mutate({ data: p }, {
      onSuccess: (prefs) => {
        qc.setQueryData<BusinessState>(getGetUdaanStateQueryKey(), (old) => (old ? { ...old, preferences: prefs } : old));
        setOverride(null);
        if (p.language) {
          qc.invalidateQueries({ queryKey: getGetExperimentsQueryKey() });
          qc.invalidateQueries({ queryKey: getGetUdaanStateQueryKey() });
        }
        onDone?.();
      },
      onError: () => setOverride(null),
    });
  }, [mutate, qc]);

  const setLang = useCallback((l: Language) => setPrefs({ language: l }), [setPrefs]);

  const t = useCallback((k: TKey, vars?: Record<string, string | number>) => {
    let s: string = dicts[lang]?.[k] ?? en[k] ?? k;
    if (vars) for (const [a, b] of Object.entries(vars)) s = s.split('{' + a + '}').join(String(b));
    return s;
  }, [lang]);

  const value = useMemo(() => ({ lang, t, setLang, setPrefs, saving: mut.isPending }), [lang, t, setLang, setPrefs, mut.isPending]);
  return <I18nCtx.Provider value={value}><div lang={speechLang(lang)} className="contents">{children}</div></I18nCtx.Provider>;
}

export function useI18n() {
  const c = useContext(I18nCtx);
  if (!c) throw new Error('useI18n outside provider');
  return c;
}

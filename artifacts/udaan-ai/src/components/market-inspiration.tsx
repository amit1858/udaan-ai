import type { Message, Opportunity } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { ArrowUpRight, Globe2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { inr } from '@/lib/format';
const copy = {
  en: ['Market Inspiration', 'Retrieved source facts', 'Source unavailable — no competitor facts shown', 'Menu updated', 'Retrieved', 'AI hypothesis', 'Demo hypothesis, not live AI', 'Try this idea', 'Periodically updated listings, not live offers. Check prices with the restaurant. No popularity, traffic or sales is inferred. Ravi’s shop is fictional.', 'Underlying menu source'],
  hinglish: ['Market Inspiration', 'Source se retrieved facts', 'Source unavailable — competitor facts nahi dikhaye gaye', 'Menu updated', 'Retrieved', 'AI ka hypothesis', 'Demo hypothesis, live AI nahi', 'Yeh idea try karein', 'Listings periodically update hoti hain, live offers nahi. Prices restaurant se confirm karein. Popularity, traffic ya sales ka claim nahi hai. Ravi ki shop fictional hai.', 'Menu ka original source'],
  hi: ['बाज़ार से प्रेरणा', 'स्रोत से प्राप्त तथ्य', 'स्रोत उपलब्ध नहीं — प्रतियोगी तथ्य नहीं दिखाए गए', 'मेनू अपडेट', 'प्राप्त किया', 'AI का अनुमान', 'डेमो सुझाव, लाइव AI नहीं', 'यह विचार आज़माएँ', 'यह समय-समय पर अपडेट की गई सूची है, लाइव ऑफ़र नहीं। कीमतें रेस्तराँ से जाँचें। लोकप्रियता, ग्राहक संख्या या बिक्री का अनुमान नहीं है। रवि की दुकान काल्पनिक है।', 'मेनू का मूल स्रोत'],
  kn: ['ಮಾರುಕಟ್ಟೆಯಿಂದ ಸ್ಫೂರ್ತಿ', 'ಮೂಲದಿಂದ ಪಡೆದ ಮಾಹಿತಿ', 'ಮೂಲ ಲಭ್ಯವಿಲ್ಲ — ಸ್ಪರ್ಧಿಗಳ ಮಾಹಿತಿ ತೋರಿಸಿಲ್ಲ', 'ಮೆನು ನವೀಕರಣ', 'ಪಡೆದ ಸಮಯ', 'AI ಊಹೆ', 'ಡೆಮೋ ಊಹೆ, live AI ಅಲ್ಲ', 'ಈ ಉಪಾಯ ಪ್ರಯತ್ನಿಸಿ', 'ಇದು ನಿಯತಕಾಲಿಕ ಮಾಹಿತಿ, live offer ಅಲ್ಲ. ಬೆಲೆಗಳನ್ನು ರೆಸ್ಟೋರೆಂಟ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ. ಜನಪ್ರಿಯತೆ, ಗ್ರಾಹಕರ ಸಂಖ್ಯೆ ಅಥವಾ ಮಾರಾಟವನ್ನು ಊಹಿಸಿಲ್ಲ. ರವಿಯ ಅಂಗಡಿ ಕಾಲ್ಪನಿಕ.', 'ಮೆನುವಿನ ಮೂಲ'],
};
export const marketQuestions = {
  en: 'What interesting things are restaurants around me doing? What new idea could I try in my restaurant?',
  hinglish: 'Mere aas-paas ke restaurants kya interesting kar rahe hain? Main apne restaurant mein kya naya try kar sakta hoon?',
  hi: 'मेरे आस-पास के रेस्तराँ क्या दिलचस्प कर रहे हैं? मैं अपने रेस्तराँ में क्या नया आज़मा सकता हूँ?',
  kn: 'ನನ್ನ ಸುತ್ತಮುತ್ತಲಿನ ರೆಸ್ಟೋರೆಂಟ್‌ಗಳು ಏನು ವಿಭಿನ್ನವಾಗಿ ಮಾಡುತ್ತಿವೆ? ನನ್ನ ರೆಸ್ಟೋರೆಂಟ್‌ನಲ್ಲಿ ಯಾವ ಹೊಸ ಉಪಾಯ ಪ್ರಯತ್ನಿಸಬಹುದು?',
};
export function MarketInspiration({ market, provider, opportunity, interpretation }: { market: NonNullable<Message['market']>; provider: Message['provider']; opportunity?: Opportunity; interpretation: string }) {
  const { lang } = useI18n();
  const c = copy[lang];
  return <section data-testid="card-market-inspiration" className="overflow-hidden rounded-3xl border border-intel/40 bg-gradient-to-br from-intel/10 via-surface to-signal/5 p-5">
    <div className="mb-3 flex items-center gap-2 text-intel"><Globe2 className="size-5" /><h2 className="font-display text-xl font-semibold">{c[0]}</h2></div>
    <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-signal">{market.status === 'retrieved' ? c[1] : c[2]}</p>
    {market.facts.map((f) => <div key={f.url} className="mb-4 rounded-2xl border border-line bg-ink/60 p-4">
      <a href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1 font-semibold text-snow underline decoration-intel/50 underline-offset-4">{f.name}<ArrowUpRight className="mt-1 size-4 shrink-0 text-intel" /></a>
      <p className="mt-1 text-xs text-mist">{f.locality}, Bengaluru · {c[10]}: {f.source}</p>
      <ul className="my-3 space-y-2">{f.menu.map((i) => <li key={i.name} className="flex items-start justify-between gap-3 text-sm"><span>{i.name}<span className="block text-[11px] text-mist">{i.section}</span></span>{i.price !== undefined && <span className="font-mono text-intel">{inr(i.price)}</span>}</li>)}</ul>
      <p className="text-[11px] text-mist">{c[3]}: {f.updated || '—'}</p>
    </div>)}
    <p className="text-[11px] leading-relaxed text-mist">{c[4]}: {market.retrievedAt}<br />{c[8]}</p>
    <p className="mt-3 text-[11px] text-mist">Restaurant data: <a className="underline" href="https://indiarestros.com" target="_blank" rel="noopener noreferrer">IndiaRestros</a> · © OpenStreetMap contributors</p>
    <div className="mt-4 border-t border-line pt-4">
      <p className="text-xs font-semibold text-intel">{provider === 'demo' ? c[6] : c[5]}</p>
      <p className="my-3 whitespace-pre-line text-sm leading-relaxed text-snow">{interpretation}</p>
      <p className="mt-1 text-sm text-snow">{opportunity?.title}</p>
      <Link href={'/opportunity/' + (opportunity?.id || 'preorder')} className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-full bg-signal px-5 text-sm font-semibold text-ink">{c[7]} · {inr(opportunity?.budget ?? 0)}<ArrowUpRight className="size-4" /></Link>
    </div>
  </section>;
}

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { imgSrc } from '@/lib/format';
import { cn } from '@/lib/utils';

export function OppImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn('relative overflow-hidden bg-raised', className)}>
      {failed || !src ? (
        <div role="img" aria-label={alt} className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,rgba(92,198,255,.25),transparent_55%),radial-gradient(circle_at_80%_90%,rgba(189,245,47,.18),transparent_50%)]">
          <Sparkles className="size-8 text-intel/70" />
        </div>
      ) : (
        <img src={imgSrc(src)} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover" />
      )}
    </div>
  );
}

export function UdaanMark({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="12" fill="#0A0D16" stroke="#202638" />
      <path d="M8 26c6-1 10-4 13-9 2 3 5 5 11 5-6 2-10 5-12 9-2-3-6-5-12-5z" fill="#5CC6FF" />
      <path d="M21 17c1-4 4-7 9-8-2 3-3 6-3 9" fill="none" stroke="#BDF52F" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SunriseArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 220" className={className} role="img" aria-label="Sunrise over a South Indian breakfast counter with a steaming filter coffee tumbler">
      <defs>
        <radialGradient id="sun" cx="50%" cy="100%" r="70%"><stop offset="0" stopColor="#BDF52F" stopOpacity=".55" /><stop offset=".45" stopColor="#5CC6FF" stopOpacity=".18" /><stop offset="1" stopColor="#05070D" stopOpacity="0" /></radialGradient>
        <linearGradient id="cup" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#E8EDF5" /><stop offset="1" stopColor="#8C93A6" /></linearGradient>
      </defs>
      <rect width="360" height="220" fill="url(#sun)" />
      {[0, 1, 2, 3, 4, 5].map((i) => (<line key={i} x1="180" y1="200" x2={180 + Math.cos(Math.PI + (i + 1) * 0.45) * 220} y2={200 + Math.sin(Math.PI + (i + 1) * 0.45) * 220} stroke="#5CC6FF" strokeOpacity=".12" />))}
      <circle cx="180" cy="200" r="58" fill="none" stroke="#BDF52F" strokeOpacity=".5" />
      <rect x="0" y="198" width="360" height="22" fill="#0A0D16" />
      <line x1="0" y1="198" x2="360" y2="198" stroke="#202638" />
      <ellipse cx="96" cy="196" rx="46" ry="6" fill="#202638" />
      <path d="M58 190a38 12 0 0 0 76 0z" fill="#E8EDF5" fillOpacity=".9" />
      <path d="M70 184q26-14 52 0" fill="#BDF52F" fillOpacity=".85" />
      <path d="M232 150h30l-4 46h-22z" fill="url(#cup)" />
      <path d="M224 196h46l-6-8h-34z" fill="#8C93A6" />
      {[0, 1, 2].map((i) => (<path key={i} d={'M' + (240 + i * 7) + ' 140c-6-10 6-14 0-24'} fill="none" stroke="#5CC6FF" strokeOpacity=".7" strokeWidth="2" strokeLinecap="round" />))}
      <circle cx="300" cy="60" r="2" fill="#BDF52F" /><circle cx="60" cy="50" r="1.5" fill="#5CC6FF" /><circle cx="320" cy="120" r="1.2" fill="#E8EDF5" />
    </svg>
  );
}

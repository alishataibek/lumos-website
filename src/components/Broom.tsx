/** A flying broomstick in the Lumos gold, drawn handle-first (pointing right). Uses currentColor. */
export function Broom({ className = '' }: { className?: string }) {
  // Straw lines drawn over the bristle bundle, each from the binding to a point on the trailing edge.
  const straws: [number, number][] = [
    [6, 8.5],
    [3, 14.5],
    [1, 22],
    [3, 29.5],
    [6, 35.5],
  ]
  return (
    <svg viewBox="0 0 140 44" fill="currentColor" aria-hidden className={className}>
      {/* handle, slightly tapered, with a small knob at the front */}
      <path d="M44 20.2 L134 17.6 Q137 18.6 134 20.4 L44 23.8 Z" />
      <circle cx="135" cy="19" r="2.4" />
      {/* bristles: a full bundle fanning out behind the binding, with darker straw lines */}
      <path d="M45 14.5 C34 12 22 9 11 6 L6 8.5 L10 11.5 L3 14.5 L8 17.5 L1 22 L8 26.5 L3 29.5 L10 32.5 L6 35.5 L11 38 C22 35 34 32 45 29.5 Z" opacity="0.92" />
      <g stroke="#0c1535" strokeOpacity="0.35" strokeWidth="0.9" fill="none">
        {straws.map(([x, y]) => (
          <path key={y} d={`M43 22 L${x} ${y}`} />
        ))}
      </g>
      {/* bindings where the bristles meet the handle */}
      <rect x="40" y="15.5" width="3.2" height="13" rx="1.2" />
      <rect x="45" y="16.5" width="2.6" height="11" rx="1.1" />
      {/* a few sparkles left in its wake */}
      <path d="M4 8Q4 11 7 11Q4 11 4 14Q4 11 1 11Q4 11 4 8Z" />
      <path d="M18 34Q18 36 20 36Q18 36 18 38Q18 36 16 36Q18 36 18 34Z" />
    </svg>
  )
}

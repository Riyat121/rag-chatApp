// Friendly bot mascot (own design). Set float={false} for small static use.
export default function Orb({ size = 96, float = true }) {
  return (
    <div
      className="inline-block shrink-0"
      style={{
        width: size,
        height: size,
        animation: float ? 'orb-float 4s ease-in-out infinite' : 'none',
      }}
    >
      <style>{`@keyframes orb-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <defs>
          <linearGradient id="orb-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#818cf8" />
            <stop offset="1" stopColor="#6d28d9" />
          </linearGradient>
        </defs>
        <path
          d="M50 6 C70 24 88 38 88 60 C88 80 71 94 50 94 C29 94 12 80 12 60 C12 38 30 24 50 6Z"
          fill="url(#orb-grad)"
        />
        <ellipse cx="36" cy="36" rx="6" ry="10" fill="#fff" opacity=".25" transform="rotate(-25 36 36)" />
        <ellipse cx="38" cy="62" rx="7" ry="8" fill="#0f172a" />
        <ellipse cx="62" cy="62" rx="7" ry="8" fill="#0f172a" />
        <circle cx="40" cy="59" r="2.2" fill="#fff" />
        <circle cx="64" cy="59" r="2.2" fill="#fff" />
        <path d="M42 78 Q50 84 58 78" stroke="#c7d2fe" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}
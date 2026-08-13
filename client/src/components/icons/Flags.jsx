// Small circular flag badges used in the language toggle.
// Stylised (not pixel-exact) but recognisable renditions, clipped to a circle
// so they sit neatly in a pill-shaped toggle at any size.

export function UKFlag({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <defs>
        <clipPath id="uk-circle">
          <circle cx="18" cy="18" r="18" />
        </clipPath>
      </defs>
      <g clipPath="url(#uk-circle)">
        <rect width="36" height="36" fill="#00247d" />
        <path d="M0 0 36 36M36 0 0 36" stroke="#fff" strokeWidth="6" />
        <path d="M0 0 36 36M36 0 0 36" stroke="#cf142b" strokeWidth="2.4" />
        <path d="M18 0V36M0 18H36" stroke="#fff" strokeWidth="10" />
        <path d="M18 0V36M0 18H36" stroke="#cf142b" strokeWidth="4" />
      </g>
    </svg>
  );
}

export function NepalFlag({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <defs>
        <clipPath id="np-circle">
          <circle cx="18" cy="18" r="18" />
        </clipPath>
      </defs>
      <g clipPath="url(#np-circle)">
        <rect width="36" height="36" fill="#dc143c" />
        <path d="M2 2 L34 10 L2 18 Z" fill="none" stroke="#003893" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M2 16 L34 26 L2 36 Z" fill="none" stroke="#003893" strokeWidth="2.2" strokeLinejoin="round" />
        {/* moon */}
        <g transform="translate(12,12)">
          <circle r="3.4" fill="#fff" />
          <circle cx="1.6" cy="-1.1" r="3.1" fill="#dc143c" />
        </g>
        {/* sun */}
        <g transform="translate(13,25)" fill="#fff">
          <circle r="3.2" />
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={i} x="-0.5" y="-6.4" width="1" height="2.4" transform={`rotate(${i * 30})`} />
          ))}
        </g>
      </g>
    </svg>
  );
}

import { Link } from 'react-router-dom';

/**
 * Pure geometric Skilora Symbol SVG.
 * Concept: An abstract letter 'S' combining 3 ascending skill milestones
 * (Foundation [Sage], Diagnostic Pivot [Plum], Target Career Milestone [Coral])
 * connected by progressive geometric paths with an upward trajectory chevron.
 */
export function SkiloraSymbol({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Subtle radial ambient glow inside the symbol squircle */}
        <radialGradient
          id="skilora-symbol-glow"
          cx="0.5"
          cy="0.5"
          r="0.5"
          fx="0.8"
          fy="0.2"
        >
          <stop offset="0%" stopColor="var(--highlight-color)" stopOpacity="0.18" />
          <stop offset="50%" stopColor="var(--primary-color)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0.05" />
        </radialGradient>
      </defs>

      {/* Rounded Squircle Container */}
      <rect
        x="1.5"
        y="1.5"
        width="33"
        height="33"
        rx="9.5"
        fill="url(#skilora-symbol-glow)"
        stroke="var(--border-color)"
        strokeWidth="1"
      />

      {/* Lower Foundation & Learning Arc (Sage) */}
      <path
        d="M 10 26 C 7.5 26, 7.5 22, 10.5 20 C 13.5 18, 15.5 17.5, 18 16"
        stroke="var(--accent-color)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Upper Advancement & Career Crest Arc (Plum) */}
      <path
        d="M 18 16 C 20.5 14.5, 23 13.5, 25.5 11.5 C 28 9.5, 27 6.5, 24 6.5 C 20 6.5, 16 8.5, 13.5 11"
        stroke="var(--primary-color)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Level 1 Node: Foundation & Acquired Skills (Sage Green) */}
      <circle cx="10" cy="25.5" r="2.5" fill="var(--accent-color)" />

      {/* Level 2 Node: Gap Assessment & Diagnostic Pivot (Rich Plum / Soft Lavender) */}
      <circle
        cx="18"
        cy="16"
        r="2.75"
        fill="var(--primary-color)"
        stroke="var(--surface-color)"
        strokeWidth="1.5"
      />

      {/* Level 3 Node: Target Career Benchmark / Next Move (Warm Coral) */}
      <circle cx="25.5" cy="7.5" r="2.5" fill="var(--highlight-color)" />

      {/* Upward Progression Chevrons / Trajectory Accent */}
      <path
        d="M 23 9.5 L 26 6.5 L 26.5 9.5"
        stroke="var(--highlight-color)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Scalable Skilora brand mark with distinct geometric symbol and refined wordmark.
 */
export default function Logo({ className = '', link = true, size = 34 }) {
  const content = (
    <div className={`inline-flex items-center gap-2.5 font-bold tracking-tight text-[var(--text-main)] ${className}`}>
      <SkiloraSymbol size={size} />
      <span className="text-xl font-bold tracking-tight flex items-center">
        <span className="text-[var(--text-main)]">Skil</span>
        <span className="text-[var(--primary-color)]">ora</span>
      </span>
    </div>
  );

  if (link) {
    return (
      <Link
        to="/"
        className="focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] rounded-xl transition-opacity hover:opacity-90 inline-flex items-center"
        aria-label="Skilora Home"
      >
        {content}
      </Link>
    );
  }

  return content;
}

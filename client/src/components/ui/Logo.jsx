import { Link } from 'react-router-dom';

/**
 * Pure geometric Skillora AI Symbol SVG.
 * Concept: Ascending 3-tier skill nodes (Foundation, Diagnostic Pivot, Target Career)
 * connected by an upward learning trajectory curve with a subtle forward vector.
 * Compact, crisp, and perfectly balanced at 24-32px in light and dark themes.
 */
export function SkilloraSymbol({ size = 28, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="skillora-mark-bg"
          x1="0"
          y1="0"
          x2="28"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0.08" />
        </linearGradient>

        <linearGradient
          id="skillora-mark-stroke"
          x1="6"
          y1="22"
          x2="22"
          y2="6"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="var(--accent-color)" />
          <stop offset="50%" stopColor="var(--primary-color)" />
          <stop offset="100%" stopColor="var(--highlight-color)" />
        </linearGradient>
      </defs>

      {/* Rounded squircle emblem badge */}
      <rect
        x="1"
        y="1"
        width="26"
        height="26"
        rx="7"
        fill="url(#skillora-mark-bg)"
        stroke="var(--border-color)"
        strokeWidth="1"
      />

      {/* Ascending learning trajectory curve */}
      <path
        d="M 7.5 19.5 C 9.5 19.5 11 17 14 14 C 17 11 18.5 8.5 20.5 8.5"
        stroke="url(#skillora-mark-stroke)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Tier 1 Node: Acquired Foundation (Accent / Sky) */}
      <circle cx="7.5" cy="19.5" r="2" fill="var(--accent-color)" />

      {/* Tier 2 Node: AI Diagnostic Pivot (Primary Indigo) */}
      <circle
        cx="14"
        cy="14"
        r="2.2"
        fill="var(--primary-color)"
        stroke="var(--surface-color)"
        strokeWidth="1.2"
      />

      {/* Tier 3 Node: Career Benchmark (Highlight / Coral-Indigo) */}
      <circle cx="20.5" cy="8.5" r="2" fill="var(--highlight-color)" />

      {/* Subtle upward trajectory tick */}
      <path
        d="M 18.5 7 L 21.5 7 L 21.5 10"
        stroke="var(--highlight-color)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Scalable Skillora AI brand mark with compact geometric symbol and refined wordmark.
 */
export default function Logo({ className = '', link = true, size = 28 }) {
  const content = (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      <SkilloraSymbol size={size} />
      <span className="text-lg font-bold tracking-tight flex items-center leading-none">
        <span className="text-[var(--text-main)]">Skill</span>
        <span className="text-[var(--primary-color)]">ora</span>
        <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded bg-[var(--primary-color)]/10 text-[var(--primary-color)] border border-[var(--primary-color)]/20 leading-none">
          AI
        </span>
      </span>
    </span>
  );

  if (link) {
    return (
      <Link
        to="/"
        className="focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] rounded-lg transition-opacity hover:opacity-90 inline-flex items-center"
        aria-label="Skillora AI Home"
      >
        {content}
      </Link>
    );
  }

  return content;
}

// Export SkiloraSymbol alias for backwards compatibility with any existing imports
export const SkiloraSymbol = SkilloraSymbol;


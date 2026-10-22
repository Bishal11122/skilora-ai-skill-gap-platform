/**
 * Reusable Card component with clean SaaS surface elevation,
 * hairline borders, and subtle interaction states.
 */
export default function Card({
  children,
  className = '',
  hover = false,
  variant = 'default',
  ...props
}) {
  const hoverStyles = hover
    ? 'hover:-translate-y-1.5 hover:shadow-lg hover:border-[var(--text-muted)]/35 transition-all duration-300 ease-out cursor-pointer'
    : 'transition-colors duration-200';

  const variantStyles = {
    default: 'bg-[var(--surface-color)] border-[var(--border-color)] text-[var(--text-main)] shadow-sm',
    elevated: 'bg-[var(--surface-elevated)] border-[var(--border-color)] text-[var(--text-main)] shadow-sm',
    glass: 'glass-panel text-[var(--text-main)]',
    mint: 'card-pastel-mint shadow-sm',
    lavender: 'card-pastel-lavender shadow-sm',
    sky: 'card-pastel-sky shadow-sm',
    peach: 'card-pastel-peach shadow-sm',
    ghost: 'bg-transparent border-transparent shadow-none',
  };

  return (
    <div
      className={`border rounded-2xl p-5 sm:p-6 ${variantStyles[variant] || variantStyles.default} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}


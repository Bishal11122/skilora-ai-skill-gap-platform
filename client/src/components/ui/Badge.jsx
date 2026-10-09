/**
 * Reusable Badge component for restrained highlights with plum, sage, and coral accents.
 */
export default function Badge({
  children,
  variant = 'plum',
  className = '',
  ...props
}) {
  const variantStyles = {
    plum: 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] border-[var(--primary-color)]/25',
    sage: 'bg-[var(--accent-color)]/12 text-[var(--accent-color)] border-[var(--accent-color)]/30',
    coral: 'bg-[var(--highlight-color)]/12 text-[var(--highlight-color)] border-[var(--highlight-color)]/30',
    neutral: 'bg-[var(--surface-elevated)] text-[var(--text-muted)] border-[var(--border-color)]',
    success: 'bg-[var(--success-color)]/12 text-[var(--success-color)] border-[var(--success-color)]/30',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant] || variantStyles.plum} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

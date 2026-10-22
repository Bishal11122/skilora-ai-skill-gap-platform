/**
 * Reusable Badge component for restrained, high-precision status tags.
 */
export default function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
  ...props
}) {
  const sizeStyles = {
    xs: 'px-1.5 py-0.2 text-[10px] tracking-wide font-medium',
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  const variantStyles = {
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60',
    mint: 'bg-[var(--pastel-mint)] text-[var(--pastel-mint-text)] border-[var(--pastel-mint-border)]',
    lavender: 'bg-[var(--pastel-lavender)] text-[var(--pastel-lavender-text)] border-[var(--pastel-lavender-border)]',
    peach: 'bg-[var(--pastel-peach)] text-[var(--pastel-peach-text)] border-[var(--pastel-peach-border)]',
    sky: 'bg-[var(--pastel-sky)] text-[var(--pastel-sky-text)] border-[var(--pastel-sky-border)]',
    plum: 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60',
    sage: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
    coral: 'bg-orange-50 text-orange-800 border-orange-200/80 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800/60',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
    neutral: 'bg-slate-100/80 text-slate-700 border-slate-200/80 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${sizeStyles[size] || sizeStyles.sm} ${variantStyles[variant] || variantStyles.neutral} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}


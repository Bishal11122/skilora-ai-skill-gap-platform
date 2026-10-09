import { Link } from 'react-router-dom';

/**
 * Reusable Button component supporting primary, secondary, and ghost variants.
 * Styled with warm editorial / midnight plum tokens and subtle micro-interactions.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-4.5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white focus:ring-[var(--focus-ring)] shadow-xs hover:shadow-sm focus:ring-offset-[var(--bg-color)]',
    secondary:
      'bg-[var(--surface-color)] hover:bg-[var(--surface-elevated)] text-[var(--text-main)] border border-[var(--border-color)] hover:border-[var(--primary-color)]/30 focus:ring-[var(--focus-ring)] shadow-xs focus:ring-offset-[var(--bg-color)]',
    coral:
      'bg-[var(--highlight-color)] hover:bg-[var(--highlight-hover)] text-white focus:ring-[var(--highlight-color)] shadow-xs hover:shadow-sm focus:ring-offset-[var(--bg-color)]',
    ghost:
      'bg-transparent hover:bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-main)] focus:ring-[var(--focus-ring)] focus:ring-offset-[var(--bg-color)]',
  };

  const combinedClasses = `${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`;

  if (to && !disabled) {
    return (
      <Link to={to} className={combinedClasses} {...props}>
        {children}
      </Link>
    );
  }

  if (href && !disabled) {
    return (
      <a href={href} className={combinedClasses} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

import { Link } from 'react-router-dom';

/**
 * Reusable Button component with professional SaaS ergonomics,
 * subtle tactile depth, and accessible focus-visible states.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  pill = false,
  to,
  href,
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles = `inline-flex items-center justify-center font-semibold ${
    pill ? 'rounded-full' : 'rounded-xl'
  } transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none active:translate-y-[1px] hover:-translate-y-0.5 cursor-pointer`;

  const sizeStyles = {
    xs: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 font-medium',
    md: 'text-sm px-4.5 py-2.5 gap-2 font-semibold',
    lg: 'text-sm sm:text-base px-6 py-3 gap-2.5 font-semibold shadow-sm',
  };

  const variantStyles = {
    primary:
      'bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white shadow-sm hover:shadow-md focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-[var(--bg-color)] border border-transparent',
    secondary:
      'bg-[var(--surface-color)] hover:bg-[var(--surface-elevated)] text-[var(--text-main)] border border-[var(--border-color)] hover:border-[var(--text-muted)]/30 shadow-xs focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-[var(--bg-color)]',
    glass:
      'glass-panel text-[var(--text-main)] hover:bg-white/90 border border-white/60 shadow-xs focus-visible:ring-[var(--focus-ring)]',
    outline:
      'bg-transparent hover:bg-[var(--surface-elevated)] text-[var(--text-main)] border border-[var(--border-color)] hover:border-[var(--primary-color)]/50 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-[var(--bg-color)]',
    ghost:
      'bg-transparent hover:bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-main)] focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-[var(--bg-color)]',
    danger:
      'bg-[var(--danger-color)] hover:bg-red-700 text-white shadow-xs focus-visible:ring-red-500 focus-visible:ring-offset-[var(--bg-color)] border border-transparent',
    coral:
      'bg-[var(--highlight-color)] hover:bg-[var(--highlight-hover)] text-white shadow-xs focus-visible:ring-[var(--highlight-color)] focus-visible:ring-offset-[var(--bg-color)] border border-transparent',
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


/**
 * Reusable Card component with design token styling for light and dark themes.
 * Supports subtle elevation, warm borders, and optional hover states.
 */
export default function Card({
  children,
  className = '',
  hover = false,
  variant = 'default',
  ...props
}) {
  const hoverStyles = hover
    ? 'hover:border-[var(--primary-color)]/40 hover:shadow-sm transition-all duration-150'
    : '';

  const variantStyles = {
    default: 'bg-[var(--surface-color)] border-[var(--border-color)]',
    elevated: 'bg-[var(--surface-elevated)] border-[var(--border-color)]',
  };

  return (
    <div
      className={`border rounded-xl p-5 sm:p-6 shadow-xs ${variantStyles[variant] || variantStyles.default} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

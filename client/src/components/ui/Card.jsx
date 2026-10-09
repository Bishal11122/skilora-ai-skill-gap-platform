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
    ? 'hover:-translate-y-1 hover:border-[var(--primary-color)]/35 hover:shadow-md transition-all duration-200'
    : '';

  const variantStyles = {
    default: 'bg-[var(--surface-color)] border-[var(--border-color)]',
    elevated: 'bg-[var(--surface-elevated)] border-[var(--border-color)]',
  };

  return (
    <div
      className={`border rounded-2xl p-6 shadow-xs ${variantStyles[variant] || variantStyles.default} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

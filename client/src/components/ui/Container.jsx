/**
 * Reusable Container component for layout max-width and horizontal padding.
 */
export default function Container({
  children,
  className = '',
  size = 'default',
  ...props
}) {
  const sizeStyles = {
    default: 'max-w-7xl',
    narrow: 'max-w-4xl',
    wide: 'max-w-screen-2xl',
  };

  return (
    <div
      className={`mx-auto px-4 sm:px-6 lg:px-8 w-full ${sizeStyles[size] || sizeStyles.default} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

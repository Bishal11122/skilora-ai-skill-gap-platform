import Badge from './Badge';

/**
 * Reusable SectionHeading component with editorial typography.
 */
export default function SectionHeading({
  badge,
  badgeVariant = 'plum',
  title,
  subtitle,
  align = 'center',
  className = '',
}) {
  const alignStyles = {
    center: 'text-center mx-auto items-center',
    left: 'text-left items-start',
  };

  return (
    <div className={`flex flex-col max-w-3xl mb-12 sm:mb-16 ${alignStyles[align]} ${className}`}>
      {badge && (
        <div className="mb-3">
          <Badge variant={badgeVariant}>{badge}</Badge>
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-main)]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base sm:text-lg text-[var(--text-muted)] leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

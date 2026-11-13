/**
 * Reusable Badge component for status & metadata indicators.
 * Variants: success | accent | warning | muted | danger
 */
export const Badge = ({
  children,
  variant = 'muted',
  dot = false,
  className = '',
}) => {
  const variantClass = `badge-${variant}`;

  return (
    <span className={`badge ${variantClass} ${className}`.trim()}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'success'
              ? 'bg-[var(--success)] animate-pulse'
              : variant === 'accent'
              ? 'bg-[var(--accent)]'
              : variant === 'warning'
              ? 'bg-[var(--warning)]'
              : variant === 'danger'
              ? 'bg-[var(--danger)]'
              : 'bg-[var(--text-subtle)]'
          }`}
        />
      )}
      {children}
    </span>
  );
};

export const Chip = ({
  children,
  active = false,
  onClick,
  icon = null,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chip ${active ? 'chip-active' : ''} ${className} cursor-pointer transition-colors duration-150`.trim()}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default Badge;

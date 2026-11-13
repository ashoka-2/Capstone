/**
 * Reusable minimal-ai-ui IconButton component.
 * Ensures a11y via mandatory label prop.
 */
export const IconButton = ({
  icon,
  label,
  size = 'md',
  active = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) => {
  const sizeStyles = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const activeStyles = active
    ? 'bg-[var(--accent-soft)] text-[var(--accent-text)] border-[var(--accent)]'
    : '';

  return (
    <button
      type="button"
      className={`icon-btn ${sizeStyles} ${activeStyles} ${className}`.trim()}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {icon}
    </button>
  );
};

export default IconButton;

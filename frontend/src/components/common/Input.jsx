/**
 * Reusable Minimal AI-UI Input component.
 */
export const Input = ({
  value,
  onChange,
  placeholder,
  icon = null,
  trailing = null,
  className = '',
  type = 'text',
  disabled = false,
  ...props
}) => {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      {icon && (
        <span className="absolute left-3 text-[var(--text-subtle)] pointer-events-none flex items-center justify-center">
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`input-field ${icon ? 'pl-10' : ''} ${trailing ? 'pr-10' : ''}`}
        {...props}
      />
      {trailing && (
        <span className="absolute right-3 flex items-center justify-center">
          {trailing}
        </span>
      )}
    </div>
  );
};

export default Input;

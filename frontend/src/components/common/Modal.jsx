import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import IconButton from './IconButton';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Scrim backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Surface */}
      <div
        ref={modalRef}
        className={`relative w-full ${maxWidth} bg-[var(--surface)] border border-[var(--line-strong)] rounded-[var(--r-dialog)] p-6 shadow-2xl z-10 transition-all duration-200 transform scale-100 animate-in fade-in zoom-in-95`}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--line)]">
          <div>
            <h3 id="modal-title" className="text-lg font-semibold text-[var(--text)]">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[var(--text-muted)] mt-1">{subtitle}</p>
            )}
          </div>
          <IconButton
            icon={<X className="w-4 h-4" />}
            label="Close modal"
            size="sm"
            onClick={onClose}
          />
        </div>

        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;

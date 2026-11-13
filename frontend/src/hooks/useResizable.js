import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook to manage draggable panel resizing with collapse support and localStorage persistence.
 * Solves the classic iframe/Monaco mouse-capture issue during drag.
 */
export function useResizable({
  initialWidth = 380,
  minWidth = 260,
  maxWidth = 720,
  storageKey = 'sandbox_panel_width',
  direction = 'horizontal',
}) {
  const [width, setWidth] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return initialWidth;
  });

  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const lastExpandedWidthRef = useRef(width);

  // Sync lastExpandedWidth
  useEffect(() => {
    if (!isCollapsed && width >= minWidth) {
      lastExpandedWidthRef.current = width;
      try {
        localStorage.setItem(storageKey, String(width));
      } catch {
        // ignore
      }
    }
  }, [width, isCollapsed, minWidth, storageKey]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const startResizing = useCallback(
    (e) => {
      e.preventDefault();
      setIsResizing(true);
      if (isCollapsed) {
        setIsCollapsed(false);
      }

      const startPos = direction === 'horizontal' ? e.clientX ?? e.touches?.[0]?.clientX : e.clientY ?? e.touches?.[0]?.clientY;
      const startWidth = isCollapsed ? lastExpandedWidthRef.current : width;

      const handleMove = (moveEvent) => {
        const currentPos =
          direction === 'horizontal'
            ? moveEvent.clientX ?? moveEvent.touches?.[0]?.clientX
            : moveEvent.clientY ?? moveEvent.touches?.[0]?.clientY;

        if (typeof currentPos !== 'number') return;

        const delta = currentPos - startPos;
        const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + delta));
        setWidth(newWidth);
      };

      const handleEnd = () => {
        setIsResizing(false);
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
    },
    [direction, isCollapsed, minWidth, maxWidth, width]
  );

  return {
    width: isCollapsed ? 0 : width,
    rawWidth: width,
    isResizing,
    isCollapsed,
    toggleCollapse,
    setIsCollapsed,
    startResizing,
    setWidth,
  };
}

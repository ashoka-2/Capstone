import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { flushSync } from "react-dom";
import { createAnimation, TRANSITION_CONFIG } from "../utils/themeTransition.js";

const STYLE_ID = "theme-transition-style";

const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
  isDark: true,
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lovable-theme");
      if (saved === "light" || saved === "dark") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "dark";
  });

  const isTransitioning = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("lovable-theme", theme);
  }, [theme]);

  const applyTransitionStyles = useCallback((css) => {
    let styleEl = document.getElementById(STYLE_ID);
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = STYLE_ID;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;
  }, []);

  const toggleTheme = useCallback(
    (event) => {
      if (isTransitioning.current) return;

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Determine the origin corner for the circle-blur animation
      let startPosition = TRANSITION_CONFIG.start || "top-right";
      if (event && event.clientX !== undefined && event.clientY !== undefined) {
        const isLeft = event.clientX < window.innerWidth / 2;
        const isTop = event.clientY < window.innerHeight / 2;
        startPosition = `${isTop ? "top" : "bottom"}-${isLeft ? "left" : "right"}`;
      }

      if (
        typeof document === "undefined" ||
        !document.startViewTransition ||
        prefersReducedMotion
      ) {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
        return;
      }

      const animation = createAnimation(
        TRANSITION_CONFIG.variant || "circle-blur",
        startPosition
      );
      applyTransitionStyles(animation.css);

      isTransitioning.current = true;
      const transition = document.startViewTransition(() => {
        flushSync(() => {
          setTheme((prev) => {
            const next = prev === "dark" ? "light" : "dark";
            const root = document.documentElement;
            if (next === "dark") {
              root.classList.add("dark");
            } else {
              root.classList.remove("dark");
            }
            localStorage.setItem("lovable-theme", next);
            return next;
          });
        });
      });

      transition.finished.finally(() => {
        isTransitioning.current = false;
        document.getElementById(STYLE_ID)?.remove();
      });
    },
    [applyTransitionStyles]
  );

  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

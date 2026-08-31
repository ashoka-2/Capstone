import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useScrollToTop() {
  try {
    const { pathname } = useLocation();
    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]);
  } catch {
    // Graceful fallback if invoked outside router context
  }
}

export function ScrollToTop() {
  useScrollToTop();
  return null;
}

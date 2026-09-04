import { useEffect, useRef } from "react";
import gsap from "gsap";

export function useGsapReveal(options = {}) {
  const containerRef = useRef(null);
  const {
    stagger = 0.08,
    delay = 0.1,
    y = 24,
    duration = 0.7,
    ease = "power3.out",
    selector = ".gsap-reveal",
  } = options;

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const elements = containerRef.current.querySelectorAll(selector);
      if (elements.length > 0) {
        gsap.fromTo(
          elements,
          { opacity: 0, y },
          {
            opacity: 1,
            y: 0,
            duration,
            stagger,
            delay,
            ease,
            clearProps: "transform",
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [selector, stagger, delay, y, duration, ease]);

  return containerRef;
}

export default useGsapReveal;

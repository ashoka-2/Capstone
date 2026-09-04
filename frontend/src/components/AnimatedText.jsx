import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function AnimatedText({
  text = "",
  className = "",
  tag: Tag = "h1",
  delay = 0.15,
  duration = 0.85,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const words = containerRef.current.querySelectorAll(".anim-word");
      gsap.fromTo(
        words,
        { opacity: 0, y: 14, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration,
          stagger: 0.07,
          delay,
          ease: "power2.out",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [text, delay, duration]);

  const words = text.split(" ");

  return (
    <Tag ref={containerRef} className={`inline-flex flex-wrap gap-x-2 ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="anim-word inline-block will-change-transform">
          {word}
        </span>
      ))}
    </Tag>
  );
}

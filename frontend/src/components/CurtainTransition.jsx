import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { Sparkles } from "lucide-react";
import { useTheme } from "../Hooks/useTheme.jsx";

const ROUTE_LABELS = {
  "/": "Project Dashboard",
  "/connectors": "Developer Connectors",
  "/templates": "Starter Templates",
  "/search": "Workspace Search",
};

export default function CurtainTransition() {
  const location = useLocation();
  const { isDark } = useTheme();
  const prevPathRef = useRef(location.pathname);
  const isFirstRender = useRef(true);
  const containerRef = useRef(null);
  const columnsRef = useRef([]);
  const textRef = useRef(null);
  const [activeLabel, setActiveLabel] = useState("");

  const getLabelForPath = (pathname) => {
    if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
    if (pathname.startsWith("/workspace")) return "Cloud Workspace";
    return "Studio";
  };

  useEffect(() => {
    // Skip animation on initial mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevPathRef.current = location.pathname;
      return;
    }

    if (prevPathRef.current === location.pathname) return;
    prevPathRef.current = location.pathname;

    const label = getLabelForPath(location.pathname);
    setActiveLabel(label);

    const cols = columnsRef.current.filter(Boolean);
    if (!cols.length || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Show container
      gsap.set(containerRef.current, { display: "flex", pointerEvents: "auto" });
      gsap.set(cols, { yPercent: -100 });
      if (textRef.current) gsap.set(textRef.current, { opacity: 0, scale: 0.85, y: 15 });

      // Wipe In (curtain slides down from top)
      tl.to(cols, {
        yPercent: 0,
        duration: 0.28,
        stagger: 0.03,
        ease: "power3.inOut",
      })
      // Subtle badge pop in center
      .to(
        textRef.current,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.2,
          ease: "back.out(1.5)",
        },
        "-=0.15"
      )
      // Micro hold
      .to({}, { duration: 0.06 })
      // Badge fade out
      .to(textRef.current, {
        opacity: 0,
        y: -10,
        scale: 0.95,
        duration: 0.16,
        ease: "power2.in",
      })
      // Wipe Out (curtain exits downward)
      .to(cols, {
        yPercent: 100,
        duration: 0.32,
        stagger: 0.03,
        ease: "power3.inOut",
        onComplete: () => {
          gsap.set(containerRef.current, { display: "none", pointerEvents: "none" });
        },
      }, "-=0.08");
    }, containerRef);

    return () => ctx.revert();
  }, [location.pathname]);

  return (
    <div
      ref={containerRef}
      style={{ display: "none" }}
      className="fixed inset-0 z-[9990] pointer-events-none flex flex-row overflow-hidden select-none"
    >
      {/* 5 Architectural Staggered Columns adhering to active theme */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          ref={(el) => (columnsRef.current[i] = el)}
          className={`w-1/5 h-full relative shadow-2xl transition-colors duration-200 ${
            isDark
              ? "bg-[#131419] border-r border-[#2c2e3a]"
              : "bg-[#e8ebf3] border-r border-[#cfd4e1]"
          }`}
          style={{ willChange: "transform" }}
        >
          {/* Ambient subtle warm gradient streak */}
          <div
            className={`absolute inset-0 pointer-events-none ${
              isDark
                ? "bg-gradient-to-b from-[#ff5a5f]/12 via-transparent to-[#ff7e40]/12"
                : "bg-gradient-to-b from-[#ff5a5f]/16 via-transparent to-[#ff7e40]/16"
            }`}
          />
        </div>
      ))}

      {/* Floating Center Brand Badge with theme-matched aesthetics */}
      <div
        ref={textRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
      >
        <div
          className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border shadow-2xl backdrop-blur-xl transition-colors duration-200 ${
            isDark
              ? "bg-[#1d1e24]/95 border-[#ff5a5f]/30 shadow-[#ff5a5f]/20"
              : "bg-[#fafbfe]/95 border-[#ff5a5f]/35 shadow-[#ff5a5f]/15"
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ff5a5f] to-[#ff7e40] flex items-center justify-center text-white shadow-md shadow-[#ff5a5f]/30 shrink-0">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span
              className={`text-[10px] font-mono uppercase tracking-widest font-semibold ${
                isDark ? "text-[#ff7e40]" : "text-[#ff5a5f]"
              }`}
            >
              Lovable Studio
            </span>
            <span
              className={`text-sm font-semibold tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {activeLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

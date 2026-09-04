import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Sparkles, Terminal, Code2 } from "lucide-react";

export default function Preloader({ onComplete }) {
  const containerRef = useRef(null);
  const counterRef = useRef(null);
  const barRef = useRef(null);
  const logoRef = useRef(null);
  const ringRef = useRef(null);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    // Check if preloader was already shown in this session
    const hasLoaded = sessionStorage.getItem("capstone_preloader_seen");
    if (hasLoaded) {
      if (onComplete) onComplete();
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem("capstone_preloader_seen", "true");
          if (onComplete) onComplete();
        },
      });

      // Animate percentage counter object
      const countObj = { val: 0 };

      tl.to(countObj, {
        val: 100,
        duration: 1.8,
        ease: "power3.inOut",
        onUpdate: () => {
          setPercent(Math.floor(countObj.val));
        },
      })
      .to(barRef.current, {
        scaleX: 1,
        duration: 1.8,
        ease: "power3.inOut",
      }, 0)
      .fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.8, y: 10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" },
        0.2
      )
      .fromTo(
        ringRef.current,
        { scale: 0.5, opacity: 0 },
        { scale: 1.2, opacity: 0.8, duration: 1.2, ease: "power2.out", repeat: 1, yoyo: true },
        0.4
      )
      // Exit animation: curtain wipe and fade
      .to(".preloader-content", {
        opacity: 0,
        y: -30,
        duration: 0.5,
        ease: "power2.in",
      })
      .to(containerRef.current, {
        yPercent: -100,
        duration: 0.9,
        ease: "power4.inOut",
      });
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  // Don't render anything if already seen
  if (typeof window !== "undefined" && sessionStorage.getItem("capstone_preloader_seen")) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#111111] text-white overflow-hidden select-none"
    >
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div
          ref={ringRef}
          className="w-[480px] h-[480px] rounded-full bg-[radial-gradient(circle,rgba(255,90,95,0.22)_0%,transparent_70%)] blur-2xl"
        />
      </div>

      <div className="preloader-content relative z-10 flex flex-col items-center max-w-sm w-full px-6">
        {/* Logo and Emblem */}
        <div ref={logoRef} className="flex items-center gap-3 mb-8">
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-tr from-[#ff5a5f] to-[#ff7e40] p-[1px] shadow-lg shadow-[#ff5a5f]/25">
            <div className="w-full h-full bg-[#171717] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#ff7e40] animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xl tracking-tight text-neutral-100">Lovable</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#ff5a5f]/20 text-[#ff7e40] font-mono border border-[#ff5a5f]/30">AI</span>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono tracking-wider uppercase">Cloud Studio</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden mb-4 relative">
          <div
            ref={barRef}
            className="h-full w-full bg-gradient-to-r from-[#ff5a5f] to-[#ff7e40] origin-left scale-x-0"
          />
        </div>

        {/* Counter and status */}
        <div className="flex items-center justify-between w-full text-xs font-mono text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff7e40] animate-ping" />
            Initializing Kubernetes Pods...
          </span>
          <span ref={counterRef} className="text-neutral-200 font-medium">
            {percent}%
          </span>
        </div>
      </div>
    </div>
  );
}

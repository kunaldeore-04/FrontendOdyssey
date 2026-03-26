import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, useMotionTemplate } from "framer-motion";

/** First I/O cell (DDR5-6400): center ≈ this origin for portal zoom */
const DDR_ORIGIN = "17% 92%";

function TraceWarpGrid({ progress }) {
  const opacity = useTransform(progress, [0.72, 0.78, 0.9, 1], [0, 0.4, 0.85, 1]);
  const fineOpacity = useTransform(progress, [0.74, 0.8, 1], [0, 0.35, 0.75]);
  const yCoarse = useTransform(progress, [0.78, 1], [0, -2680]);
  const yFine = useTransform(progress, [0.78, 1], [0, -1820]);
  const coarsePos = useMotionTemplate`${0}px ${yCoarse}px`;
  const finePos = useMotionTemplate`${0}px ${yFine}px`;
  return (
    <>
      <motion.div
        aria-hidden
        style={{
          opacity,
          backgroundPosition: coarsePos,
          position: "absolute",
          left: "-15%",
          right: "-15%",
          top: "-120%",
          height: "320%",
          zIndex: 5,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(201,168,76,0.2) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(201,168,76,0.16) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <motion.div
        aria-hidden
        style={{
          opacity: fineOpacity,
          backgroundPosition: finePos,
          position: "absolute",
          left: "-15%",
          right: "-15%",
          top: "-120%",
          height: "320%",
          zIndex: 5,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(201,168,76,0.12) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(201,168,76,0.1) 1px, transparent 1px)",
          backgroundSize: "29px 29px",
        }}
      />
    </>
  );
}

function DieSweep({ progress }) {
  const x = useTransform(progress, [0.08, 0.62], ['-130%', '160%']);
  return (
    <motion.div
      style={{
        x,
        position: 'absolute', inset: 0,
        pointerEvents: 'none', zIndex: 20,
      }}
    >
      <div style={{
        width: '38%', height: '100%',
        background:
          'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.025) 40%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.025) 60%, transparent 100%)',
        transform: 'skewX(-10deg)',
      }} />
    </motion.div>
  );
}

function CoreCell({ index, progress }) {
  const threshold = 0.26 + index * 0.026;
  const opacity = useTransform(progress, [threshold, threshold + 0.07], [0, 1]);
  const bg = useTransform(
    progress,
    [threshold, threshold + 0.07, threshold + 0.22],
    ['rgba(201,168,76,0)', 'rgba(201,168,76,0.5)', 'rgba(201,168,76,0.05)']
  );
  const borderColor = useTransform(
    progress,
    [threshold, threshold + 0.07, threshold + 0.22],
    ['rgba(201,168,76,0.08)', 'rgba(201,168,76,0.55)', 'rgba(201,168,76,0.18)']
  );
  const glow = useTransform(
    progress,
    [threshold, threshold + 0.07, threshold + 0.22],
    ['none', '0 0 14px rgba(201,168,76,0.4)', 'none']
  );
  return (
    <motion.div
      style={{
        opacity,
        backgroundColor: bg,
        border: '0.5px solid',
        borderColor,
        boxShadow: glow,
        borderRadius: 4,
        aspectRatio: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* transistor grid lines */}
      <div style={{
        position: 'absolute', inset: 5,
        backgroundImage:
          'linear-gradient(rgba(201,168,76,0.07) 1px, transparent 1px),' +
          'linear-gradient(90deg, rgba(201,168,76,0.07) 1px, transparent 1px)',
        backgroundSize: '33.3% 33.3%',
      }} />
      <span style={{
        position: 'relative', zIndex: 1,
        fontSize: 7, letterSpacing: 1,
        color: 'rgba(201,168,76,0.8)',
        fontFamily: "'Syne Mono', monospace",
      }}>
        C{index}
      </span>
    </motion.div>
  );
}

const STAGES = ['FETCH', 'DECODE', 'EXECUTE', 'MEMORY', 'WRITE'];

function DDR5PortCell({ progress, label }) {
  const boxShadow = useTransform(progress, [0.76, 0.88, 1], [
    '0 0 0 rgba(201,168,76,0)',
    '0 0 28px rgba(201,168,76,0.55)',
    '0 0 40px rgba(201,168,76,0.75)',
  ]);
  const borderColor = useTransform(progress, [0.76, 1], [
    'rgba(201,168,76,0.66)',
    'rgba(201,168,76,1)',
  ]);
  return (
    <motion.div
      className="rounded-[3px] border-[0.5px] py-[3px] text-center font-['Syne_Mono',_monospace] text-[5.5px] tracking-[1.5px] text-[#c9a84cea]"
      style={{ boxShadow, borderColor }}
    >
      {label}
    </motion.div>
  );
}

/**
 * Egress trace toward DRAM — acts as the portal trigger: packet accelerates into the
 * trace band as scroll enters the handoff window.
 */
function MemoryEgressCue({ progress }) {
  const cueOpacity = useTransform(progress, [0.74, 0.82, 1], [0, 1, 1]);
  const dotLeft = useTransform(progress, [0.74, 0.88, 0.97, 1], ["4%", "55%", "102%", "118%"]);
  const traceH = useTransform(progress, [0.78, 1], ["3px", "5px"]);
  const packetScale = useTransform(progress, [0.78, 0.9, 1], [1, 1.35, 1.65]);
  const trailOpacity = useTransform(progress, [0.78, 1], [0, 0.85]);
  const traceGlow = useTransform(progress, [0.78, 1], [
    "none",
    "0 0 24px rgba(201,168,76,0.35)",
  ]);
  const labelOpacity = useTransform(progress, [0.8, 1], [0.65, 1]);
  const labelShadow = useTransform(progress, [0.82, 1], [
    "none",
    "0 0 12px rgba(201,168,76,0.5)",
  ]);
  return (
    <motion.div
      style={{ opacity: cueOpacity }}
      className="pointer-events-none relative mt-1 flex w-full max-w-[280px] flex-col items-stretch gap-1.5"
    >
      <div className="flex items-center justify-center gap-2">
        <motion.div
          className="relative flex-1 overflow-visible rounded-full"
          style={{
            height: traceH,
            background:
              "linear-gradient(90deg, rgba(201,168,76,0.55) 0%, rgba(201,168,76,0.2) 45%, transparent 100%)",
            boxShadow: traceGlow,
          }}
        >
          <motion.div
            className="absolute top-1/2 h-[9px] w-[14px] -translate-y-1/2 rounded-[3px] border border-white/20"
            style={{
              left: dotLeft,
              rotate: -3,
              scale: packetScale,
              background:
                "linear-gradient(135deg, rgba(201,168,76,1), rgba(201,168,76,0.4))",
              boxShadow: "0 0 18px rgba(201,168,76,0.7)",
            }}
          />
          <motion.div
            className="absolute inset-y-0 left-0 w-[42%] -translate-x-1 rounded-full"
            style={{
              opacity: trailOpacity,
              background:
                "linear-gradient(90deg, rgba(201,168,76,0.5), transparent)",
              filter: "blur(4px)",
            }}
          />
        </motion.div>
        <motion.span
          className="shrink-0 font-['Syne_Mono',monospace] text-[6.5px] tracking-[3px] text-[#c9a84cb8]"
          style={{
            opacity: labelOpacity,
            textShadow: labelShadow,
          }}
        >
          THROUGH_TRACE
        </motion.span>
      </div>
    </motion.div>
  );
}

function PipelineSegment({ progress, label, index }) {
  const t = 0.58 + index * 0.04;
  const dotOpacity = useTransform(progress, [t, t + 0.05], [0, 1]);
  const dotGlow = useTransform(progress, [t, t + 0.05, t + 0.18], [
    "rgba(201,168,76,0.1)",
    "rgba(201,168,76,1)",
    "rgba(201,168,76,0.4)",
  ]);
  const labelColor = useTransform(progress, [t, t + 0.05], [
    "rgba(201,168,76,0.1)",
    "rgba(201,168,76,0.7)",
  ]);
  const dotShadow = useTransform(progress, [t, t + 0.05], [
    "none",
    "0 0 10px rgba(201,168,76,0.7)",
  ]);
  const wireColor = useTransform(progress, [t, t + 0.05], [
    "rgba(201,168,76,0.06)",
    "rgba(201,168,76,0.22)",
  ]);
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <motion.div
        style={{
          opacity: dotOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <motion.div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: dotGlow,
            boxShadow: dotShadow,
          }}
        />
        <motion.span
          style={{
            color: labelColor,
            fontSize: 7,
            letterSpacing: 2,
            fontFamily: "'Syne Mono', monospace",
          }}
        >
          {label}
        </motion.span>
      </motion.div>

      {index < STAGES.length - 1 && (
        <motion.div
          style={{
            width: 40,
            height: 1,
            marginBottom: 22,
            backgroundColor: wireColor,
          }}
        />
      )}
    </div>
  );
}

function PipelineRow({ progress }) {
  const rowOpacity = useTransform(progress, [0.56, 0.68, 0.84, 0.88, 0.97], [0, 1, 1, 1, 0]);
  const rowY = useTransform(progress, [0.56, 0.68], [12, 0]);

  return (
    <motion.div
      style={{
        opacity: rowOpacity,
        y: rowY,
        display: "flex",
        alignItems: "center",
      }}
    >
      {STAGES.map((s, i) => (
        <PipelineSegment key={s} progress={progress} label={s} index={i} />
      ))}
    </motion.div>
  );
}


function useCountUp(motionVal, decimals = 1) {
  const [display, setDisplay] = useState('0.0');

  useMotionValueEvent(motionVal, "change", (latest) => {
    setDisplay(latest.toFixed(decimals));
  });

  return display;
}


const Hero = ({ onContinueToMemory }) => {
  const scrollContainerRef = useRef(null);
  const conatinerRef = useRef(null);
  const handoffSentRef = useRef(false);

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
    target: conatinerRef,
    offset: ["start end", "end start"],
  })
  const smooth = useSpring(scrollYProgress, { stiffness: 50, damping: 20 })

  useEffect(() => {
    const onHandoff = onContinueToMemory;
    const el = scrollContainerRef.current;
    if (!onHandoff || !el) return;

    const maybeHandoff = () => {
      if (handoffSentRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight - clientHeight <= 1) return;
      if (scrollTop + clientHeight >= scrollHeight - 6) {
        handoffSentRef.current = true;
        onHandoff();
      }
    };

    el.addEventListener("scroll", maybeHandoff, { passive: true });
    maybeHandoff();
    return () => el.removeEventListener("scroll", maybeHandoff);
  }, [onContinueToMemory]);

  const chipScale = useTransform(smooth, [0, 0.16, 0.72, 0.76, 1], [0.55, 1, 1, 1, 1]);
  const chipOpacity = useTransform(smooth, [0.04, 0.2], [0, 1]);
  const chipRotateX = useTransform(smooth, [0, 0.28, 0.7, 0.76, 1], [22, 0, 0, 0, 0]);
  const chipRotateY = useTransform(smooth, [0, 0.76, 1], [-5, -3, 0]);

  const headlineOpacity = useTransform(smooth, [0.04, 0.2, 0.76, 0.86], [0, 1, 1, 0]);
  const headlineY = useTransform(smooth, [0.04, 0.2, 0.82, 1], [28, 0, -12, -22]);

  const l3Opacity = useTransform(smooth, [0.38, 0.5], [0, 1]);

  const ghzMotion = useTransform(smooth, [0.18, 0.54], [0, 4.2]);
  const ghzSpring = useSpring(ghzMotion, { stiffness: 45, damping: 18 });
  const ghzDisplay = useCountUp(ghzSpring, 1);

  const statOpacity = useTransform(smooth, [0.2, 0.34, 0.54, 0.64, 0.74], [0, 1, 1, 0, 0]);
  const statX = useTransform(smooth, [0.2, 0.34], [30, 0]);

  const copyOpacity = useTransform(smooth, [0.66, 0.76, 0.86, 0.93], [0, 1, 1, 0]);

  /** Zoom into DDR5 egress — capped so sticky viewport stays readable */
  const portalDieZoom = useTransform(smooth, [0.76, 0.82, 1], [1, 1.28, 3.25]);

  /** Layered parallax vs scroll progress (sticky 400vh — different depths drift at different rates) */
  const parallaxGrainY = useTransform(smooth, [0, 1], [0, -20]);
  const parallaxVignetteY = useTransform(smooth, [0, 0.55, 1], [0, 8, -36]);
  const parallaxGlowY = useTransform(smooth, [0, 0.4, 1], [26, -4, -62]);
  const parallaxGridY = useTransform(smooth, [0, 1], [0, 88]);
  const chipParallaxY = useTransform(smooth, [0, 0.72, 1], [0, 0, -34]);
  const headlineParallaxY = useTransform(smooth, [0, 0.5, 1], [0, -10, -28]);
  const headlineCombinedY = useTransform([headlineY, headlineParallaxY], ([a, b]) => a + b);
  const statParallaxY = useTransform(smooth, [0, 0.38, 0.72, 1], [18, -4, -32, -58]);
  const copyParallaxY = useTransform(smooth, [0.55, 1], [0, -26]);

  return (
    <div
      ref={scrollContainerRef}
      className="relative h-full w-full overflow-x-hidden overflow-y-auto overscroll-y-none"
    >
      <section ref={conatinerRef} className="relative h-[400vh] bg-[#070707]">
      <div className="sticky top-0 flex h-dvh w-full flex-col items-center justify-center overflow-hidden">

        {/* Grain texture — slow drift */}
        <motion.div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40, opacity: 0.4, y: parallaxGrainY,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '160px 160px',
          }}
        />

        {/* Vignette — mid depth */}
        <motion.div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3, y: parallaxVignetteY,
            background: 'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 25%, #070707 100%)',
          }}
        />

        <motion.div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, y: parallaxGlowY,
            background: 'radial-gradient(ellipse 55% 50% at 50% 54%, rgba(201,168,76,0.055) 0%, transparent 70%)',
          }}
        />

        <motion.div style={{ y: parallaxGridY }} className="pointer-events-none absolute inset-0 z-[4]">
          <TraceWarpGrid progress={smooth} />
        </motion.div>

        <div
          className="relative z-10"
          style={{ perspective: 1200 }}
        >
        <motion.div
          className="flex flex-col items-center gap-12"
          style={{
            scale: chipScale,
            opacity: chipOpacity,
            rotateX: chipRotateX,
            rotateY: chipRotateY,
            y: chipParallaxY,
            transformStyle: "preserve-3d",
          }}
        >
          <motion.div style={{ opacity: headlineOpacity, y: headlineCombinedY }} className="text-center">
            <div className="text-xs tracking-[5px] text-amber-400 font-mono uppercase">
              Section 2 : The Brain
            </div>
            <h2 className="font-['Cormorant_Garamond',serif] text-5xl font-medium text-amber-50 m-0 leading-[1.1]">
              Central Processing Unit
            </h2>
            <div className="mx-auto mt-4 h-px w-11 bg-[#c9a84c74]" />
          </motion.div>

          <motion.div
            className="relative"
            style={{
              scale: portalDieZoom,
              transformOrigin: DDR_ORIGIN,
            }}
          >
            {/* Die body */}
            <div className="relative h-71 w-76 overflow-hidden rounded-xl border border-[#c9a84c2e] bg-[linear-gradient(150deg,#131211_0%,#0c0b0b_60%,#111010_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03),0_40px_120px_rgba(0,0,0,0.85),0_0_60px_rgba(201,168,76,0.04)]">

              {/* top edge highlight */}
              <div className="absolute inset-x-0 top-0 z-15 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1)_50%,transparent)]" />

              <DieSweep progress={smooth} />

              <div className="flex h-full flex-col gap-2.5 p-4.5">
                {/* Die label */}
                <div className="text-center font-['Syne_Mono',monospace] text-[8px] tracking-[4.5px] text-[#c9a84ccd]">
                  CORTEX-V8 · 5nm · 8-CORE
                </div>

                {/* Cores 4×2 */}
                <div className="grid flex-1 grid-cols-4 gap-1.75">
                  {Array.from({ length: 8 }, (_, i) => (
                    <CoreCell key={i} index={i} progress={smooth} />
                  ))}
                </div>

                {/* L3 cache */}
                <motion.div style={{ opacity: l3Opacity }}>
                  <div className="rounded-[3px] border-[0.5px] border-[#c9a84ca1] bg-[#c9a84c05] py-1.25 text-center font-['Syne_Mono',monospace] text-[6.5px] tracking-[3.5px] text-[#c9a84cc6]">
                    L3 CACHE · 32 MB
                  </div>
                </motion.div>

                {/* I/O row */}
                <div className="grid grid-cols-3 gap-1.25">
                  <DDR5PortCell progress={smooth} label="DDR5-6400" />
                  {['PCIe 5.0', 'USB4 Gen3'].map((label) => (
                    <div
                      key={label}
                      className="rounded-[3px] border-[0.5px] border-[#c9a84ca8] py-[3px] text-center font-['Syne_Mono',_monospace] text-[5.5px] tracking-[1.5px] text-[#c9a84cea]"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Corner fiducials */}
            {[
              "top-[-7px] left-[-7px]",
              "top-[-7px] right-[-7px]",
              "bottom-[-7px] left-[-7px]",
              "bottom-[-7px] right-[-7px]",
            ].map((pos, i) => (
              <div
                key={i}
                className={`absolute h-[10px] w-[10px] rounded-[1px] border border-[#c9a84c47] ${pos}`}
              />
            ))}
          </motion.div>
          <div className="flex flex-col items-center">
            <PipelineRow progress={smooth} />
            <MemoryEgressCue progress={smooth} />
          </div>
        </motion.div>
        </div>
        <motion.div
          style={{
            opacity: statOpacity,
            x: statX,
            position: 'absolute',
            right: '7vw',
            top: '50%',
            y: '-50%',
            zIndex: 20,
            textAlign: 'right',
          }}
        >
          <motion.div style={{ y: statParallaxY }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 100, fontWeight: 600,
            color: '#F0EDE6', lineHeight: 1,
            letterSpacing: -4,
            textShadow: '0 0 100px rgba(201,168,76,0.18)',
          }}>
            {ghzDisplay}
          </div>
          <div style={{
            fontFamily: "'Syne Mono', monospace",
            fontSize: 9, letterSpacing: 6,
            color: 'rgba(201,168,76,0.45)',
            marginTop: 6,
          }}>
            GHz CLOCK
          </div>
          <div style={{ width: '100%', height: 1, backgroundColor: 'rgba(201,168,76,0.18)', margin: '14px 0' }} />
          <div style={{
            fontFamily: "'Syne Mono', monospace",
            fontSize: 7.5, letterSpacing: 2.5,
            color: 'rgba(201,168,76,0.28)',
          }}>
            4.2 × 10⁹ cycles / sec
          </div>
          <div style={{
            fontFamily: "'Syne Mono', monospace",
            fontSize: 7.5, letterSpacing: 2.5,
            color: 'rgba(201,168,76,0.22)',
            marginTop: 6,
          }}>
            8 cores · 16 threads
          </div>
          </motion.div>
        </motion.div>

        {/* ── Bottom narrative ── */}
        <motion.div style={{
          opacity: copyOpacity,
          y: copyParallaxY,
          position: 'absolute',
          left: '50%',
          x: '-50%',
          bottom: 'max(22px, 3.5vh)',
          margin: 0,
          textAlign: 'center',
          maxWidth: 460,
          zIndex: 20,
        }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 16.5, fontWeight: 300, fontStyle: 'italic',
            color: 'rgba(240,237,230,0.9)',
            lineHeight: 1.9, letterSpacing: 0.2, margin: 0,
          }}>
            Each clock cycle, the CPU fetches an instruction, decodes its intent,
            and executes with surgical precision -
            <span style={{ color: 'rgba(201,168,76,0.8)', fontStyle: 'normal' }}> four billion times every second.</span>
          </p>
        </motion.div>

      </div>
      </section>
    </div>
  );
};

export default Hero;
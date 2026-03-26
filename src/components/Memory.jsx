import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { MemoryStick, Binary, ArrowRightLeft, RefreshCw, CircuitBoard } from 'lucide-react';

const GOLD = 'rgba(201, 168, 76, 0.9)';
const GOLD_DIM = 'rgba(201, 168, 76, 0.15)';
const GOLD_MID = 'rgba(201, 168, 76, 0.45)';
const BG_DARK = '#070707';

const EASE = [0.22, 1, 0.36, 1];

/** Shared `viewport` options (sans `root`) for `whileInView` inside Memory’s scroll panel. */
const MEMORY_IN_VIEW = { once: true, amount: 0.22, margin: '0px 0px -8% 0px' };

/** Re-run / reverse when the block leaves the scroll area (scroll back up undoes the motion). */
const MEMORY_IN_VIEW_REVERSIBLE = { once: false, amount: 0.22, margin: '0px 0px -8% 0px' };

const addressTraceAsideVariants = {
  hidden: {
    opacity: 0,
    x: 36,
    transition: { duration: 0.58, ease: EASE },
  },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.72, ease: EASE, delay: 0.08 },
  },
};

const statContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
};

const statItemVariants = {
  hidden: { opacity: 0, y: 22, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: EASE },
  },
};

function randomHex() {
  return `0x${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')
    .toUpperCase()}`;
}

/** Subtle travelling highlight — suggests DRAM refresh / row activation */
function RefreshSweep() {
  return (
    <motion.div
      aria-hidden
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height: '28%',
        top: '-30%',
        pointerEvents: 'none',
        background:
          'linear-gradient(180deg, transparent 0%, rgba(201,168,76,0.12) 45%, rgba(201,168,76,0.02) 55%, transparent 100%)',
        zIndex: 4,
      }}
      animate={{ top: ['-30%', '110%'] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
    />
  );
}

/** Single capacitor cell in the memory array */
function CapacitorCell({ index, phase }) {
  const row = Math.floor(index / 8);
  const col = index % 8;
  const wave = (row + col) * 0.04;
  return (
    <motion.div
      style={{
        aspectRatio: '1',
        borderRadius: 3,
        border: `1px solid ${GOLD_DIM}`,
        background: 'linear-gradient(145deg, rgba(15,15,15,0.95), rgba(7,7,7,0.98))',
        position: 'relative',
        overflow: 'hidden',
      }}
      initial={{ opacity: 0, scale: 0.65 }}
      animate={{
        opacity: phase ? 1 : 0,
        scale: phase ? 1 : 0.65,
        boxShadow: phase
          ? [
              '0 0 0 rgba(201,168,76,0)',
              '0 0 12px rgba(201,168,76,0.25)',
              '0 0 0 rgba(201,168,76,0)',
            ]
          : '0 0 0 rgba(201,168,76,0)',
      }}
      transition={{
        opacity: { delay: wave, duration: 0.45, ease: EASE },
        scale: { delay: wave, duration: 0.45, ease: EASE },
        boxShadow: { delay: wave + 0.5, duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          inset: 2,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${GOLD_DIM} 0%, transparent 55%)`,
          opacity: 0.35,
        }}
        animate={{ opacity: [0.2, 0.55, 0.2] }}
        transition={{ duration: 2.4 + (index % 5) * 0.15, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

/** DIMM-style module — scales down from “deep field” after Hero trace portal */
function MemoryModuleVisual({ phase }) {
  const cells = useMemo(() => Array.from({ length: 40 }, (_, i) => i), []);
  return (
    <motion.div
      initial={{
        opacity: 0.75,
        scale: 3.85,
        y: -56,
        filter: 'blur(14px)',
        rotateX: 8,
      }}
      animate={{
        opacity: phase ? 1 : 0,
        scale: phase ? 1 : 3.85,
        y: phase ? 0 : -56,
        filter: phase ? 'blur(0px)' : 'blur(14px)',
        rotateX: phase ? 0 : 8,
      }}
      transition={{
        duration: 1.15,
        delay: phase ? 0.18 : 0,
        ease: EASE,
      }}
      style={{
        transformOrigin: '50% 42%',
        transformStyle: 'preserve-3d',
        perspective: 900,
        position: 'relative',
        borderRadius: 20,
        padding: 'clamp(16px, 3vw, 28px)',
        border: `1px solid ${GOLD_MID}`,
        background: 'linear-gradient(165deg, rgba(18,18,18,0.95) 0%, rgba(5,5,5,0.98) 100%)',
        boxShadow: `0 28px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(201,168,76,0.08), 0 0 60px ${GOLD_DIM}`,
        overflow: 'hidden',
        maxWidth: 420,
        margin: '0 auto',
      }}
    >
      <RefreshSweep />

      {/* gold notch pegs like DIMM contacts */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '18%',
          right: '18%',
          height: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 6,
          paddingBottom: 4,
          zIndex: 2,
        }}
      >
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.div
            key={i}
            style={{ flex: 1, height: 5, borderRadius: 1, background: GOLD_DIM }}
            animate={{ opacity: [0.35, 0.85, 0.35] }}
            transition={{ duration: 1.8, delay: i * 0.08, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: 6,
          position: 'relative',
          zIndex: 3,
          paddingBottom: 18,
        }}
      >
        {cells.map((i) => (
          <CapacitorCell key={i} index={i} phase={phase} />
        ))}
      </div>

      <motion.div
        style={{
          position: 'absolute',
          top: 12,
          right: 14,
          fontFamily: "'Syne Mono', monospace",
          fontSize: 8,
          letterSpacing: 2,
          color: GOLD,
          textTransform: 'uppercase',
          zIndex: 5,
        }}
        animate={{ opacity: [0.45, 1, 0.45] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        ROW ACTIVATION
      </motion.div>
    </motion.div>
  );
}

/** Moving pulse along address / data path */
function BusPulse({ label, reverse }) {
  return (
    <div
      style={{
        position: 'relative',
        height: 2,
        borderRadius: 1,
        background: `linear-gradient(90deg, ${GOLD_DIM}, rgba(201,168,76,0.08), ${GOLD_DIM})`,
        overflow: 'hidden',
        marginTop: 6,
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          width: '32%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.85), transparent)',
          borderRadius: 1,
        }}
        animate={{ left: reverse ? ['100%', '-32%'] : ['-32%', '100%'] }}
        transition={{ duration: 2.1, repeat: Infinity, ease: 'linear' }}
      />
      <span
        style={{
          position: 'absolute',
          top: -18,
          left: 0,
          fontFamily: "'Syne Mono', monospace",
          fontSize: 8,
          letterSpacing: 1.5,
          color: 'rgba(240,237,230,0.45)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

/** One address line — traveling pulse stands in for fast-switching CMOS levels */
function AddressBitLane({ index, phase }) {
  return (
    <>
      <span
        style={{
          fontFamily: "'Syne Mono', monospace",
          fontSize: 9,
          letterSpacing: 0.8,
          color: 'rgba(240,237,230,0.45)',
        }}
      >
        A{index}
      </span>
      <div
        style={{
          position: 'relative',
          height: 7,
          borderRadius: 2,
          background: 'rgba(201,168,76,0.06)',
          overflow: 'hidden',
          border: `1px solid ${GOLD_DIM}`,
        }}
      >
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '32%',
            borderRadius: 1,
            background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.82), transparent)',
          }}
          animate={
            phase ? { left: ['-32%', '105%'] } : { left: '-32%' }
          }
          transition={{
            duration: 2.15,
            repeat: phase ? Infinity : 0,
            ease: 'linear',
            delay: index * 0.055,
          }}
        />
      </div>
    </>
  );
}

function ControlTimingStrip({ phase }) {
  const signals = [
    { name: 'RAS#', hint: 'row addr' },
    { name: 'CAS#', hint: 'column' },
    { name: 'WE#', hint: 'write en' },
  ];
  return (
    <div style={{ marginTop: 22 }}>
      <p
        style={{
          fontFamily: "'Syne Mono', monospace",
          fontSize: 8,
          letterSpacing: 2,
          color: GOLD,
          margin: '0 0 12px',
          textTransform: 'uppercase',
        }}
      >
        Control strobes
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 12,
        }}
      >
        {signals.map((s, i) => (
          <div key={s.name}>
            <div
              style={{
                fontFamily: "'Syne Mono', monospace",
                fontSize: 8,
                color: 'rgba(240,237,230,0.5)',
                marginBottom: 6,
                letterSpacing: 1,
              }}
            >
              {s.name}
              <span style={{ color: 'rgba(240,237,230,0.25)', marginLeft: 6 }}>{s.hint}</span>
            </div>
            <div
              style={{
                height: 24,
                position: 'relative',
                background: 'rgba(0,0,0,0.45)',
                borderRadius: 4,
                border: `1px solid ${GOLD_DIM}`,
              }}
            >
                <motion.div
                style={{
                  position: 'absolute',
                  bottom: 3,
                  left: '10%',
                  right: '10%',
                  borderRadius: 2,
                  background: `linear-gradient(180deg, ${GOLD}, rgba(201,168,76,0.35))`,
                  transformOrigin: '50% 100%',
                }}
                animate={
                  phase
                    ? { height: ['28%', '62%', '32%', '28%'], opacity: [0.35, 0.95, 0.5, 0.35] }
                    : { height: '28%', opacity: 0.35 }
                }
                transition={{
                  duration: 2.6,
                  repeat: phase ? Infinity : 0,
                  ease: 'easeInOut',
                  delay: i * 0.38,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddressBusSection({ phase, ingressFlash, scrollRootRef }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ ...MEMORY_IN_VIEW, root: scrollRootRef }}
      transition={{ duration: 0.72, ease: EASE }}
      style={{
        borderRadius: 18,
        border: `1px solid ${ingressFlash ? GOLD_MID : GOLD_DIM}`,
        padding: 'clamp(18px, 3vw, 24px)',
        background: 'linear-gradient(165deg, rgba(14,14,14,0.93), rgba(6,6,6,0.97))',
        boxShadow: ingressFlash
          ? `0 0 0 1px rgba(201,168,76,0.35), 0 20px 56px rgba(201,168,76,0.12)`
          : '0 14px 44px rgba(0,0,0,0.38)',
        marginBottom: 'clamp(24px, 4vw, 36px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 14,
          marginBottom: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CircuitBoard size={20} color={GOLD} strokeWidth={1.15} />
          <div>
            <p
              style={{
                margin: 0,
                fontFamily: "'Syne Mono', monospace",
                fontSize: 10,
                letterSpacing: 3,
                color: GOLD,
                textTransform: 'uppercase',
              }}
            >
              Address bus
            </p>
            <p
              style={{
                margin: '6px 0 0',
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontSize: 15,
                fontWeight: 300,
                color: 'rgba(240,237,230,0.52)',
                maxWidth: 320,
                lineHeight: 1.4,
              }}
            >
              Multiplexed lines — row first, then column — each pulse is a physical voltage race to
              the DIMM.
            </p>
          </div>
        </div>
        <motion.div
          animate={ingressFlash ? { scale: [1, 1.04, 1] } : {}}
          transition={{ duration: 0.55, ease: EASE }}
          style={{
            fontFamily: "'Syne Mono', monospace",
            fontSize: 8,
            letterSpacing: 2,
            color: GOLD,
            textTransform: 'uppercase',
            padding: '7px 12px',
            borderRadius: 10,
            border: `1px solid ${GOLD_MID}`,
            background: 'rgba(201,168,76,0.07)',
            whiteSpace: 'nowrap',
          }}
        >
          Packet ingress
        </motion.div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr',
          columnGap: 14,
          rowGap: 7,
          alignItems: 'center',
        }}
      >
        {Array.from({ length: 16 }, (_, i) => (
          <AddressBitLane key={i} index={i} phase={phase} />
        ))}
      </div>

      <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${GOLD_DIM}` }}>
        <p
          style={{
            fontFamily: "'Syne Mono', monospace",
            fontSize: 9,
            letterSpacing: 0.8,
            color: 'rgba(240,237,230,0.42)',
            margin: 0,
            lineHeight: 1.65,
          }}
        >
          Physical addresses are latched at the controller; <span style={{ color: GOLD }}>MEM_RD</span> /
          <span style={{ color: GOLD }}> MEM_WR</span> qualify the burst. RAS/CAS sequence opens the row
          buffer, then walks column addresses for the 64 B line fill.
        </p>
      </div>

      <ControlTimingStrip phase={phase} />
    </motion.section>
  );
}

function HexTicker({ active }) {
  const [lines, setLines] = useState(() =>
    Array.from({ length: 5 }, () => ({ addr: randomHex(), word: randomHex() }))
  );

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setLines((prev) => [...prev.slice(1), { addr: randomHex(), word: randomHex() }]);
    }, 720);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div style={{ minHeight: 88, overflow: 'hidden', position: 'relative' }}>
      {lines.map((row, i) => (
        <motion.div
          key={i}
          initial={false}
          animate={{
            opacity: i === lines.length - 1 ? 1 : 0.35,
            x: i === lines.length - 1 ? [10, 0] : 0,
            filter: i === lines.length - 1 ? ['blur(4px)', 'blur(0px)'] : 'blur(0px)',
          }}
          transition={{ duration: 0.32, ease: EASE }}
          style={{
            fontFamily: "'Syne Mono', monospace",
            fontSize: 11,
            letterSpacing: 1.2,
            color: i === lines.length - 1 ? '#F0EDE6' : 'rgba(240,237,230,0.35)',
            marginBottom: 4,
          }}
        >
          <span style={{ color: GOLD }}>{row.addr}</span>
          <span style={{ margin: '0 10px', color: GOLD_DIM }}>→</span>
          <span>{row.word}</span>
        </motion.div>
      ))}
    </div>
  );
}

const Memory = ({ arrivalKey = 0 }) => {
  const [phase, setPhase] = useState(false);
  const [ingressFlash, setIngressFlash] = useState(false);
  const scrollRootRef = useRef(null);

  const { scrollYProgress } = useScroll({
    container: scrollRootRef,
    offset: ['start start', 'end start'],
  });
  const headerY = useTransform(scrollYProgress, [0, 0.18], [0, -28]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0.88]);

  const memoryParallaxGrainY = useTransform(scrollYProgress, [0, 1], [0, -16]);
  const memoryParallaxVignetteY = useTransform(scrollYProgress, [0, 0.55, 1], [0, 10, -28]);
  const memoryParallaxGlowY = useTransform(scrollYProgress, [0, 1], [22, -52]);
  const memoryParallaxGridY = useTransform(scrollYProgress, [0, 1], [0, 56]);
  const memoryParallaxBlobY = useTransform(scrollYProgress, [0, 1], [0, 42]);
  const memoryParallaxBlobScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  useEffect(() => {
    const t = requestAnimationFrame(() => setPhase(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    if (arrivalKey < 1) return;
    setIngressFlash(true);
    const timer = window.setTimeout(() => setIngressFlash(false), 980);
    return () => window.clearTimeout(timer);
  }, [arrivalKey]);

  return (
    <div
      ref={scrollRootRef}
      style={{
        position: 'relative',
        minHeight: '100%',
        height: '100%',
        width: '100%',
        backgroundColor: BG_DARK,
        overflowX: 'hidden',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Grain — subtle vertical drift */}
      <motion.div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 40,
          opacity: 0.4,
          y: memoryParallaxGrainY,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '160px 160px',
        }}
      />

      <motion.div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 3,
          y: memoryParallaxVignetteY,
          background: 'radial-gradient(ellipse 88% 88% at 50% 45%, transparent 30%, #070707 100%)',
        }}
      />

      <motion.div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          y: memoryParallaxGlowY,
          background:
            'radial-gradient(ellipse 50% 45% at 50% 30%, rgba(201,168,76,0.06) 0%, transparent 65%)',
        }}
      />

      <motion.div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2,
          y: memoryParallaxGridY,
          backgroundImage: `linear-gradient(${GOLD_DIM} 1px, transparent 1px), linear-gradient(90deg, ${GOLD_DIM} 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          opacity: 0.18,
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: '42%',
          left: '50%',
          width: 'min(90vw, 900px)',
          height: '55vh',
          marginLeft: 'calc(min(90vw, 900px) * -0.5)',
          marginTop: '-27.5vh',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <motion.div
          aria-hidden
          style={{
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 68%)',
            y: memoryParallaxBlobY,
            scale: memoryParallaxBlobScale,
          }}
        />
      </div>

      <AnimatePresence>
        {phase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
            style={{
              position: 'relative',
              zIndex: 10,
              padding: 'clamp(28px, 5vh, 56px) clamp(20px, 5vw, 48px) 48px',
              maxWidth: 1100,
              margin: '0 auto',
            }}
          >
            <motion.div style={{ y: headerY, opacity: headerOpacity, willChange: 'transform, opacity' }}>
              <motion.div
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.55, ease: EASE }}
                style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    padding: 18,
                    borderRadius: 22,
                    border: `1px solid ${GOLD_DIM}`,
                    background: 'linear-gradient(145deg, #0f0f0f, #070707)',
                    boxShadow: `0 20px 50px rgba(0,0,0,0.45), inset 0 0 24px ${GOLD_DIM}`,
                  }}
                >
                  <MemoryStick color={GOLD} size={44} strokeWidth={1.1} />
                </motion.div>
              </motion.div>

              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <span
                  style={{
                    fontFamily: "'Syne Mono', monospace",
                    fontSize: 11,
                    letterSpacing: 8,
                    color: GOLD,
                    textTransform: 'uppercase',
                  }}
                >
                  Subsystem · volatile store
                </span>
              </div>

              <motion.h1
                initial={{ letterSpacing: '-0.02em', filter: 'blur(14px)' }}
                animate={{ letterSpacing: '0.02em', filter: 'blur(0px)' }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(2rem, 7vw, 3.75rem)',
                  fontWeight: 300,
                  color: '#F0EDE6',
                  margin: '0 0 16px',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  textShadow: '0 0 36px rgba(240, 237, 230, 0.12)',
                }}
              >
                Inside <span style={{ color: GOLD }}>DRAM</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
                  fontWeight: 300,
                  color: 'rgba(240,237,230,0.65)',
                  textAlign: 'center',
                  maxWidth: 560,
                  margin: '0 auto 40px',
                  lineHeight: 1.55,
                }}
              >
                Billions of tiny capacitors hold charge for milliseconds. Rows wake, columns
                align, and data races the bus back to the core — fast, fragile, and endlessly
                refreshing.
              </motion.p>
            </motion.div>

            <AddressBusSection phase={phase} ingressFlash={ingressFlash} scrollRootRef={scrollRootRef} />

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:gap-12">
              <motion.div
                initial={{ opacity: 0, x: -36, rotateY: -4 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ ...MEMORY_IN_VIEW_REVERSIBLE, root: scrollRootRef }}
                transition={{ duration: 0.78, ease: EASE }}
                style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
              >
                <MemoryModuleVisual phase={phase} />
              </motion.div>

              <motion.aside
                initial="hidden"
                whileInView="show"
                variants={addressTraceAsideVariants}
                viewport={{ ...MEMORY_IN_VIEW_REVERSIBLE, root: scrollRootRef }}
                style={{
                  borderRadius: 16,
                  border: `1px solid ${GOLD_DIM}`,
                  padding: '22px 22px 18px',
                  background: 'linear-gradient(180deg, rgba(16,16,16,0.9), rgba(6,6,6,0.96))',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <Binary size={16} color={GOLD} strokeWidth={1.2} />
                  <span
                    style={{
                      fontFamily: "'Syne Mono', monospace",
                      fontSize: 10,
                      letterSpacing: 3,
                      color: GOLD,
                      textTransform: 'uppercase',
                    }}
                  >
                    Address trace
                  </span>
                </div>

                <HexTicker active={phase} />

                <div style={{ marginTop: 22, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <ArrowRightLeft size={14} color={GOLD} strokeWidth={1.2} style={{ opacity: 0.8 }} />
                    <span
                      style={{
                        fontFamily: "'Syne Mono', monospace",
                        fontSize: 9,
                        letterSpacing: 2,
                        color: 'rgba(240,237,230,0.5)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Bus activity
                    </span>
                  </div>
                  <BusPulse label="ADDRESS" />
                  <div style={{ height: 16 }} />
                  <BusPulse label="DATA (64b)" reverse />
                </div>

                <motion.div
                  style={{
                    marginTop: 24,
                    paddingTop: 18,
                    borderTop: `1px solid ${GOLD_DIM}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                  animate={{ opacity: [0.85, 1, 0.85] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    style={{ display: 'flex' }}
                  >
                    <RefreshCw size={15} color={GOLD} strokeWidth={1.2} />
                  </motion.div>
                  <div>
                    <p
                      style={{
                        fontFamily: "'Syne Mono', monospace",
                        fontSize: 8,
                        letterSpacing: 2,
                        color: GOLD,
                        margin: 0,
                        textTransform: 'uppercase',
                      }}
                    >
                      Refresh interval
                    </p>
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 18,
                        fontWeight: 300,
                        color: '#F0EDE6',
                        margin: '4px 0 0',
                      }}
                    >
                      ~64 ms window
                    </p>
                  </div>
                </motion.div>
              </motion.aside>
            </div>

            <motion.div
              className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3"
              variants={statContainerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ ...MEMORY_IN_VIEW, root: scrollRootRef }}
            >
              {[
                { k: 'Typical latency', v: '~50 ns', sub: 'ROW → COLUMN' },
                { k: 'Channel width', v: '64-bit', sub: 'per DIMM slot' },
                { k: 'Hierarchy', v: 'L3 → RAM', sub: 'capacitor grid' },
              ].map((stat) => (
                <motion.div
                  key={stat.k}
                  variants={statItemVariants}
                  style={{
                    borderRadius: 12,
                    border: `1px solid ${GOLD_DIM}`,
                    padding: '16px 18px',
                    background: 'rgba(10,10,10,0.75)',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Syne Mono', monospace",
                      fontSize: 8,
                      letterSpacing: 2,
                      color: GOLD,
                      margin: 0,
                      textTransform: 'uppercase',
                    }}
                  >
                    {stat.k}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 22,
                      fontWeight: 300,
                      color: '#F0EDE6',
                      margin: '8px 0 4px',
                    }}
                  >
                    {stat.v}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Syne Mono', monospace",
                      fontSize: 9,
                      color: 'rgba(240,237,230,0.4)',
                      margin: 0,
                      letterSpacing: 0.5,
                    }}
                  >
                    {stat.sub}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Memory;

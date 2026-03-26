import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import { MemoryStick, Binary, ArrowRightLeft, RefreshCw, CircuitBoard, Zap, Database, Activity } from 'lucide-react';

const GOLD = 'rgba(201,168,76,0.9)';
const GOLD_DIM = 'rgba(201,168,76,0.15)';
const GOLD_MID = 'rgba(201,168,76,0.45)';
const GOLD_BRIGHT = 'rgba(201,168,76,1)';
const BG_DARK = '#070707';
const EASE = [0.22, 1, 0.36, 1];

// ─── tiny util ───────────────────────────────────────────────────────────────
function randomHex(bytes = 3) {
  return `0x${Math.floor(Math.random() * (2 ** (bytes * 8)))
    .toString(16).padStart(bytes * 2, '0').toUpperCase()}`;
}
function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}

// ─── Background layers ───────────────────────────────────────────────────────
function BgLayers({ scrollYProgress }) {
  const grainY = useTransform(scrollYProgress, [0, 1], [0, -16]);
  const glowY = useTransform(scrollYProgress, [0, 1], [22, -52]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 56]);
  const blobY = useTransform(scrollYProgress, [0, 1], [0, 42]);
  const blobS = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  return (<>
    <motion.div aria-hidden style={{
      position: 'fixed', inset: '-150px', pointerEvents: 'none', zIndex: 40, opacity: 0.35, y: grainY,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundSize: '160px 160px'
    }} />
    <motion.div aria-hidden style={{
      position: 'fixed', inset: '-150px', pointerEvents: 'none', zIndex: 3,
      background: 'radial-gradient(ellipse 88% 88% at 50% 45%, transparent 30%, #070707 100%)'
    }} />
    <motion.div aria-hidden style={{
      position: 'fixed', inset: '-150px', pointerEvents: 'none', zIndex: 1, y: glowY,
      background: 'radial-gradient(ellipse 50% 45% at 50% 30%, rgba(201,168,76,0.07) 0%, transparent 65%)'
    }} />
    <motion.div aria-hidden style={{
      position: 'fixed', inset: '-150px', pointerEvents: 'none', zIndex: 2, y: gridY,
      backgroundImage: `linear-gradient(${GOLD_DIM} 1px, transparent 1px), linear-gradient(90deg, ${GOLD_DIM} 1px, transparent 1px)`,
      backgroundSize: '80px 80px', opacity: 0.18
    }} />
    <div style={{
      position: 'fixed', top: '42%', left: '50%', width: 'min(90vw,900px)', height: '55vh',
      marginLeft: 'calc(min(90vw,900px)*-0.5)', marginTop: '-27.5vh', pointerEvents: 'none', zIndex: 0
    }}>
      <motion.div aria-hidden style={{
        width: '100%', height: '100%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 68%)',
        y: blobY, scale: blobS
      }} />
    </div>
  </>);
}

// ─── Live hex ticker ─────────────────────────────────────────────────────────
function HexTicker({ active }) {
  const [lines, setLines] = useState(() =>
    Array.from({ length: 6 }, () => ({ addr: randomHex(3), word: randomHex(4), op: Math.random() > 0.5 ? 'RD' : 'WR' }))
  );
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setLines(prev => [...prev.slice(1), { addr: randomHex(3), word: randomHex(4), op: Math.random() > 0.5 ? 'RD' : 'WR' }]);
    }, 680);
    return () => clearInterval(id);
  }, [active]);
  return (
    <div style={{ minHeight: 108, overflow: 'hidden' }}>
      {lines.map((row, i) => (
        <motion.div key={i} animate={{
          opacity: i === lines.length - 1 ? 1 : 0.28 + i * 0.1,
          x: i === lines.length - 1 ? [8, 0] : 0, filter: i === lines.length - 1 ? ['blur(4px)', 'blur(0px)'] : 'blur(0px)'
        }}
          transition={{ duration: 0.28, ease: EASE }}
          style={{
            fontFamily: "'Syne Mono',monospace", fontSize: 10.5, letterSpacing: 1.2,
            color: i === lines.length - 1 ? '#F0EDE6' : 'rgba(240,237,230,0.3)', marginBottom: 5,
            display: 'flex', alignItems: 'center', gap: 10
          }}>
          <span style={{ color: GOLD }}>{row.addr}</span>
          <span style={{ color: 'rgba(201,168,76,0.35)', fontSize: 8 }}>→</span>
          <span>{row.word}</span>
          <span style={{
            fontSize: 7, letterSpacing: 2, color: row.op === 'RD' ? 'rgba(201,168,76,0.8)' : 'rgba(201,168,76,0.5)',
            border: `1px solid ${row.op === 'RD' ? 'rgba(201,168,76,0.4)' : 'rgba(201,168,76,0.2)'}`,
            borderRadius: 3, padding: '1px 5px'
          }}>{row.op}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Animated bus pulse ───────────────────────────────────────────────────────
function BusPulse({ label, reverse, color = GOLD }) {
  return (
    <div style={{ marginTop: 10 }}>
      <span style={{
        fontFamily: "'Syne Mono',monospace", fontSize: 8, letterSpacing: 1.5,
        color: 'rgba(240,237,230,0.38)', display: 'block', marginBottom: 6
      }}>{label}</span>
      <div style={{
        position: 'relative', height: 3, borderRadius: 2,
        background: `linear-gradient(90deg, ${GOLD_DIM}, rgba(201,168,76,0.05), ${GOLD_DIM})`, overflow: 'hidden'
      }}>
        <motion.div style={{
          position: 'absolute', top: 0, width: '30%', height: '100%', borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`
        }}
          animate={{ left: reverse ? ['100%', '-30%'] : ['-30%', '100%'] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: 'linear' }} />
      </div>
    </div>
  );
}

// ─── Address lane ────────────────────────────────────────────────────────────
function AddressBitLane({ index, phase, scrollPhase }) {
  const [hovered, setHovered] = useState(false);
  const bit = useMemo(() => Math.round(Math.random()), []);
  return (
    <motion.div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: 'grid', gridTemplateColumns: '44px 1fr', columnGap: 14, alignItems: 'center', cursor: 'default' }}>
      <motion.span style={{
        fontFamily: "'Syne Mono',monospace", fontSize: 9, letterSpacing: 0.8,
        color: hovered ? GOLD_BRIGHT : 'rgba(240,237,230,0.4)',
        transition: 'color 0.18s ease', zIndex: hovered ? 5 : 'auto', position: 'relative'
      }}>
        A{index.toString().padStart(2, '0')}
      </motion.span>
      <div style={{
        position: 'relative', height: hovered ? 11 : 7, borderRadius: 2,
        background: hovered ? 'rgba(201,168,76,0.1)' : 'rgba(201,168,76,0.05)',
        border: `1px solid ${hovered ? GOLD_MID : GOLD_DIM}`,
        transition: 'all 0.18s ease', overflow: 'hidden'
      }}>
        <motion.div style={{
          position: 'absolute', top: 0, bottom: 0, width: '30%', borderRadius: 1,
          background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.85), transparent)'
        }}
          animate={phase ? { left: ['-30%', '105%'] } : { left: '-30%' }}
          transition={{ duration: 2.15, repeat: phase ? Infinity : 0, ease: 'linear', delay: index * 0.055 }} />
        <AnimatePresence>
          {hovered && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
                fontFamily: "'Syne Mono',monospace", fontSize: 7, color: GOLD, letterSpacing: 1
              }}>
              {bit}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {hovered && (
          <motion.span initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            style={{
              fontFamily: "'Syne Mono',monospace", fontSize: 7, color: 'rgba(240,237,230,0.35)',
              letterSpacing: 0.5, gridColumn: '1/-1'
            }}>
            Row {Math.floor(index / 4)} · Col {index % 4} · {bit ? 'HIGH' : 'LOW'}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Control strobe ───────────────────────────────────────────────────────────
const STROBE_INFO = {
  'RAS#': 'Row Address Strobe — opens the target row in the DRAM array',
  'CAS#': 'Column Address Strobe — selects the specific column to read/write',
  'WE#': 'Write Enable — pulled LOW during writes, HIGH during reads',
};
function ControlStrobe({ name, hint, index, phase }) {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!phase) return;
    const cycle = () => {
      setActive(true);
      setTimeout(() => setActive(false), 340 + index * 80);
    };
    const id = setInterval(cycle, 2600 + index * 380);
    return () => clearInterval(id);
  }, [phase, index]);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'default' }}>
      <div style={{
        fontFamily: "'Syne Mono',monospace", fontSize: 8, color: 'rgba(240,237,230,0.5)',
        marginBottom: 6, letterSpacing: 1
      }}>
        {name}<span style={{ color: 'rgba(240,237,230,0.22)', marginLeft: 6 }}>{hint}</span>
      </div>
      <motion.div style={{
        height: 28, position: 'relative', background: 'rgba(0,0,0,0.45)',
        borderRadius: 4, border: `1px solid ${hovered || active ? GOLD_MID : GOLD_DIM}`,
        transition: 'border-color 0.2s ease', overflow: 'hidden'
      }}>
        <motion.div style={{
          position: 'absolute', bottom: 3, left: '10%', right: '10%',
          borderRadius: 2, background: `linear-gradient(180deg, ${GOLD}, rgba(201,168,76,0.35))`,
          transformOrigin: '50% 100%'
        }}
          animate={phase ? { height: active ? ['28%', '72%', '28%'] : '28%', opacity: active ? [0.35, 1, 0.35] : 0.35 } : { height: '28%', opacity: 0.35 }}
          transition={{ duration: 0.38, ease: 'easeOut' }} />
        <AnimatePresence>
          {hovered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                fontFamily: "'Syne Mono',monospace", fontSize: 6.5, letterSpacing: 0.5,
                color: 'rgba(240,237,230,0.7)', padding: '0 8px', textAlign: 'center', lineHeight: 1.4
              }}>
              {STROBE_INFO[name]}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ─── DIMM module ─────────────────────────────────────────────────────────────
function CapacitorCell({ index, phase, onHover }) {
  const [hovered, setHovered] = useState(false);
  const [charged, setCharged] = useState(() => Math.random() > 0.5);
  const row = Math.floor(index / 8);
  const col = index % 8;
  const wave = (row + col) * 0.04;

  const handleEnter = useCallback(() => { setHovered(true); onHover(index, row, col, charged); }, [index, row, col, charged, onHover]);
  const handleLeave = useCallback(() => { setHovered(false); onHover(null); }, [onHover]);

  useEffect(() => {
    if (!phase) return;
    const id = setInterval(() => setCharged(c => !c), 3000 + index * 77);
    return () => clearInterval(id);
  }, [phase, index]);

  return (
    <motion.div onMouseEnter={handleEnter} onMouseLeave={handleLeave}
      style={{
        aspectRatio: '1', borderRadius: 3,
        border: `1px solid ${hovered ? GOLD_MID : GOLD_DIM}`,
        background: hovered
          ? 'linear-gradient(145deg, rgba(201,168,76,0.18), rgba(7,7,7,0.98))'
          : 'linear-gradient(145deg, rgba(15,15,15,0.95), rgba(7,7,7,0.98))',
        position: 'relative', overflow: 'hidden', cursor: 'crosshair',
        boxShadow: hovered ? '0 0 14px rgba(201,168,76,0.4), 0 0 4px rgba(201,168,76,0.2)' : 'none',
        transform: hovered ? 'scale(1.22)' : 'scale(1)',
        zIndex: hovered ? 10 : 'auto',
        transition: 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease'
      }}
      initial={{ opacity: 0, scale: 0.65 }}
      animate={{ opacity: phase ? 1 : 0, scale: phase ? 1 : 0.65 }}
      transition={{ opacity: { delay: wave, duration: 0.45, ease: EASE }, scale: { delay: wave, duration: 0.45, ease: EASE } }}>
      <motion.div style={{
        position: 'absolute', inset: 2, borderRadius: 2,
        background: `linear-gradient(135deg, ${charged ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.1)'} 0%, transparent 55%)`,
        opacity: 0.5
      }}
        animate={{ opacity: [0.2, charged ? 0.65 : 0.3, 0.2] }}
        transition={{ duration: 2.4 + (index % 5) * 0.15, repeat: Infinity, ease: 'easeInOut' }} />
      {hovered && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Syne Mono',monospace", fontSize: 7, color: charged ? GOLD_BRIGHT : 'rgba(240,237,230,0.4)',
          fontWeight: 700, zIndex: 2
        }}>
          {charged ? '1' : '0'}
        </div>
      )}
    </motion.div>
  );
}

function RefreshSweep() {
  return (
    <motion.div aria-hidden style={{
      position: 'absolute', left: 0, right: 0, height: '28%', top: '-30%',
      pointerEvents: 'none', zIndex: 4,
      background: 'linear-gradient(180deg, transparent 0%, rgba(201,168,76,0.12) 45%, rgba(201,168,76,0.02) 55%, transparent 100%)'
    }}
      animate={{ top: ['-30%', '110%'] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }} />
  );
}

function MemoryModuleVisual({ phase }) {
  const cells = useMemo(() => Array.from({ length: 40 }, (_, i) => i), []);
  const [hoveredInfo, setHoveredInfo] = useState(null);
  const handleHover = useCallback((idx, row, col, charged) => {
    if (idx === null) setHoveredInfo(null);
    else setHoveredInfo({ idx, row, col, charged });
  }, []);
  return (
    <div style={{ position: 'relative' }}>
      <motion.div
        initial={{ opacity: 0.75, scale: 3.85, y: -56, filter: 'blur(14px)', rotateX: 8 }}
        animate={{ opacity: phase ? 1 : 0, scale: phase ? 1 : 3.85, y: phase ? 0 : -56, filter: phase ? 'blur(0px)' : 'blur(14px)', rotateX: phase ? 0 : 8 }}
        transition={{ duration: 1.15, delay: phase ? 0.18 : 0, ease: EASE }}
        style={{
          transformOrigin: '50% 42%', transformStyle: 'preserve-3d', perspective: 900,
          position: 'relative', borderRadius: 20, padding: 'clamp(16px,3vw,28px)',
          border: `1px solid ${GOLD_MID}`,
          background: 'linear-gradient(165deg, rgba(18,18,18,0.95) 0%, rgba(5,5,5,0.98) 100%)',
          boxShadow: `0 28px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(201,168,76,0.08), 0 0 60px ${GOLD_DIM}`,
          overflow: 'hidden', maxWidth: 420, margin: '0 auto'
        }}>
        <RefreshSweep />
        {/* DIMM contacts */}
        <div style={{
          position: 'absolute', bottom: 0, left: '18%', right: '18%', height: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 6, paddingBottom: 4, zIndex: 2
        }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.div key={i} style={{ flex: 1, height: 5, borderRadius: 1, background: GOLD_DIM }}
              animate={{ opacity: [0.35, 0.85, 0.35] }}
              transition={{ duration: 1.8, delay: i * 0.08, repeat: Infinity, ease: 'easeInOut' }} />
          ))}
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 6,
          position: 'relative', zIndex: 3, paddingBottom: 18
        }}>
          {cells.map(i => <CapacitorCell key={i} index={i} phase={phase} onHover={handleHover} />)}
        </div>
        <motion.div style={{
          position: 'absolute', top: 12, right: 14,
          fontFamily: "'Syne Mono',monospace", fontSize: 8, letterSpacing: 2, color: GOLD, textTransform: 'uppercase', zIndex: 5
        }}
          animate={{ opacity: [0.45, 1, 0.45] }} transition={{ duration: 2.5, repeat: Infinity }}>
          ROW ACTIVATION
        </motion.div>
      </motion.div>
      {/* Hover info tooltip */}
      <AnimatePresence>
        {hoveredInfo && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            style={{
              position: 'absolute', bottom: -52, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(10,10,10,0.92)', border: `1px solid ${GOLD_MID}`, borderRadius: 10,
              padding: '8px 16px', whiteSpace: 'nowrap', zIndex: 20,
              fontFamily: "'Syne Mono',monospace", fontSize: 9, letterSpacing: 1.2, color: GOLD,
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
            }}>
            Cell [{hoveredInfo.row},{hoveredInfo.col}] · Bit: <span style={{ color: hoveredInfo.charged ? GOLD_BRIGHT : 'rgba(240,237,230,0.4)' }}>{hoveredInfo.charged ? '1' : '0'}</span>
            {' · '}<span style={{ color: hoveredInfo.charged ? 'rgba(201,168,76,0.9)' : 'rgba(201,168,76,0.4)' }}>{hoveredInfo.charged ? 'CHARGED' : 'DISCHARGED'}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Live stat counter ────────────────────────────────────────────────────────
function LiveStat({ label, value, unit, sub, color = GOLD, active }) {
  const num = useCountUp(active ? value : 0, 1200);
  return (
    <motion.div whileHover={{ scale: 1.03, boxShadow: `0 0 28px rgba(201,168,76,0.18)` }}
      style={{
        borderRadius: 14, border: `1px solid ${GOLD_DIM}`, padding: '20px 22px',
        background: 'rgba(10,10,10,0.8)', cursor: 'default', transition: 'box-shadow 0.2s ease'
      }}>
      <p style={{
        fontFamily: "'Syne Mono',monospace", fontSize: 8, letterSpacing: 2,
        color: GOLD, margin: 0, textTransform: 'uppercase'
      }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '10px 0 4px' }}>
        <span style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 300,
          color: '#F0EDE6', lineHeight: 1
        }}>{active ? num.toLocaleString() : '—'}</span>
        <span style={{ fontFamily: "'Syne Mono',monospace", fontSize: 9, color: GOLD, letterSpacing: 2 }}>{unit}</span>
      </div>
      <p style={{
        fontFamily: "'Syne Mono',monospace", fontSize: 8, color: 'rgba(240,237,230,0.35)',
        margin: 0, letterSpacing: 0.5
      }}>{sub}</p>
    </motion.div>
  );
}

// ─── Scroll progress bar ──────────────────────────────────────────────────────
function ScrollProgressBar({ progress }) {
  const width = useTransform(progress, [0, 1], ['0%', '100%']);
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 100,
      background: 'rgba(201,168,76,0.08)'
    }}>
      <motion.div style={{
        height: '100%', width, background: GOLD,
        boxShadow: '0 0 8px rgba(201,168,76,0.6)'
      }} />
    </div>
  );
}

// ─── Phase indicator ──────────────────────────────────────────────────────────
const PHASE_LABELS = ['INIT', 'ARRAY', 'ADDR BUS', 'RW OPS', 'STATS'];
function PhaseIndicator({ currentPhase }) {
  return (
    <motion.div style={{
      position: 'fixed', right: '2vw', top: '50%', transform: 'translateY(-50%)',
      zIndex: 50, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center'
    }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
      {PHASE_LABELS.map((label, i) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'row-reverse', cursor: 'default' }}>
          <motion.div animate={{
            scale: currentPhase === i ? 1.4 : 1,
            background: currentPhase === i ? GOLD_BRIGHT : currentPhase > i ? GOLD_MID : GOLD_DIM,
            boxShadow: currentPhase === i ? '0 0 12px rgba(201,168,76,0.8)' : 'none'
          }}
            style={{ width: 6, height: 6, borderRadius: '50%' }}
            transition={{ duration: 0.3, ease: EASE }} />
          <AnimatePresence>
            {currentPhase === i && (
              <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                style={{
                  fontFamily: "'Syne Mono',monospace", fontSize: 7, letterSpacing: 2,
                  color: GOLD, textTransform: 'uppercase', whiteSpace: 'nowrap'
                }}>
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      ))}
    </motion.div>
  );
}

// ─── Hero-style intro panel (sticky phase 0) ──────────────────────────────────
function MemoryIntroPanel({ smooth }) {
  const opacity = useTransform(smooth, [0, 0.08, 0.22, 0.28], [0, 1, 1, 0]);
  const y = useTransform(smooth, [0, 0.08, 0.26], [32, 0, -24]);
  const iconBob = { y: [0, -5, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } };
  return (
    <motion.div style={{ opacity, y, textAlign: 'center', pointerEvents: 'none' }}>
      <motion.div animate={iconBob} style={{
        display: 'inline-flex', padding: 20, borderRadius: 24,
        border: `1px solid ${GOLD_DIM}`, background: 'linear-gradient(145deg,#0f0f0f,#070707)',
        boxShadow: `0 20px 50px rgba(0,0,0,0.45), inset 0 0 24px ${GOLD_DIM}`, marginBottom: 24
      }}>
        <MemoryStick color={GOLD} size={46} strokeWidth={1.1} />
      </motion.div>
      <div style={{
        fontFamily: "'Syne Mono',monospace", fontSize: 11, letterSpacing: 8,
        color: GOLD, textTransform: 'uppercase', marginBottom: 12
      }}>
        Subsystem · volatile store
      </div>
      <motion.h1 initial={{ letterSpacing: '-0.02em', filter: 'blur(14px)' }}
        animate={{ letterSpacing: '0.02em', filter: 'blur(0px)' }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
        style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2rem,7vw,3.75rem)',
          fontWeight: 300, color: '#F0EDE6', margin: '0 0 16px', fontStyle: 'italic',
          textShadow: '0 0 36px rgba(240,237,230,0.12)'
        }}>
        Inside <span style={{ color: GOLD }}>DRAM</span>
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1rem,2.2vw,1.2rem)',
          fontWeight: 300, color: 'rgba(240,237,230,0.6)', maxWidth: 520, margin: '0 auto',
          lineHeight: 1.6
        }}>
        Billions of tiny capacitors hold charge for milliseconds. Rows wake, columns align,
        and data races the bus back to the core — fast, fragile, and endlessly refreshing.
      </motion.p>
      <motion.div style={{
        marginTop: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, fontFamily: "'Syne Mono',monospace", fontSize: 8, letterSpacing: 4,
        color: 'rgba(201,168,76,0.45)', textTransform: 'uppercase'
      }}
        animate={{ opacity: [0.45, 0.9, 0.45] }} transition={{ duration: 2, repeat: Infinity }}>
        <div style={{ width: 40, height: 1, background: `linear-gradient(90deg,transparent,${GOLD_MID})` }} />
        Scroll to explore
        <div style={{ width: 40, height: 1, background: `linear-gradient(270deg,transparent,${GOLD_MID})` }} />
      </motion.div>
    </motion.div>
  );
}

// ─── DIMM zoom panel (sticky phase 1) ────────────────────────────────────────
function DimmZoomPanel({ smooth, phase }) {
  const opacity = useTransform(smooth, [0.24, 0.32, 0.48, 0.56], [0, 1, 1, 0]);
  const scale = useTransform(smooth, [0.24, 0.32], [0.92, 1]);
  const zoom = useTransform(smooth, [0.32, 0.52], [1, 1.12]);
  return (
    <motion.div style={{ opacity, scale }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <span style={{
          fontFamily: "'Syne Mono',monospace", fontSize: 10, letterSpacing: 4,
          color: GOLD, textTransform: 'uppercase'
        }}>DRAM capacitor array</span>
        <p style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(0.9rem,2vw,1.1rem)',
          color: 'rgba(240,237,230,0.5)', margin: '8px auto 0', maxWidth: 420, lineHeight: 1.5
        }}>
          Hover any cell to probe its charge state. Each square is one bit — a world of data in miniature.
        </p>
      </div>
      <motion.div style={{ scale: zoom, transformOrigin: '50% 50%' }}>
        <MemoryModuleVisual phase={phase} />
      </motion.div>
    </motion.div>
  );
}

// ─── Address bus panel (sticky phase 2) ──────────────────────────────────────
function AddressBusPanel({ smooth, phase, ingressFlash }) {
  const opacity = useTransform(smooth, [0.50, 0.58, 0.72, 0.80], [0, 1, 1, 0]);
  const x = useTransform(smooth, [0.50, 0.58], [-40, 0]);
  return (
    <motion.div style={{ opacity, x, width: '100%', maxWidth: 700, margin: '0 auto' }}>
      <motion.section style={{
        borderRadius: 20,
        border: `1px solid ${ingressFlash ? GOLD_MID : GOLD_DIM}`,
        padding: 'clamp(20px,3vw,28px)',
        background: 'linear-gradient(165deg,rgba(14,14,14,0.93),rgba(6,6,6,0.97))',
        boxShadow: ingressFlash ? `0 0 0 1px rgba(201,168,76,0.35), 0 20px 56px rgba(201,168,76,0.12)` : '0 14px 44px rgba(0,0,0,0.38)',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
      }}>
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: 14, marginBottom: 22
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CircuitBoard size={20} color={GOLD} strokeWidth={1.15} />
            <div>
              <p style={{
                margin: 0, fontFamily: "'Syne Mono',monospace", fontSize: 10, letterSpacing: 3,
                color: GOLD, textTransform: 'uppercase'
              }}>Address bus</p>
              <p style={{
                margin: '6px 0 0', fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic',
                fontSize: 14, fontWeight: 300, color: 'rgba(240,237,230,0.5)', maxWidth: 320, lineHeight: 1.4
              }}>
                Hover a lane to see its current logic level. RAS pulses first, then CAS.
              </p>
            </div>
          </div>
          <motion.div animate={ingressFlash ? { scale: [1, 1.06, 1] } : {}}
            style={{
              fontFamily: "'Syne Mono',monospace", fontSize: 8, letterSpacing: 2,
              color: GOLD, textTransform: 'uppercase', padding: '7px 14px', borderRadius: 10,
              border: `1px solid ${GOLD_MID}`, background: 'rgba(201,168,76,0.07)', whiteSpace: 'nowrap'
            }}>
            {ingressFlash ? '⚡ PACKET BURST' : 'Packet ingress'}
          </motion.div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: 32, rowGap: 8 }}>
          {Array.from({ length: 16 }, (_, i) => <AddressBitLane key={i} index={i} phase={phase} />)}
        </div>
        {/* Control strobes */}
        <div style={{ marginTop: 24, paddingTop: 18, borderTop: `1px solid ${GOLD_DIM}` }}>
          <p style={{
            fontFamily: "'Syne Mono',monospace", fontSize: 8, letterSpacing: 2,
            color: GOLD, margin: '0 0 14px', textTransform: 'uppercase'
          }}>
            Control strobes <span style={{ color: 'rgba(240,237,230,0.3)', fontSize: 7, letterSpacing: 1 }}>— hover for description</span>
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12 }}>
            {[{ name: 'RAS#', hint: 'row addr' }, { name: 'CAS#', hint: 'column' }, { name: 'WE#', hint: 'write en' }].map((s, i) =>
              <ControlStrobe key={s.name} name={s.name} hint={s.hint} index={i} phase={phase} />
            )}
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

// ─── Read/Write ops panel (sticky phase 3) ────────────────────────────────────
function RWOpsPanel({ smooth, phase }) {
  const opacity = useTransform(smooth, [0.74, 0.82, 0.92, 0.97], [0, 1, 1, 0]);
  const y = useTransform(smooth, [0.74, 0.82], [40, 0]);
  return (
    <motion.div style={{ opacity, y, width: '100%' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,320px)', gap: 24,
        maxWidth: 900, margin: '0 auto'
      }}>
        {/* Left: DIMM + bus activity */}
        <div style={{
          borderRadius: 18, border: `1px solid ${GOLD_DIM}`,
          padding: '24px', background: 'linear-gradient(165deg,rgba(14,14,14,0.93),rgba(6,6,6,0.97))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Activity size={16} color={GOLD} strokeWidth={1.2} />
            <span style={{
              fontFamily: "'Syne Mono',monospace", fontSize: 10, letterSpacing: 3,
              color: GOLD, textTransform: 'uppercase'
            }}>Memory bus activity</span>
          </div>
          <BusPulse label="ADDRESS BUS (16-bit multiplexed)" />
          <div style={{ height: 18 }} />
          <BusPulse label="DATA BUS (64-bit burst)" reverse color="rgba(201,168,76,0.8)" />
          <div style={{ height: 18 }} />
          <BusPulse label="COMMAND CHANNEL" color="rgba(201,168,76,0.5)" />
          <div style={{ marginTop: 22, paddingTop: 16, borderTop: `1px solid ${GOLD_DIM}` }}>
            <p style={{
              fontFamily: "'Syne Mono',monospace", fontSize: 8.5, letterSpacing: 0.8,
              color: 'rgba(240,237,230,0.4)', margin: 0, lineHeight: 1.7
            }}>
              Physical addresses are latched at the controller; <span style={{ color: GOLD }}>MEM_RD</span> /{' '}
              <span style={{ color: GOLD }}>MEM_WR</span> qualify the burst.{' '}
              RAS/CAS sequence opens the row buffer, then walks column addresses for the 64 B cache line fill.
            </p>
          </div>
        </div>
        {/* Right: hex ticker + refresh timer */}
        <div>
          <div style={{
            borderRadius: 18, border: `1px solid ${GOLD_DIM}`,
            padding: '22px 22px 18px', background: 'linear-gradient(180deg,rgba(16,16,16,0.9),rgba(6,6,6,0.96))',
            marginBottom: 18
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <Binary size={16} color={GOLD} strokeWidth={1.2} />
              <span style={{
                fontFamily: "'Syne Mono',monospace", fontSize: 10, letterSpacing: 3,
                color: GOLD, textTransform: 'uppercase'
              }}>Address trace</span>
            </div>
            <HexTicker active={phase} />
            <div style={{ marginTop: 8, display: 'flex', gap: 16 }}>
              <span style={{
                fontFamily: "'Syne Mono',monospace", fontSize: 7, letterSpacing: 1.5,
                color: 'rgba(201,168,76,0.8)', border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: 4, padding: '2px 6px'
              }}>RD = read</span>
              <span style={{
                fontFamily: "'Syne Mono',monospace", fontSize: 7, letterSpacing: 1.5,
                color: 'rgba(201,168,76,0.5)', border: '1px solid rgba(201,168,76,0.2)',
                borderRadius: 4, padding: '2px 6px'
              }}>WR = write</span>
            </div>
          </div>
          <motion.div style={{
            borderRadius: 18, border: `1px solid ${GOLD_DIM}`,
            padding: '18px 20px', background: 'linear-gradient(180deg,rgba(16,16,16,0.9),rgba(6,6,6,0.96))',
            display: 'flex', alignItems: 'center', gap: 14
          }}
            animate={{ opacity: [0.85, 1, 0.85] }} transition={{ duration: 2.2, repeat: Infinity }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
              <RefreshCw size={15} color={GOLD} strokeWidth={1.2} />
            </motion.div>
            <div>
              <p style={{
                fontFamily: "'Syne Mono',monospace", fontSize: 8, letterSpacing: 2,
                color: GOLD, margin: 0, textTransform: 'uppercase'
              }}>DRAM refresh</p>
              <p style={{
                fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 300,
                color: '#F0EDE6', margin: '4px 0 0'
              }}>~64 ms window</p>
              <p style={{
                fontFamily: "'Syne Mono',monospace", fontSize: 7.5, color: 'rgba(240,237,230,0.35)',
                margin: '2px 0 0', letterSpacing: 0.5
              }}>~8192 rows refreshed per cycle</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Stats panel (final phase) ───────────────────────────────────────────────
function StatsPanel({ smooth, phase }) {
  const opacity = useTransform(smooth, [0.92, 0.98], [0, 1]);
  const y = useTransform(smooth, [0.92, 0.98], [32, 0]);
  return (
    <motion.div style={{ opacity, y, width: '100%', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <span style={{
          fontFamily: "'Syne Mono',monospace", fontSize: 9, letterSpacing: 4,
          color: GOLD, textTransform: 'uppercase'
        }}>System performance</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        <LiveStat label="Typical latency" value={50} unit="ns" sub="ROW → COLUMN → OUTPUT" active={phase} />
        <LiveStat label="Peak bandwidth" value={51200} unit="MB/s" sub="DDR5-6400 dual channel" active={phase} />
        <LiveStat label="Refresh rate" value={64} unit="ms" sub="8192 rows · 7.8 µs per row" active={phase} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 16 }}>
        {[
          { k: 'Channel width', v: '64-bit', sub: 'per DIMM slot' },
          { k: 'Hierarchy', v: 'L3 → RAM', sub: 'capacitor grid store' },
          { k: 'Voltage', v: '1.1 V', sub: 'LPDDR5 nominal' },
        ].map(stat => (
          <motion.div key={stat.k} whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(201,168,76,0.15)' }}
            style={{
              borderRadius: 14, border: `1px solid ${GOLD_DIM}`, padding: '18px 20px',
              background: 'rgba(10,10,10,0.8)', cursor: 'default', transition: 'box-shadow 0.2s ease'
            }}>
            <p style={{
              fontFamily: "'Syne Mono',monospace", fontSize: 8, letterSpacing: 2,
              color: GOLD, margin: 0, textTransform: 'uppercase'
            }}>{stat.k}</p>
            <p style={{
              fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 300,
              color: '#F0EDE6', margin: '8px 0 4px'
            }}>{stat.v}</p>
            <p style={{
              fontFamily: "'Syne Mono',monospace", fontSize: 8.5, color: 'rgba(240,237,230,0.38)',
              margin: 0, letterSpacing: 0.5
            }}>{stat.sub}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Root Memory component ────────────────────────────────────────────────────
const Memory = ({ arrivalKey = 0, onBack, onContinue }) => {
  const [phase, setPhase] = useState(true);
  const [ingressFlash, setIngressFlash] = useState(false);
  const scrollRootRef = useRef(null);
  const handoffRef = useRef(false);
  const accumRef = useRef(0);

  const { scrollYProgress } = useScroll({ container: scrollRootRef, offset: ['start start', 'end start'] });
  const { scrollY } = useScroll({ container: scrollRootRef });
  const smooth = useSpring(scrollYProgress, { stiffness: 55, damping: 22 });

  // scroll phase index (for side indicator)
  const [scrollPhase, setScrollPhase] = useState(0);
  useMotionValueEvent(smooth, 'change', (v) => {
    if (v < 0.26) setScrollPhase(0);
    else if (v < 0.54) setScrollPhase(1);
    else if (v < 0.78) setScrollPhase(2);
    else if (v < 0.94) setScrollPhase(3);
    else setScrollPhase(4);
  });

  // back handoff on over-scroll up
  useMotionValueEvent(scrollY, 'change', (v) => {
    if (v < -40 && !handoffRef.current) { handoffRef.current = true; onBack(); }
  });
  const handleWheel = (e) => {
    if (handoffRef.current) return;
    if (scrollRootRef.current?.scrollTop <= 0 && e.deltaY < 0) {
      accumRef.current -= e.deltaY;
      if (accumRef.current > 50) { handoffRef.current = true; onBack(); }
    } else { accumRef.current = 0; }
  };

  // scroll-down handoff → GPU
  useEffect(() => {
    const el = scrollRootRef.current;
    if (!el || !onContinue) return;
    const check = () => {
      if (handoffRef.current) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 6) {
        handoffRef.current = true;
        onContinue();
      }
    };
    el.addEventListener('scroll', check, { passive: true });
    return () => el.removeEventListener('scroll', check);
  }, [onContinue]);

  // mount phase
  useEffect(() => { const t = requestAnimationFrame(() => setPhase(true)); return () => cancelAnimationFrame(t); }, []);

  // ingress flash on arrival
  useEffect(() => {
    if (arrivalKey < 1) return;
    setIngressFlash(true);
    const id = setTimeout(() => setIngressFlash(false), 980);
    return () => clearTimeout(id);
  }, [arrivalKey]);

  return (
    <div ref={scrollRootRef} onWheel={handleWheel}
      style={{
        position: 'relative', height: '100%', width: '100%', backgroundColor: BG_DARK,
        overflowX: 'hidden', overflowY: 'auto', WebkitOverflowScrolling: 'touch'
      }}>

      <ScrollProgressBar progress={smooth} />
      <PhaseIndicator currentPhase={scrollPhase} />

      <BgLayers scrollYProgress={smooth} />

      {/* pull-up hint */}
      <motion.div style={{
        position: 'absolute', top: 14, width: '100%', textAlign: 'center',
        fontFamily: "'Syne Mono',monospace", fontSize: '8px', color: GOLD,
        opacity: 0.7, pointerEvents: 'none', zIndex: 50, letterSpacing: 3
      }}
        animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
        ↑ PULL UP · RETURN TO CPU
      </motion.div>

      {/* ── Scroll narrative: 500vh tall ── */}
      <section style={{ position: 'relative', height: '500vh', background: BG_DARK }}>
        <div style={{
          position: 'sticky', top: 0, height: '100dvh', display: 'flex',
          alignItems: 'center', justifyContent: 'center', overflow: 'hidden', zIndex: 10
        }}>
          <div style={{
            position: 'relative', zIndex: 10, width: '100%', padding: '0 clamp(20px,5vw,60px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>

            <AnimatePresence>
              {phase && (
                <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
                  style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr', placeItems: 'center' }}>

                  <div style={{ gridArea: '1/1', width: '100%', display: 'flex', justifyContent: 'center', zIndex: scrollPhase === 0 ? 5 : 1, pointerEvents: scrollPhase === 0 ? 'auto' : 'none' }}>
                    <MemoryIntroPanel smooth={smooth} />
                  </div>
                  <div style={{ gridArea: '1/1', width: '100%', display: 'flex', justifyContent: 'center', zIndex: scrollPhase === 1 ? 5 : 1, pointerEvents: scrollPhase === 1 ? 'auto' : 'none' }}>
                    <DimmZoomPanel smooth={smooth} phase={phase} />
                  </div>
                  <div style={{ gridArea: '1/1', width: '100%', display: 'flex', justifyContent: 'center', zIndex: scrollPhase === 2 ? 5 : 1, pointerEvents: scrollPhase === 2 ? 'auto' : 'none' }}>
                    <AddressBusPanel smooth={smooth} phase={phase} ingressFlash={ingressFlash} />
                  </div>
                  <div style={{ gridArea: '1/1', width: '100%', display: 'flex', justifyContent: 'center', zIndex: scrollPhase === 3 ? 5 : 1, pointerEvents: scrollPhase === 3 ? 'auto' : 'none' }}>
                    <RWOpsPanel smooth={smooth} phase={phase} />
                  </div>
                  <div style={{ gridArea: '1/1', width: '100%', display: 'flex', justifyContent: 'center', zIndex: scrollPhase === 4 ? 5 : 1, pointerEvents: scrollPhase === 4 ? 'auto' : 'none' }}>
                    <StatsPanel smooth={smooth} phase={phase} />
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Memory;

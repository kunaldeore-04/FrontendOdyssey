import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import { CircuitBoard, Cpu, MemoryStick, Layers, Usb, Wifi, Battery } from 'lucide-react';

// ─── Design tokens — matte black / gold PCB palette ───────────────────────────
const GOLD = 'rgba(201, 168, 76, 0.9)';
const GOLD_DIM = 'rgba(201, 168, 76, 0.15)';
const GOLD_MID = 'rgba(201, 168, 76, 0.45)';
const GOLD_BRIGHT = 'rgba(201, 168, 76, 1)';
const BG_DARK = '#070707';  // slightly tinted for PCB feel
const BG_PCB = 'rgba(18, 18, 18, 0.97)';
const EASE = [0.22, 1, 0.36, 1];

// ─── Background ───────────────────────────────────────────────────────────────
function BgLayers({ scrollYProgress }) {
  const glowY = useTransform(scrollYProgress, [0, 1], [20, -50]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const grainY = useTransform(scrollYProgress, [0, 1], [0, -18]);
  return (<>
    <motion.div aria-hidden style={{
      position: 'fixed', inset: '-150px', pointerEvents: 'none', zIndex: 40, opacity: 0.3, y: grainY,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundSize: '160px 160px'
    }} />
    <motion.div aria-hidden style={{
      position: 'fixed', inset: '-150px', pointerEvents: 'none', zIndex: 3,
      background: 'radial-gradient(ellipse 88% 88% at 50% 45%, transparent 30%, #070707 100%)'
    }} />
    <motion.div aria-hidden style={{
      position: 'fixed', inset: '-150px', pointerEvents: 'none', zIndex: 1, y: glowY,
      background: 'radial-gradient(ellipse 55% 48% at 50% 32%, rgba(201,168,76,0.06) 0%, transparent 65%)'
    }} />
    <motion.div aria-hidden style={{
      position: 'fixed', inset: '-150px', pointerEvents: 'none', zIndex: 2, y: gridY,
      backgroundImage: `linear-gradient(${GOLD_DIM} 1px, transparent 1px), linear-gradient(90deg, ${GOLD_DIM} 1px, transparent 1px)`,
      backgroundSize: '72px 72px', opacity: 0.2
    }} />
  </>);
}

// ─── Scroll progress bar ──────────────────────────────────────────────────────
function ScrollProgressBar({ progress }) {
  const width = useTransform(progress, [0, 1], ['0%', '100%']);
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 100, background: GOLD_DIM }}>
      <motion.div style={{ height: '100%', width, background: GOLD, boxShadow: '0 0 8px rgba(201,168,76,0.6)' }} />
    </div>
  );
}

// ─── Phase indicator ──────────────────────────────────────────────────────────
const PHASE_LABELS = ['INIT', 'PCB MAP', 'DATA TRACES', 'CHIPSET', 'OVERVIEW'];
function PhaseIndicator({ currentPhase }) {
  return (
    <motion.div style={{
      position: 'fixed', right: '2vw', top: '50%', transform: 'translateY(-50%)',
      zIndex: 50, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center'
    }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
      {PHASE_LABELS.map((label, i) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'row-reverse', cursor: 'default' }}>
          <motion.div
            animate={{
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

// ─── PCB component slot ───────────────────────────────────────────────────────
const SLOT_INFO = {
  CPU: { icon: Cpu, color: GOLD, desc: 'LGA 1700 socket · 26-core · 5nm', sub: 'Raptor Lake' },
  RAM: { icon: MemoryStick, color: 'rgba(201,168,76,0.85)', desc: 'DDR5-6400 · 4 DIMM slots · 192 GB max', sub: 'XMP 3.0 ready' },
  GPU: { icon: Layers, color: 'rgba(168,100,255,0.9)', desc: 'PCIe 5.0 x16 · primary slot', sub: '128 GT/s bandwidth' },
  NVMe: { icon: CircuitBoard, color: GOLD, desc: 'M.2 NVMe Gen 5 · 14 GB/s read', sub: 'PCIe 5.0 x4' },
  USB: { icon: Usb, color: 'rgba(100,160,255,0.85)', desc: 'USB4 Gen3 · 40 Gbps each', sub: '4× rear panel' },
  WiFi: { icon: Wifi, color: 'rgba(80,200,200,0.85)', desc: 'Wi-Fi 7 · 2.4 / 5 / 6 GHz', sub: 'Bluetooth 5.4' },
};

function ComponentSlot({ name, phase, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  const info = SLOT_INFO[name];
  const Icon = info.icon;
  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: phase ? 1 : 0, scale: phase ? 1 : 0.85 }}
      transition={{ delay: phase ? delay : 0, duration: 0.5, ease: EASE }}
      whileHover={{ scale: 1.05 }}
      style={{
        borderRadius: 12,
        border: `1px solid ${hovered ? info.color : GOLD_DIM}`,
        background: hovered
          ? `linear-gradient(145deg, ${info.color.replace('0.9', '0.08')}, ${BG_PCB})`
          : `linear-gradient(145deg, rgba(16, 16, 16,0.9), ${BG_PCB})`,
        padding: '18px 16px', cursor: 'default', position: 'relative', overflow: 'hidden',
        boxShadow: hovered ? `0 0 20px ${info.color.replace('0.9', '0.25')}` : 'none',
        transition: 'box-shadow 0.22s ease, border-color 0.22s ease, background 0.22s ease'
      }}>
      {/* gold trace lines on PCB */}
      {[0, 1].map(i => (
        <motion.div key={i} style={{
          position: 'absolute', left: 0, right: 0, height: 1,
          top: `${30 + i * 35}%`,
          background: `linear-gradient(90deg, transparent, ${hovered ? info.color.replace('0.9', '0.25') : GOLD_DIM}, transparent)`
        }}>
          <motion.div style={{
            position: 'absolute', top: 0, height: '100%', width: '30%',
            background: `linear-gradient(90deg, transparent, ${hovered ? info.color : GOLD}, transparent)`
          }} animate={{ left: i % 2 === 0 ? ['-30%', '130%'] : ['130%', '-30%'] }}
            transition={{ duration: 2 + i * 0.6, repeat: Infinity, ease: 'linear', delay: i * 0.4 + delay * 0.3 }} />
        </motion.div>
      ))}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Icon size={16} color={info.color} strokeWidth={1.3} />
          <span style={{
            fontFamily: "'Syne Mono',monospace", fontSize: 9, letterSpacing: 2.5,
            color: info.color, textTransform: 'uppercase'
          }}>
            {name}
          </span>
        </div>
        <div style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 13, fontWeight: 300,
          color: 'rgba(240,237,230,0.65)', lineHeight: 1.4, marginBottom: 4
        }}>
          {info.desc}
        </div>
        <div style={{ fontFamily: "'Syne Mono',monospace", fontSize: 7.5, color: 'rgba(240,237,230,0.3)', letterSpacing: 0.5 }}>
          {info.sub}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Data trace animation ─────────────────────────────────────────────────────
function DataTrace({ label, from, to, color = GOLD, delay = 0 }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontFamily: "'Syne Mono',monospace", fontSize: 8, letterSpacing: 1.5, color: 'rgba(240,237,230,0.4)' }}>
          {from}
        </span>
        <span style={{ fontFamily: "'Syne Mono',monospace", fontSize: 7, letterSpacing: 1, color: color, opacity: 0.6, padding: '1px 8px', border: `1px solid ${color.replace('0.9', '0.2')}`, borderRadius: 4 }}>
          {label}
        </span>
        <span style={{ fontFamily: "'Syne Mono',monospace", fontSize: 8, letterSpacing: 1.5, color: 'rgba(240,237,230,0.4)' }}>
          {to}
        </span>
      </div>
      <div style={{ position: 'relative', height: 4, borderRadius: 2, background: GOLD_DIM, overflow: 'hidden' }}>
        <motion.div style={{
          position: 'absolute', top: 0, height: '100%', width: '32%', borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`
        }} animate={{ left: ['-32%', '132%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay }} />
      </div>
    </div>
  );
}

// ─── Intro panel (phase 0) ────────────────────────────────────────────────────
function MBIntroPanel({ smooth }) {
  const opacity = useTransform(smooth, [0, 0.06, 0.10, 0.15], [0, 1, 1, 0]);
  const y = useTransform(smooth, [0, 0.06, 0.20], [32, 0, -24]);
  return (
    <motion.div style={{ opacity, y, textAlign: 'center', pointerEvents: 'none' }}>
      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          display: 'inline-flex', padding: 20, borderRadius: 24,
          border: `1px solid ${GOLD_DIM}`, background: 'linear-gradient(145deg,#0f0f0f,#070707)',
          boxShadow: `0 20px 50px rgba(0,0,0,0.45), inset 0 0 24px ${GOLD_DIM}`, marginBottom: 24
        }}>
        <CircuitBoard color={GOLD} size={46} strokeWidth={1.1} />
      </motion.div>
      <div style={{
        fontFamily: "'Syne Mono',monospace", fontSize: 11, letterSpacing: 8,
        color: GOLD, textTransform: 'uppercase', marginBottom: 12
      }}>
        Subsystem · system backbone
      </div>
      <motion.h1 initial={{ letterSpacing: '-0.02em', filter: 'blur(14px)' }}
        animate={{ letterSpacing: '0.02em', filter: 'blur(0px)' }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
        style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2rem,7vw,3.75rem)',
          fontWeight: 300, color: '#F0EDE6', margin: '0 0 16px', fontStyle: 'italic',
          textShadow: '0 0 36px rgba(240,237,230,0.12)'
        }}>
        Inside the <span style={{ color: GOLD }}>Motherboard</span>
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1rem,2.2vw,1.2rem)',
          fontWeight: 300, color: 'rgba(240,237,230,0.6)', maxWidth: 520, margin: '0 auto', lineHeight: 1.6
        }}>
        Gold traces etched into deep-black fibreglass connect every component — the silent
        city that carries data between CPU, RAM, GPU and the outside world.
      </motion.p>
      <motion.div style={{
        marginTop: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, fontFamily: "'Syne Mono',monospace", fontSize: 8, letterSpacing: 4,
        color: `rgba(201,168,76,0.45)`, textTransform: 'uppercase'
      }} animate={{ opacity: [0.45, 0.9, 0.45] }} transition={{ duration: 2, repeat: Infinity }}>
        <div style={{ width: 40, height: 1, background: `linear-gradient(90deg,transparent,${GOLD_MID})` }} />
        Scroll to explore
        <div style={{ width: 40, height: 1, background: `linear-gradient(270deg,transparent,${GOLD_MID})` }} />
      </motion.div>
    </motion.div>
  );
}

// ─── PCB component map (phase 1) ──────────────────────────────────────────────
function PCBMapPanel({ smooth, phase }) {
  const opacity = useTransform(smooth, [0.14, 0.18, 0.25, 0.3], [0, 1, 1, 0]);
  const scale = useTransform(smooth, [0.14, 0.18], [0.93, 1]);
  return (
    <motion.div style={{ opacity, scale, width: '100%', maxWidth: 780, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <span style={{ fontFamily: "'Syne Mono',monospace", fontSize: 10, letterSpacing: 4, color: GOLD, textTransform: 'uppercase' }}>
          Component Map
        </span>
        <p style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(0.9rem,2vw,1.1rem)',
          color: 'rgba(240,237,230,0.5)', margin: '8px auto 0', maxWidth: 440, lineHeight: 1.5
        }}>
          Hover each component slot to see its specification and role in the system.
        </p>
      </div>
      <motion.div style={{
        borderRadius: 20, border: `1px solid ${GOLD_MID}`,
        background: 'linear-gradient(165deg, rgba(14,14,14,0.93), rgba(6,6,6,0.97))',
        padding: 'clamp(16px,3vw,28px)',
        boxShadow: `0 28px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(201,168,76,0.08), 0 0 60px ${GOLD_DIM}`,
        position: 'relative'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {Object.keys(SLOT_INFO).map((name, i) => (
            <ComponentSlot key={name} name={name} phase={phase} delay={0.06 * i} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Data traces panel (phase 2) ──────────────────────────────────────────────
function DataTracesPanel({ smooth, phase }) {
  const opacity = useTransform(smooth, [0.3, 0.34, 0.55, 0.6], [0, 1, 1, 0]);
  const x = useTransform(smooth, [0.30, 0.34], [-40, 0]);
  return (
    <motion.div style={{ opacity, x, width: '100%', maxWidth: 720, margin: '0 auto' }}>
      <motion.section style={{
        borderRadius: 20, border: `1px solid ${GOLD_MID}`,
        padding: 'clamp(20px,3vw,28px)',
        background: `linear-gradient(165deg, rgba(16, 16, 16,0.93), ${BG_PCB})`,
        boxShadow: '0 20px 56px rgba(0,0,0,0.45)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Battery size={18} color={GOLD} strokeWidth={1.3} />
          <div>
            <p style={{ margin: 0, fontFamily: "'Syne Mono',monospace", fontSize: 10, letterSpacing: 3, color: GOLD, textTransform: 'uppercase' }}>
              System Bus Traces
            </p>
            <p style={{ margin: '5px 0 0', fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 13, fontWeight: 300, color: 'rgba(240,237,230,0.5)', lineHeight: 1.4 }}>
              Live data flowing between chips along copper traces
            </p>
          </div>
        </div>
        <DataTrace label="PCIe 5.0 x16" from="CPU" to="GPU" color="rgba(168,100,255,0.85)" delay={0} />
        <DataTrace label="DDR5-6400" from="CPU" to="RAM" color={GOLD} delay={0.3} />
        <DataTrace label="PCIe 5.0 x4" from="CPU" to="NVMe" color={GOLD} delay={0.6} />
        <DataTrace label="DMI 4.0" from="CPU" to="PCH" color="rgba(100,200,255,0.8)" delay={0.9} />
        <DataTrace label="USB4 Gen3" from="PCH" to="I/O" color="rgba(100,160,255,0.8)" delay={1.2} />
        <div style={{ marginTop: 20, paddingTop: 18, borderTop: `1px solid ${GOLD_DIM}` }}>
          <p style={{
            fontFamily: "'Syne Mono',monospace", fontSize: 8.5, letterSpacing: 0.7,
            color: 'rgba(240,237,230,0.38)', margin: 0, lineHeight: 1.7
          }}>
            Modern motherboards route <span style={{ color: GOLD }}>hundreds of differential pairs</span> with
            controlled impedance. Signal integrity teams use differential routing, guard traces,
            and length-matching to ensure every bit arrives intact.
          </p>
        </div>
      </motion.section>
    </motion.div>
  );
}

// ─── Chipset panel (phase 3) ──────────────────────────────────────────────────
const CHIPSETS = [
  { name: 'CPU Die', role: 'Raptor Lake · 26 cores', color: GOLD, lanes: '48× PCIe 5.0' },
  { name: 'PCH', role: 'Platform Controller Hub', color: GOLD, lanes: 'DMI 4.0 · USB · SATA' },
  { name: 'VRM', role: 'Voltage Regulator Module', color: 'rgba(255,140,80,0.85)', lanes: '18-phase · 350W TDC' },
  { name: 'EC', role: 'Embedded Controller', color: 'rgba(100,200,255,0.85)', lanes: 'Fan · RGB · sensors' },
];

function ChipsetNode({ chip, phase, delay }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: phase ? 1 : 0, y: phase ? 0 : 20 }}
      transition={{ delay: phase ? delay : 0, duration: 0.5, ease: EASE }}
      whileHover={{ scale: 1.06 }}
      style={{
        borderRadius: 14,
        border: `1px solid ${hovered ? chip.color : GOLD_DIM}`,
        background: hovered
          ? `linear-gradient(145deg, ${chip.color.replace('0.9', '0.1').replace('0.85', '0.1')}, ${BG_PCB})`
          : `linear-gradient(145deg, rgba(16, 16, 16,0.88), ${BG_PCB})`,
        padding: '20px 18px', cursor: 'default',
        boxShadow: hovered ? `0 0 22px ${chip.color.replace('0.9', '0.22').replace('0.85', '0.22')}` : 'none',
        transition: 'all 0.22s ease'
      }}>
      {/* pulsing corner dot */}
      <motion.div animate={{ opacity: [0.4, 1, 0.4], boxShadow: [`0 0 4px ${chip.color}`, `0 0 13px ${chip.color}`, `0 0 4px ${chip.color}`] }}
        transition={{ duration: 2 + delay, repeat: Infinity }}
        style={{ width: 7, height: 7, borderRadius: '50%', background: chip.color, marginBottom: 12 }} />
      <div style={{ fontFamily: "'Syne Mono',monospace", fontSize: 10, letterSpacing: 2.5, color: chip.color, textTransform: 'uppercase', marginBottom: 6 }}>
        {chip.name}
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontWeight: 300, color: 'rgba(240,237,230,0.65)', lineHeight: 1.4, marginBottom: 8 }}>
        {chip.role}
      </div>
      <div style={{ fontFamily: "'Syne Mono',monospace", fontSize: 7.5, color: 'rgba(240,237,230,0.32)', letterSpacing: 0.5 }}>
        {chip.lanes}
      </div>
    </motion.div>
  );
}

function ChipsetPanel({ smooth, phase }) {
  const opacity = useTransform(smooth, [0.60, 0.64, 0.68, 0.72], [0, 1, 1, 0]);
  const y = useTransform(smooth, [0.60, 0.64], [40, 0]);
  return (
    <motion.div style={{ opacity, y, width: '100%', maxWidth: 780, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <span style={{ fontFamily: "'Syne Mono',monospace", fontSize: 10, letterSpacing: 4, color: GOLD, textTransform: 'uppercase' }}>
          Key Chipsets
        </span>
        <p style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(0.9rem,2vw,1.1rem)',
          color: 'rgba(240,237,230,0.5)', margin: '8px auto 0', maxWidth: 430, lineHeight: 1.5
        }}>
          Each chip on the board has a dedicated role — hover to learn more.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
        {CHIPSETS.map((chip, i) => (
          <ChipsetNode key={chip.name} chip={chip} phase={phase} delay={0.08 * i} />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Final overview panel (phase 4) ──────────────────────────────────────────
const ALL_COMPONENTS = [
  { label: 'CPU', color: GOLD, value: 'LGA 1700', sub: 'The brain' },
  { label: 'RAM', color: 'rgba(201,168,76,0.8)', value: '192 GB', sub: 'Working memory' },
  { label: 'GPU', color: 'rgba(168,100,255,0.9)', value: 'PCIe 5.0', sub: 'Graphics engine' },
  { label: 'NVMe', color: GOLD, value: '14 GB/s', sub: 'Fast storage' },
  { label: 'VRM', color: 'rgba(255,140,80,0.85)', value: '350 W', sub: 'Power delivery' },
  { label: 'PCH', color: 'rgba(100,200,255,0.85)', value: 'DMI 4.0', sub: 'I/O hub' },
];

function OverviewPanel({ smooth, phase }) {
  const opacity = useTransform(smooth, [0.7, 0.82], [0, 1]);
  const y = useTransform(smooth, [0.78, 0.80], [32, 0]);
  return (
    <motion.div style={{ opacity, y, width: '100%', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <span style={{ fontFamily: "'Syne Mono',monospace", fontSize: 9, letterSpacing: 4, color: GOLD, textTransform: 'uppercase' }}>
          System Overview
        </span>
        <p style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1rem,2.2vw,1.15rem)',
          color: 'rgba(240,237,230,0.45)', margin: '8px auto 0', maxWidth: 480, lineHeight: 1.5
        }}>
          Every component you've explored lives on this board — a single sheet of fibreglass
          connecting billions of transistors into one coherent machine.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {ALL_COMPONENTS.map(c => (
          <motion.div key={c.label} whileHover={{ scale: 1.04, boxShadow: `0 0 26px ${c.color.replace('0.9', '0.18').replace('0.85', '0.18').replace('0.8', '0.18')}` }}
            style={{
              borderRadius: 14, border: `1px solid ${GOLD_DIM}`, padding: '20px 22px',
              background: 'rgba(12, 12, 12,0.85)', cursor: 'default', transition: 'box-shadow 0.2s ease'
            }}>
            <p style={{ fontFamily: "'Syne Mono',monospace", fontSize: 8, letterSpacing: 2, color: c.color, margin: 0, textTransform: 'uppercase' }}>
              {c.label}
            </p>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 300, color: '#F0EDE6', margin: '8px 0 4px' }}>
              {c.value}
            </p>
            <p style={{ fontFamily: "'Syne Mono',monospace", fontSize: 8.5, color: 'rgba(240,237,230,0.35)', margin: 0, letterSpacing: 0.5 }}>
              {c.sub}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Root Motherboard component ───────────────────────────────────────────────
const Motherboard = ({ arrivalKey = 0, onBack }) => {
  const [phase, setPhase] = useState(true);
  const scrollRootRef = useRef(null);
  const handoffRef = useRef(false);
  const accumRef = useRef(0);

  const { scrollYProgress } = useScroll({ container: scrollRootRef, offset: ['start start', 'end start'] });
  const { scrollY } = useScroll({ container: scrollRootRef });
  const smooth = useSpring(scrollYProgress, { stiffness: 55, damping: 22 });

  const [scrollPhase, setScrollPhase] = useState(0);
  useMotionValueEvent(smooth, 'change', (v) => {
     if      (v < 0.15) setScrollPhase(0);
     else if (v < 0.36) setScrollPhase(1);
     else if (v < 0.65) setScrollPhase(2);
     else if (v < 0.78) setScrollPhase(3);
     else               setScrollPhase(4);
   });

  // scroll-up handoff → GPU
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

  useEffect(() => { const t = requestAnimationFrame(() => setPhase(true)); return () => cancelAnimationFrame(t); }, []);

  return (
    <div ref={scrollRootRef} onWheel={handleWheel}
      style={{
        position: 'relative', height: '100%', width: '100%', backgroundColor: BG_DARK,
        overflowX: 'hidden', overflowY: 'auto', WebkitOverflowScrolling: 'touch'
      }}>

      <ScrollProgressBar progress={scrollYProgress} />
      <PhaseIndicator currentPhase={scrollPhase} />
      <BgLayers scrollYProgress={smooth} />

      {/* pull-up hint */}
      <motion.div style={{
        position: 'absolute', top: 14, width: '100%', textAlign: 'center',
        fontFamily: "'Syne Mono',monospace", fontSize: '8px', color: GOLD,
        opacity: 0.7, pointerEvents: 'none', zIndex: 50, letterSpacing: 3
      }} animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
        ↑ PULL UP · RETURN TO GPU
      </motion.div>

      {/* ── Scroll narrative: 500vh ── */}
      <section style={{ position: 'relative', height: '500vh', background: BG_DARK }}>
        <div style={{
          position: 'sticky', top: 0, height: '100dvh', display: 'flex',
          alignItems: 'center', justifyContent: 'center', overflow: 'hidden', zIndex: 10
        }}>
          <div style={{
            position: 'relative', zIndex: 10, width: '100%',
            padding: '0 clamp(20px,5vw,60px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <AnimatePresence>
              {phase && (
                <motion.div key="mb-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
                  style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr', placeItems: 'center' }}>

                  <div style={{ gridArea: '1/1', width: '100%', display: 'flex', justifyContent: 'center', zIndex: scrollPhase === 0 ? 5 : 1, pointerEvents: scrollPhase === 0 ? 'auto' : 'none' }}>
                    <MBIntroPanel smooth={smooth} />
                  </div>
                  <div style={{ gridArea: '1/1', width: '100%', display: 'flex', justifyContent: 'center', zIndex: scrollPhase === 1 ? 5 : 1, pointerEvents: scrollPhase === 1 ? 'auto' : 'none' }}>
                    <PCBMapPanel smooth={smooth} phase={phase} />
                  </div>
                  <div style={{ gridArea: '1/1', width: '100%', display: 'flex', justifyContent: 'center', zIndex: scrollPhase === 2 ? 5 : 1, pointerEvents: scrollPhase === 2 ? 'auto' : 'none' }}>
                    <DataTracesPanel smooth={smooth} phase={phase} />
                  </div>
                  <div style={{ gridArea: '1/1', width: '100%', display: 'flex', justifyContent: 'center', zIndex: scrollPhase === 3 ? 5 : 1, pointerEvents: scrollPhase === 3 ? 'auto' : 'none' }}>
                    <ChipsetPanel smooth={smooth} phase={phase} />
                  </div>
                  <div style={{ gridArea: '1/1', width: '100%', display: 'flex', justifyContent: 'center', zIndex: scrollPhase === 4 ? 5 : 1, pointerEvents: scrollPhase === 4 ? 'auto' : 'none' }}>
                    <OverviewPanel smooth={smooth} phase={phase} />
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

export default Motherboard;

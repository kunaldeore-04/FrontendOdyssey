import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import { Cpu, Layers, Zap, Triangle, Box, Activity } from 'lucide-react';

// ─── Design tokens ────────────────────────────────────────────────────────────
const GOLD         = 'rgba(201, 168, 76, 0.9)';
const GOLD_DIM     = 'rgba(201, 168, 76, 0.15)';
const GOLD_MID     = 'rgba(201, 168, 76, 0.45)';
const GOLD_BRIGHT  = 'rgba(201, 168, 76, 1)';
const TEAL         = 'rgba(80, 200, 220, 0.85)';
const BG_DARK      = '#070707';
const EASE         = [0.22, 1, 0.36, 1];

// ─── Background ───────────────────────────────────────────────────────────────
function BgLayers({ scrollYProgress }) {
  const glowY  = useTransform(scrollYProgress, [0, 1], [20, -50]);
  const gridY  = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const grainY = useTransform(scrollYProgress, [0, 1], [0, -18]);
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
      background: 'radial-gradient(ellipse 55% 48% at 50% 32%, rgba(201,168,76,0.07) 0%, transparent 65%)'
    }} />
    <motion.div aria-hidden style={{
      position: 'fixed', inset: '-150px', pointerEvents: 'none', zIndex: 2, y: gridY,
      backgroundImage: `linear-gradient(${GOLD_DIM} 1px, transparent 1px), linear-gradient(90deg, ${GOLD_DIM} 1px, transparent 1px)`,
      backgroundSize: '72px 72px', opacity: 0.18
    }} />
    <div style={{
      position: 'fixed', top: '42%', left: '50%', width: 'min(90vw, 900px)', height: '55vh',
      marginLeft: 'calc(min(90vw, 900px) * -0.5)', marginTop: '-27.5vh', pointerEvents: 'none', zIndex: 0
    }}>
      <motion.div aria-hidden style={{
        width: '100%', height: '100%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 68%)'
      }} />
    </div>
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
const PHASE_LABELS = ['INIT', 'SHADER CORES', 'PIPELINE', 'VRAM', 'PERF'];
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

// ─── Shader Core cell ─────────────────────────────────────────────────────────
const SM_DESCRIPTIONS = [
  'SM 0 · 128 CUDA cores', 'SM 1 · Warp scheduler', 'SM 2 · Tensor unit',
  'SM 3 · RT core', 'SM 4 · Shared L1', 'SM 5 · Register file',
  'SM 6 · Load/store unit', 'SM 7 · SFU cluster', 'SM 8 · INT32 path',
  'SM 9 · FP64 unit', 'SM 10 · Texture cache', 'SM 11 · Raster engine',
];

function ShaderCore({ index, phase }) {
  const [hovered, setHovered] = useState(false);
  const wave = index * 0.04;
  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: phase ? 1 : 0, scale: phase ? 1 : 0.7 }}
      transition={{ opacity: { delay: wave, duration: 0.4, ease: EASE }, scale: { delay: wave, duration: 0.4, ease: EASE } }}
      style={{
        aspectRatio: '1', borderRadius: 4,
        border: `1px solid ${hovered ? GOLD_MID : GOLD_DIM}`,
        background: hovered
          ? 'linear-gradient(145deg, rgba(201,168,76,0.16), rgba(7,7,7,0.97))'
          : 'linear-gradient(145deg, rgba(18,14,22,0.95), rgba(7,7,7,0.97))',
        position: 'relative', overflow: 'hidden', cursor: 'crosshair',
        boxShadow: hovered ? '0 0 16px rgba(201,168,76,0.45), 0 0 5px rgba(201,168,76,0.2)' : 'none',
        transform: hovered ? 'scale(1.2)' : 'scale(1)',
        zIndex: hovered ? 10 : 'auto',
        transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
      }}>
      {/* inner grid */}
      <div style={{
        position: 'absolute', inset: 4,
        backgroundImage: 'linear-gradient(rgba(201,168,76,0.06) 1px, transparent 1px), linear-gradient(90deg,rgba(201,168,76,0.06) 1px, transparent 1px)',
        backgroundSize: '33.3% 33.3%'
      }} />
      <motion.div style={{
        position: 'absolute', inset: 3, borderRadius: 2,
        background: `linear-gradient(135deg, rgba(201,168,76,0.25) 0%, transparent 55%)`,
        opacity: 0.4
      }} animate={{ opacity: [0.2, 0.55, 0.2] }}
        transition={{ duration: 2.2 + (index % 5) * 0.18, repeat: Infinity, ease: 'easeInOut' }} />
      <span style={{
        fontFamily: "'Syne Mono',monospace", fontSize: hovered ? 9 : 6, letterSpacing: 0.8,
        color: hovered ? GOLD_BRIGHT : 'rgba(201,168,76,0.7)', zIndex: 2, position: 'relative',
        transition: 'font-size 0.18s ease, color 0.18s ease'
      }}>
        SM{index}
      </span>
      {hovered && (
        <span style={{
          fontFamily: "'Syne Mono',monospace", fontSize: 5.5, letterSpacing: 0.4,
          color: 'rgba(201,168,76,0.7)', zIndex: 2, position: 'relative',
          textAlign: 'center', lineHeight: 1.3, padding: '0 3px'
        }}>
          {SM_DESCRIPTIONS[index]}
        </span>
      )}
    </motion.div>
  );
}

// ─── Render pipeline stage ────────────────────────────────────────────────────
const PIPE_STAGES = [
  { name: 'VERTEX', icon: '▲', color: GOLD, desc: 'Transform & project vertices' },
  { name: 'RASTER', icon: '▦', color: 'rgba(201,168,76,0.9)', desc: 'Convert triangles to fragments' },
  { name: 'FRAGMENT', icon: '◈', color: TEAL, desc: 'Shade each pixel fragment' },
  { name: 'OUTPUT', icon: '■', color: 'rgba(80,200,220,0.9)', desc: 'Blend & write to framebuffer' },
];

function PipelineStage({ stage, index, smooth }) {
  const [hovered, setHovered] = useState(false);
  const t = 0.30 + index * 0.07;
  const opacity = useTransform(smooth, [t, t + 0.06], [0, 1]);
  const y = useTransform(smooth, [t, t + 0.06], [20, 0]);
  return (
    <motion.div style={{ opacity, y, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flex: 1 }}>
      {/* Connector line */}
      {index < PIPE_STAGES.length - 1 && (
        <div style={{ position: 'absolute', right: '-50%', top: '50%', width: '100%', height: 1,
          background: `linear-gradient(90deg, ${stage.color}, transparent)`, pointerEvents: 'none' }} />
      )}
      <motion.div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ scale: 1.08 }}
        style={{
          width: '100%', borderRadius: 14,
          border: `1px solid ${hovered ? stage.color : GOLD_DIM}`,
          background: hovered
            ? `linear-gradient(145deg, rgba(201,168,76,0.12), rgba(7,7,7,0.96))`
            : 'linear-gradient(145deg, rgba(16,12,20,0.93), rgba(7,7,7,0.97))',
          padding: '20px 16px', cursor: 'default', textAlign: 'center',
          boxShadow: hovered ? `0 0 24px rgba(201,168,76,0.22), inset 0 0 20px rgba(201,168,76,0.04)` : 'none',
          transition: 'box-shadow 0.22s ease, border-color 0.22s ease, background 0.22s ease'
        }}>
        <div style={{
          fontFamily: "'Syne Mono',monospace", fontSize: 22, marginBottom: 10,
          filter: hovered ? `drop-shadow(0 0 8px ${stage.color})` : 'none',
          transition: 'filter 0.2s ease', color: stage.color
        }}>
          {stage.icon}
        </div>
        <div style={{
          fontFamily: "'Syne Mono',monospace", fontSize: 8, letterSpacing: 2.5,
          color: stage.color, textTransform: 'uppercase', marginBottom: 8
        }}>
          {stage.name}
        </div>
        <AnimatePresence>
          {hovered && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, fontWeight: 300, color: 'rgba(240,237,230,0.55)', lineHeight: 1.5, overflow: 'hidden' }}>
              {stage.desc}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {/* Pulsing dot */}
      <motion.div animate={{ opacity: [0.35, 1, 0.35], boxShadow: [`0 0 4px ${stage.color}`, `0 0 14px ${stage.color}`, `0 0 4px ${stage.color}`] }}
        transition={{ duration: 1.8 + index * 0.3, repeat: Infinity }}
        style={{ width: 6, height: 6, borderRadius: '50%', background: stage.color }} />
    </motion.div>
  );
}

// ─── VRAM chip visual ─────────────────────────────────────────────────────────
function VRAMChip({ index, phase }) {
  const [hovered, setHovered] = useState(false);
  const labels = ['GDDR7 0', 'GDDR7 1', 'GDDR7 2', 'GDDR7 3'];
  const descs = ['256-bit slice · 192 GB/s', '256-bit slice · 192 GB/s', 'HBM3 stack · 3.2 TB/s', 'HBM3 stack · 3.2 TB/s'];
  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: phase ? 1 : 0, y: phase ? 0 : 20 }}
      transition={{ delay: index * 0.12 + 0.1, duration: 0.55, ease: EASE }}
      whileHover={{ scale: 1.06 }}
      style={{
        borderRadius: 10, border: `1px solid ${hovered ? GOLD_MID : GOLD_DIM}`,
        background: hovered
          ? 'linear-gradient(145deg, rgba(201,168,76,0.14), rgba(7,7,7,0.96))'
          : 'linear-gradient(145deg, rgba(16,12,22,0.92), rgba(7,7,7,0.97))',
        padding: '18px 14px', cursor: 'default', position: 'relative', overflow: 'hidden',
        boxShadow: hovered ? '0 0 20px rgba(201,168,76,0.3)' : 'none',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease'
      }}>
      {/* Animated data lanes */}
      {[0, 1, 2].map(i => (
        <motion.div key={i} style={{
          position: 'absolute', left: 0, right: 0, height: 1,
          top: `${25 + i * 22}%`, background: `linear-gradient(90deg, transparent, ${GOLD_DIM}, transparent)`, overflow: 'hidden'
        }}>
          <motion.div style={{ position: 'absolute', top: 0, width: '25%', height: '100%',
            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
            animate={{ left: ['-25%', '125%'] }}
            transition={{ duration: 1.5 + i * 0.4, repeat: Infinity, ease: 'linear', delay: i * 0.5 }} />
        </motion.div>
      ))}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          fontFamily: "'Syne Mono',monospace", fontSize: 9, letterSpacing: 2.5,
          color: hovered ? GOLD_BRIGHT : GOLD, textTransform: 'uppercase', marginBottom: 8
        }}>
          {labels[index % 4]}
        </div>
        <div style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 13, fontWeight: 300,
          color: 'rgba(240,237,230,0.5)', lineHeight: 1.4
        }}>
          {descs[index % 4]}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Intro panel (phase 0) ────────────────────────────────────────────────────
function GPUIntroPanel({ smooth }) {
  const opacity = useTransform(smooth, [0, 0.08, 0.22, 0.28], [0, 1, 1, 0]);
  const y       = useTransform(smooth, [0, 0.08, 0.26], [32, 0, -24]);
  return (
    <motion.div style={{ opacity, y, textAlign: 'center', pointerEvents: 'none' }}>
      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          display: 'inline-flex', padding: 20, borderRadius: 24,
          border: `1px solid ${GOLD_DIM}`, background: 'linear-gradient(145deg,#0f0d14,#070707)',
          boxShadow: `0 20px 50px rgba(0,0,0,0.45), inset 0 0 24px ${GOLD_DIM}`, marginBottom: 24
        }}>
        <Layers color={GOLD} size={46} strokeWidth={1.1} />
      </motion.div>
      <div style={{
        fontFamily: "'Syne Mono',monospace", fontSize: 11, letterSpacing: 8,
        color: GOLD, textTransform: 'uppercase', marginBottom: 12
      }}>
        Subsystem · graphics processor
      </div>
      <motion.h1 initial={{ letterSpacing: '-0.02em', filter: 'blur(14px)' }}
        animate={{ letterSpacing: '0.02em', filter: 'blur(0px)' }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
        style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2rem,7vw,3.75rem)',
          fontWeight: 300, color: '#F0EDE6', margin: '0 0 16px', fontStyle: 'italic',
          textShadow: '0 0 36px rgba(240,237,230,0.12)'
        }}>
        Inside <span style={{ color: GOLD }}>the GPU</span>
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(1rem,2.2vw,1.2rem)',
          fontWeight: 300, color: 'rgba(240,237,230,0.6)', maxWidth: 520, margin: '0 auto', lineHeight: 1.6
        }}>
        Thousands of shader cores work in parallel to transform triangles into pixels —
        a massively parallel engine built for one purpose: rendering the world at speed of light.
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

// ─── Shader-core grid panel (phase 1) ─────────────────────────────────────────
function ShaderCorePanel({ smooth, phase }) {
  const opacity = useTransform(smooth, [0.24, 0.32, 0.48, 0.56], [0, 1, 1, 0]);
  const scale   = useTransform(smooth, [0.24, 0.32], [0.93, 1]);
  return (
    <motion.div style={{ opacity, scale, width: '100%', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <span style={{ fontFamily: "'Syne Mono',monospace", fontSize: 10, letterSpacing: 4, color: GOLD, textTransform: 'uppercase' }}>
          Streaming Multiprocessors
        </span>
        <p style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(0.9rem,2vw,1.1rem)',
          color: 'rgba(240,237,230,0.5)', margin: '8px auto 0', maxWidth: 420, lineHeight: 1.5
        }}>
          Hover any SM to inspect its subsystem. Each block contains 128 CUDA shader cores.
        </p>
      </div>
      <motion.div style={{
        borderRadius: 20, border: `1px solid ${GOLD_MID}`,
        background: 'linear-gradient(165deg, rgba(18,12,26,0.95), rgba(5,5,7,0.98))',
        padding: 'clamp(16px,3vw,28px)',
        boxShadow: `0 28px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(201,168,76,0.08), 0 0 60px ${GOLD_DIM}`,
        overflow: 'hidden', position: 'relative'
      }}>
        {/* Sweep */}
        <motion.div aria-hidden style={{
          position: 'absolute', left: 0, right: 0, height: '30%', top: '-32%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(201,168,76,0.08) 45%, rgba(201,168,76,0.02) 55%, transparent 100%)',
          pointerEvents: 'none', zIndex: 4
        }} animate={{ top: ['-32%', '110%'] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }} />
        <motion.div style={{ position: 'absolute', top: 10, right: 14,
          fontFamily: "'Syne Mono',monospace", fontSize: 8, letterSpacing: 2, color: GOLD, textTransform: 'uppercase', zIndex: 5 }}
          animate={{ opacity: [0.45, 1, 0.45] }} transition={{ duration: 2.5, repeat: Infinity }}>
          84 SMs ACTIVE
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, position: 'relative', zIndex: 3, paddingTop: 22 }}>
          {Array.from({ length: 12 }, (_, i) => <ShaderCore key={i} index={i} phase={phase} />)}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Render pipeline panel (phase 2) ──────────────────────────────────────────
function RenderPipelinePanel({ smooth, phase }) {
  const opacity = useTransform(smooth, [0.50, 0.58, 0.72, 0.80], [0, 1, 1, 0]);
  const x       = useTransform(smooth, [0.50, 0.58], [-40, 0]);
  return (
    <motion.div style={{ opacity, x, width: '100%', maxWidth: 780, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <span style={{ fontFamily: "'Syne Mono',monospace", fontSize: 10, letterSpacing: 4, color: GOLD, textTransform: 'uppercase' }}>
          Render Pipeline
        </span>
        <p style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(0.9rem,2vw,1.1rem)',
          color: 'rgba(240,237,230,0.5)', margin: '8px auto 0', maxWidth: 440, lineHeight: 1.5
        }}>
          Hover each stage to learn how a triangle becomes a pixel on your screen.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, position: 'relative' }}>
        {/* Arrow connectors */}
        {[0,1,2].map(i => (
          <motion.div key={i} style={{
            position: 'absolute',
            left: `${25 * (i + 1) - 1}%`, top: '38%',
            width: 18, height: 18, zIndex: 5, pointerEvents: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }} animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 1.5 + i * 0.3, repeat: Infinity }}>
            <span style={{ color: GOLD, fontSize: 12 }}>→</span>
          </motion.div>
        ))}
        {PIPE_STAGES.map((stage, i) => (
          <PipelineStage key={stage.name} stage={stage} index={i} smooth={smooth} />
        ))}
      </div>
    </motion.div>
  );
}

// ─── VRAM panel (phase 3) ─────────────────────────────────────────────────────
function VRAMPanel({ smooth, phase }) {
  const opacity = useTransform(smooth, [0.74, 0.82, 0.92, 0.97], [0, 1, 1, 0]);
  const y       = useTransform(smooth, [0.74, 0.82], [40, 0]);
  return (
    <motion.div style={{ opacity, y, width: '100%', maxWidth: 700, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <span style={{ fontFamily: "'Syne Mono',monospace", fontSize: 10, letterSpacing: 4, color: GOLD, textTransform: 'uppercase' }}>
          Video Memory — VRAM
        </span>
        <p style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(0.9rem,2vw,1.1rem)',
          color: 'rgba(240,237,230,0.5)', margin: '8px auto 0', maxWidth: 440, lineHeight: 1.5
        }}>
          High-bandwidth memory sits right next to the GPU die, feeding textures and framebuffers at massive speeds.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
        {Array.from({ length: 4 }, (_, i) => <VRAMChip key={i} index={i} phase={phase} />)}
      </div>
      {/* Bus throughput bar */}
      <motion.div style={{
        marginTop: 20, borderRadius: 14, border: `1px solid ${GOLD_DIM}`,
        padding: '16px 20px',
        background: 'linear-gradient(165deg, rgba(16,12,22,0.92), rgba(6,4,10,0.97))'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
          <span style={{ fontFamily: "'Syne Mono',monospace", fontSize: 9, letterSpacing: 2, color: GOLD }}>MEMORY BUS THROUGHPUT</span>
          <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.8, repeat: Infinity }}
            style={{ fontFamily: "'Syne Mono',monospace", fontSize: 9, color: TEAL, letterSpacing: 1 }}>
            1,008 GB/s
          </motion.span>
        </div>
        <div style={{ position: 'relative', height: 6, borderRadius: 3, background: GOLD_DIM, overflow: 'hidden' }}>
          <motion.div style={{ position: 'absolute', top: 0, height: '100%', borderRadius: 3,
            background: `linear-gradient(90deg, ${GOLD}, ${TEAL})` }}
            animate={{ width: ['0%', '87%', '72%', '95%', '80%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Stats panel (phase 4) ────────────────────────────────────────────────────
const GPU_STATS = [
  { label: 'Shader Cores', value: '16,384', sub: 'CUDA / shader processors' },
  { label: 'Peak FP32', value: '82.6', unit: 'TFLOPS', sub: 'Single-precision throughput' },
  { label: 'Memory BW', value: '1,008', unit: 'GB/s', sub: 'GDDR7 + HBM3 combined' },
  { label: 'VRAM', value: '24', unit: 'GB', sub: 'On-package video memory' },
  { label: 'RT Cores', value: '128', sub: 'Hardware ray tracing units' },
  { label: 'Tensor Cores', value: '512', sub: 'AI / DLSS acceleration' },
];
function GPUStatsPanel({ smooth, phase }) {
  const opacity = useTransform(smooth, [0.92, 0.98], [0, 1]);
  const y       = useTransform(smooth, [0.92, 0.98], [32, 0]);
  return (
    <motion.div style={{ opacity, y, width: '100%', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <span style={{ fontFamily: "'Syne Mono',monospace", fontSize: 9, letterSpacing: 4, color: GOLD, textTransform: 'uppercase' }}>
          GPU Specifications
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {GPU_STATS.map(stat => (
          <motion.div key={stat.label} whileHover={{ scale: 1.03, boxShadow: `0 0 28px rgba(201,168,76,0.18)` }}
            style={{
              borderRadius: 14, border: `1px solid ${GOLD_DIM}`, padding: '20px 22px',
              background: 'rgba(10,8,16,0.8)', cursor: 'default', transition: 'box-shadow 0.2s ease'
            }}>
            <p style={{ fontFamily: "'Syne Mono',monospace", fontSize: 8, letterSpacing: 2, color: GOLD, margin: 0, textTransform: 'uppercase' }}>
              {stat.label}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '10px 0 4px' }}>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 300, color: '#F0EDE6', lineHeight: 1 }}>
                {stat.value}
              </span>
              {stat.unit && (
                <span style={{ fontFamily: "'Syne Mono',monospace", fontSize: 9, color: GOLD, letterSpacing: 2 }}>
                  {stat.unit}
                </span>
              )}
            </div>
            <p style={{ fontFamily: "'Syne Mono',monospace", fontSize: 8, color: 'rgba(240,237,230,0.35)', margin: 0, letterSpacing: 0.5 }}>
              {stat.sub}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Root GPU component ───────────────────────────────────────────────────────
const GPU = ({ arrivalKey = 0, onBack, onContinue }) => {
  const [phase, setPhase] = useState(false);
  const scrollRootRef = useRef(null);
  const handoffRef    = useRef(false);
  const accumRef      = useRef(0);

  const { scrollYProgress } = useScroll({ container: scrollRootRef, offset: ['start start', 'end start'] });
  const { scrollY }         = useScroll({ container: scrollRootRef });
  const smooth              = useSpring(scrollYProgress, { stiffness: 55, damping: 22 });

  const [scrollPhase, setScrollPhase] = useState(0);
  useMotionValueEvent(smooth, 'change', (v) => {
    if      (v < 0.26) setScrollPhase(0);
    else if (v < 0.54) setScrollPhase(1);
    else if (v < 0.78) setScrollPhase(2);
    else if (v < 0.94) setScrollPhase(3);
    else               setScrollPhase(4);
  });

  // scroll-down handoff → Motherboard
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

  // scroll-up handoff → Memory
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

      <ScrollProgressBar progress={smooth} />
      <PhaseIndicator currentPhase={scrollPhase} />
      <BgLayers scrollYProgress={smooth} />

      {/* pull-up hint */}
      <motion.div style={{
        position: 'absolute', top: 14, width: '100%', textAlign: 'center',
        fontFamily: "'Syne Mono',monospace", fontSize: '8px', color: GOLD,
        opacity: 0.7, pointerEvents: 'none', zIndex: 50, letterSpacing: 3
      }} animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
        ↑ PULL UP · RETURN TO MEMORY
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
                <motion.div key="gpu-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
                  style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr', placeItems: 'center' }}>

                  <div style={{ gridArea: '1/1', width: '100%', display: 'flex', justifyContent: 'center', zIndex: scrollPhase === 0 ? 5 : 1, pointerEvents: scrollPhase === 0 ? 'auto' : 'none' }}>
                    <GPUIntroPanel smooth={smooth} />
                  </div>
                  <div style={{ gridArea: '1/1', width: '100%', display: 'flex', justifyContent: 'center', zIndex: scrollPhase === 1 ? 5 : 1, pointerEvents: scrollPhase === 1 ? 'auto' : 'none' }}>
                    <ShaderCorePanel smooth={smooth} phase={phase} />
                  </div>
                  <div style={{ gridArea: '1/1', width: '100%', display: 'flex', justifyContent: 'center', zIndex: scrollPhase === 2 ? 5 : 1, pointerEvents: scrollPhase === 2 ? 'auto' : 'none' }}>
                    <RenderPipelinePanel smooth={smooth} phase={phase} />
                  </div>
                  <div style={{ gridArea: '1/1', width: '100%', display: 'flex', justifyContent: 'center', zIndex: scrollPhase === 3 ? 5 : 1, pointerEvents: scrollPhase === 3 ? 'auto' : 'none' }}>
                    <VRAMPanel smooth={smooth} phase={phase} />
                  </div>
                  <div style={{ gridArea: '1/1', width: '100%', display: 'flex', justifyContent: 'center', zIndex: scrollPhase === 4 ? 5 : 1, pointerEvents: scrollPhase === 4 ? 'auto' : 'none' }}>
                    <GPUStatsPanel smooth={smooth} phase={phase} />
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

export default GPU;

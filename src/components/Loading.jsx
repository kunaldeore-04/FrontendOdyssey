import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Power } from 'lucide-react';

/* ─────────────────────────────────────────
   Design Constants
───────────────────────────────────────── */
const GOLD = 'rgba(201, 168, 76, 0.7)';
const GOLD_DIM = 'rgba(201, 168, 76, 0.15)';
const BG_DARK = '#070707';

const bootLines = [
  "> INITIALIZING_QUANTUM_CORE............",
  "> LOADING_CORTEX_V8_MODULES [OK]",
  "> SYNCHRONIZING_L3_CACHE [32MB]",
  "> CALIBRATING_PIPELINE_STAGES [OK]",
  "> SYSTEM_NOMINAL — ACCESS_GRANTED",
];

/* ─────────────────────────────────────────
   Components
───────────────────────────────────────── */
const BootLine = ({ text, index }) => (
  <motion.p
    style={{ 
      fontFamily: "'Syne Mono', monospace",
      fontSize: '8px',
      letterSpacing: '1.2px',
      color: index === bootLines.length - 1 ? '#F0EDE6' : 'rgba(201, 168, 76, 0.5)',
      margin: '6px 0',
      textTransform: 'uppercase'
    }}
    initial={{ opacity: 0, x: -5 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.2, duration: 0.3 }}
  >
    {text}
  </motion.p>
);

export default function Loading({ onPowerOn }) {
  const [phase, setPhase] = useState(0); // 0: standby, 1: boot, 2: complete

  const handlePowerClick = () => {
    setPhase(1);
    setTimeout(() => {
      setPhase(2);
      if (onPowerOn) onPowerOn();
    }, bootLines.length * 200 + 1500);
  };

  return (
    <div style={{ 
      position: 'relative', height: '100vh', width: '100%', 
      backgroundColor: BG_DARK, overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      
      {/* ── SHARED BACKGROUND SYSTEM ── */}
      
      {/* Grain texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40, opacity: 0.4,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '160px 160px',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
        background: 'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 25%, #070707 100%)',
      }} />

      {/* Warm ambient glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(ellipse 55% 50% at 50% 50%, rgba(201,168,76,0.055) 0%, transparent 70%)',
      }} />

      {/* ── CONTENT ── */}

      <AnimatePresence mode="wait">
        {phase === 0 && (
          <motion.div
            key="standby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)', transition: { duration: 0.5 } }}
            style={{ zIndex: 10, textAlign: 'center' }}
          >
            <div style={{ position: 'relative', marginBottom: 40, display: 'flex', justifyContent: 'center' }}>
              {/* Pulse Rings */}
              {[0, 1].map((r) => (
                <motion.div
                  key={r}
                  animate={{ opacity: [0.2, 0.05, 0.2], scale: [1, 1.4, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: r * 2 }}
                  style={{
                    position: 'absolute', width: 90, height: 90,
                    border: '1px solid rgba(201,168,76,0.2)',
                    borderRadius: '50%',
                  }}
                />
              ))}

              <motion.button
                onClick={handlePowerClick}
                whileHover={{ scale: 1.05, borderColor: GOLD }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: 90, height: 90, borderRadius: '50%',
                  backgroundColor: 'rgba(15, 15, 15, 0.5)',
                  border: `1px solid ${GOLD_DIM}`,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(8px)', zIndex: 2, transition: 'border-color 0.3s'
                }}
              >
                <Power color="#C9A84C" size={32} strokeWidth={1} />
              </motion.button>
            </div>

            <div style={{
              fontFamily: "'Syne Mono', monospace", fontSize: 8,
              letterSpacing: 6, color: 'rgba(201,168,76,0.4)',
              textTransform: 'uppercase', marginBottom: 16
            }}>
              Core Standby
            </div>
            <motion.div
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: 20,
                fontStyle: 'italic', color: '#F0EDE6', fontWeight: 300
              }}
            >
              Touch to wake
            </motion.div>
          </motion.div>
        )}

        {phase === 1 && (
          <motion.div
            key="boot"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 0.5 } }}
            style={{
              zIndex: 10, width: 340, padding: 24,
              background: 'linear-gradient(150deg, #131211 0%, #0c0b0b 100%)',
              border: '1px solid rgba(201,168,76,0.15)',
              borderRadius: 12, position: 'relative',
              boxShadow: '0 40px 100px rgba(0,0,0,0.8)'
            }}
          >
            {/* Edge highlights like the CPU die */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05) 50%, transparent)',
            }} />

            {/* Diagnostic Header */}
            <div style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              marginBottom: 20, borderBottom: '1px solid rgba(201,168,76,0.1)', paddingBottom: 12 
            }}>
               <span style={{ 
                fontFamily: "'Syne Mono', monospace", fontSize: 7, 
                letterSpacing: 3, color: GOLD, opacity: 0.6 
              }}>
                INIT_SEQUENCE_v8.0
              </span>
              <motion.div 
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: GOLD }} 
              />
            </div>

            {bootLines.map((line, i) => (
              <BootLine key={i} text={line} index={i} />
            ))}

            {/* Hairline Progress Bar */}
            <div style={{ marginTop: 24, height: 1, width: '100%', backgroundColor: 'rgba(201,168,76,0.05)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: bootLines.length * 0.2 + 0.5, ease: 'easeInOut' }}
                style={{ height: '100%', backgroundColor: GOLD, boxShadow: `0 0 10px ${GOLD}` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
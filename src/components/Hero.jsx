import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Zap, Activity } from 'lucide-react';

/* ─────────────────────────────────────────
    Design Constants (Matching Loading)
───────────────────────────────────────── */
const GOLD = 'rgba(201, 168, 76, 0.9)';
const GOLD_DIM = 'rgba(201, 168, 76, 0.15)';
const BG_DARK = '#070707';

const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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

      {/* Grid Overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
        backgroundImage: `linear-gradient(${GOLD_DIM} 1px, transparent 1px), linear-gradient(90deg, ${GOLD_DIM} 1px, transparent 1px)`,
        backgroundSize: '100px 100px',
        opacity: 0.2
      }} />

      {/* ── MAIN CONTENT ── */}
      <AnimatePresence>
        {isLoaded && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}
          >
            {/* CPU Icon Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}
            >
              <div style={{
                padding: '20px',
                borderRadius: '24px',
                border: `1px solid ${GOLD_DIM}`,
                background: 'linear-gradient(145deg, #0f0f0f, #070707)',
                boxShadow: `0 20px 50px rgba(0,0,0,0.5), inset 0 0 20px ${GOLD_DIM}`
              }}>
                <Cpu color={GOLD} size={48} strokeWidth={1} />
              </div>
            </motion.div>

            {/* Title Section */}
            <div style={{ marginBottom: 8 }}>
               <span style={{ 
                fontFamily: "'Syne Mono', monospace", fontSize: 12, 
                letterSpacing: 8, color: GOLD, textTransform: 'uppercase'
              }}>
                Component v8.01
              </span>
            </div>

            <motion.h1
              initial={{ letterSpacing: '0px', filter: 'blur(10px)' }}
              animate={{ letterSpacing: '2px', filter: 'blur(0px)' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(2rem, 8vw, 4.5rem)',
                fontWeight: 300,
                color: '#F0EDE6',
                margin: 0,
                fontStyle: 'italic',
                textShadow: '0 0 30px rgba(240, 237, 230, 0.2)'
              }}
            >
              Welcome to the <span style={{ color: GOLD }}>CPU</span>
            </motion.h1>

            {/* Status HUD Elements */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{ 
                display: 'flex', gap: 40, justifyContent: 'center', marginTop: 48,
                borderTop: `1px solid ${GOLD_DIM}`, paddingTop: 24
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontFamily: "'Syne Mono', monospace", fontSize: 8, color: GOLD, margin: 0 }}>CLOCK_SPEED</p>
                <p style={{ color: '#F0EDE6', fontSize: 14, fontWeight: 300 }}>5.4 GHz</p>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontFamily: "'Syne Mono', monospace", fontSize: 8, color: GOLD, margin: 0 }}>THERMALS</p>
                <p style={{ color: '#F0EDE6', fontSize: 14, fontWeight: 300 }}>32°C [NOMINAL]</p>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontFamily: "'Syne Mono', monospace", fontSize: 8, color: GOLD, margin: 0 }}>LOAD_STATE</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <motion.div 
                        animate={{ opacity: [1, 0.4, 1] }} 
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4CAF50' }} 
                    />
                    <span style={{ color: '#F0EDE6', fontSize: 14, fontWeight: 300 }}>ACTIVE</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Glows */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '60vw', height: '60vh',
        background: `radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)`,
        pointerEvents: 'none'
      }}></div>

    </div>
  );
};

export default Hero;
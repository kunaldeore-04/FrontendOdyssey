import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Power } from 'lucide-react'

const bootLines = [
    "> INITIALIZING CORE_SYSTEMS............",
    "> LOADING MEMORY_MODULES [OK]",
    "> CALIBRATING NEURAL_MATRIX [OK]",
    "> ESTABLISHING NEURAL_LINK [98%]",
    "> ALL SYSTEMS NOMINAL — WELCOME BACK",
]

const BootLine = ({ text, index }) => (
  <motion.p
    className="font-mono text-sm tracking-wide"
    style={{ color: index === bootLines.length - 1 ? '#10b981' : '#fcd34d' }}
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.32, duration: 0.25, ease: 'easeOut' }}
  >
    {text}
  </motion.p>
)

function Loading({ onPowerOn }) {
    

    const [phase, setPhase] = useState(0); //0 : idle 1: booting 2: done

    const handlePowerClick = () => {
   
        setPhase(1);
        setTimeout(() => {
            setPhase(2);
            onPowerOn();
        }, bootLines.length * 320 + 900);
    }
    return (
        <div className='relative flex h-full w-full items-center justify-center'>
            {/*grid bg */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(16,185,129,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.4) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />

            {/*blob*/}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: 420,
                    height: 420,
                    background:
                        'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                }}
                animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />

            <AnimatePresence mode='wait'>
                {phase === 0 && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, filter: 'brightness(3) blur(4px)', transition: { duration: 0.4 } }}
                        className='flex flex-col items-center justify-center gap-5'
                    >
                        <div className="relative flex items-center justify-center">
                            <motion.div
                                className="absolute rounded-full border border-emerald-500/40"
                                style={{ width: 110, height: 110 }}
                                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
                            />
                            <motion.div
                                className="absolute rounded-full border border-emerald-400/20"
                                style={{ width: 80, height: 80 }}
                                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
                            />
                            <motion.button
                                className='realative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gray-900/40 shadow-lg backdrop-blur-sm border border-emerald-400/50'
                                onClick={handlePowerClick}
                                style={{ boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}
                                whileHover={{
                                    scale: 1.1,
                                    boxShadow: '0 0 40px rgba(16,185,129,0.5)'
                                }}
                                whileTap={{ scale: 0.94 }}
                            >
                                <Power className='text-emerald-400' size={26} />

                            </motion.button>
                        </div>

                        <div className='flex flex-col items-center justify-center gap-1'>
                            <span className='font-mono text-xs tracking-tight text-emerald-300/70'>
                                System Standby...
                            </span>
                            <motion.span
                                className='font-mono text-md tracking-wider text-red-400/80'
                                animate={{ opacity: [0.6, 1, 0.6] }}
                                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                Press the button to initalize the system
                            </motion.span>
                        </div>
                    </motion.div>
                )}
                {phase === 1 && (
                    <motion.div
                        key="booting"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{
                            opacity: 0,
                            y: -20,
                            filter: 'blur(6px)',
                            transition: { duration: 0.5 },
                        }}
                        className="w-72 space-y-2 rounded border border-emerald-900/60 bg-gray-950/80 p-6 backdrop-blur"
                        style={{ boxShadow: '0 0 40px rgba(16,185,129,0.08)' }}
                    >
                        {/* Header bar */}
                        <div className="mb-4 flex items-center gap-2 border-b border-emerald-900/40 pb-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-500/70">
                                BOOT SEQUENCE
                            </span>
                        </div>

                        {bootLines.map((line, i) => (
                            <BootLine key={i} text={line} index={i} />
                        ))}

                        {/* Progress bar */}
                        <div className="mt-4 h-px w-full bg-gray-800">
                            <motion.div
                                className="h-px"
                                style={{
                                    background: 'linear-gradient(90deg, #10b981, #fbbf24)',
                                    boxShadow: '0 0 8px #10b981',
                                }}
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ delay: 0.2, duration: bootLines.length * 0.32 + 0.4, ease: 'easeInOut' }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Loading

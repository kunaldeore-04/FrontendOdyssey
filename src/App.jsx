import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Loading from './components/Loading'
import Hero from './components/Hero'
import Memory from './components/Memory'

const HANDOFF_EASE = [0.22, 1, 0.36, 1]
const LAYER_DURATION = 0.55

/** Continues the “through-the-trace” zoom once Hero has committed to the handoff. */
const heroLayerExit = {
  opacity: 0,
  scale: 1.06,
  filter: 'blur(20px) brightness(0.65)',
  transition: { duration: LAYER_DURATION, ease: HANDOFF_EASE },
}

const memoryLayerInitial = {
  opacity: 0,
  filter: 'blur(14px)',
}

const memoryLayerAnimate = {
  opacity: 1,
  filter: 'blur(0px)',
  transition: { duration: 0.65, ease: HANDOFF_EASE },
}

function App() {
  const [screen, setScreen] = useState('loading')
  const [memoryArrivalKey, setMemoryArrivalKey] = useState(0)

  const goToMemory = useCallback(() => {
    setScreen('memory')
    setMemoryArrivalKey((n) => n + 1)
  }, [])

  useEffect(() => {
    if (screen === 'memory') window.scrollTo(0, 0)
  }, [screen])

  return (
    <div className="min-h-screen w-screen bg-gray-950">
      <AnimatePresence mode="wait">
        {screen === 'loading' && (
          <Loading key="loader" onPowerOn={() => setScreen('hero')} />
        )}
      </AnimatePresence>

      {(screen === 'hero' || screen === 'memory') && (
        <AnimatePresence mode="sync">
          {screen === 'hero' && (
            <motion.div
              key="hero"
              className="fixed inset-0 z-10 h-dvh w-screen overflow-hidden bg-[#070707]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={heroLayerExit}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Hero onContinueToMemory={goToMemory} />
            </motion.div>
          )}
          {screen === 'memory' && (
            <motion.div
              key="memory"
              className="fixed inset-0 z-20 h-dvh w-screen overflow-hidden bg-[#070707]"
              initial={memoryLayerInitial}
              animate={memoryLayerAnimate}
            >
              <Memory arrivalKey={memoryArrivalKey} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

export default App

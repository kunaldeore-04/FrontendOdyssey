import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Loading from './components/Loading'
import Hero from './components/Hero'
import Memory from './components/Memory'
import GPU from './components/GPU'
import Motherboard from './components/Motherboard'

/** Smooth scroll-page easing — gradual deceleration into final position */
const SCROLL_EASE = [0.25, 0.46, 0.45, 0.94]
const SLIDE_DURATION = 0.95

function App() {
  const [screen, setScreen] = useState('loading')
  const [memoryArrivalKey, setMemoryArrivalKey] = useState(0)
  /** 'forward' = scrolling down, 'back' = scrolling up */
  const direction = useRef('forward')

  const goToMemory = useCallback(() => {
    direction.current = 'forward'
    setScreen('memory')
    setMemoryArrivalKey((n) => n + 1)
  }, [])

  const goToHero = useCallback(() => {
    direction.current = 'back'
    setScreen('hero')
  }, [])

  const goToGPU = useCallback(() => {
    direction.current = 'forward'
    setScreen('gpu')
  }, [])

  const goToMemoryBack = useCallback(() => {
    direction.current = 'back'
    setScreen('memory')
    setMemoryArrivalKey((n) => n + 1)
  }, [])

  const goToMotherboard = useCallback(() => {
    direction.current = 'forward'
    setScreen('motherboard')
  }, [])

  const goToGPUBack = useCallback(() => {
    direction.current = 'back'
    setScreen('gpu')
  }, [])

  useEffect(() => {
    if (screen === 'memory' || screen === 'gpu' || screen === 'motherboard') window.scrollTo(0, 0)
  }, [screen])

  /**
   * Custom variants that read `direction.current` at animation time.
   * Forward  (Hero→Memory):  Hero exits upward, Memory enters from below.
   * Backward (Memory→Hero):  Memory exits downward, Hero enters from above.
   */
  const heroVariants = {
    initial: () => ({
      y: direction.current === 'back' ? '-18vh' : 0,
      opacity: 0,
      scale: direction.current === 'back' ? 0.97 : 1,
      filter: 'blur(6px)',
    }),
    animate: {
      y: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: { duration: SLIDE_DURATION, ease: SCROLL_EASE },
    },
    exit: () => ({
      y: '-38vh',
      opacity: 0,
      scale: 0.96,
      filter: 'blur(8px)',
      transition: { duration: SLIDE_DURATION, ease: SCROLL_EASE },
    }),
  }

  const memoryVariants = {
    initial: () => ({
      y: direction.current === 'forward' ? '42vh' : '14vh',
      opacity: 0,
      scale: direction.current === 'forward' ? 1.02 : 0.98,
      filter: 'blur(6px)',
    }),
    animate: {
      y: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: { duration: SLIDE_DURATION, ease: SCROLL_EASE },
    },
    exit: () => ({
      y: '38vh',
      opacity: 0,
      scale: 0.97,
      filter: 'blur(8px)',
      transition: { duration: SLIDE_DURATION, ease: SCROLL_EASE },
    }),
  }

  /** Reusable forward/back page variants */
  const makeVariants = (zIndex) => ({
    initial: () => ({
      y: direction.current === 'back' ? '-18vh' : '42vh',
      opacity: 0,
      scale: direction.current === 'back' ? 0.97 : 1.02,
      filter: 'blur(6px)',
    }),
    animate: {
      y: 0, opacity: 1, scale: 1, filter: 'blur(0px)',
      transition: { duration: SLIDE_DURATION, ease: SCROLL_EASE },
    },
    exit: () => ({
      y: direction.current === 'forward' ? '-38vh' : '38vh',
      opacity: 0,
      scale: direction.current === 'forward' ? 0.96 : 0.97,
      filter: 'blur(8px)',
      transition: { duration: SLIDE_DURATION, ease: SCROLL_EASE },
    }),
  })

  const screens = ['hero', 'memory', 'gpu', 'motherboard']

  return (
    <div className="min-h-screen w-screen bg-[#070707] overflow-hidden">
      <AnimatePresence mode="wait">
        {screen === 'loading' && (
          <Loading key="loader" onPowerOn={() => setScreen('hero')} />
        )}
      </AnimatePresence>

      {screens.includes(screen) && (
        <AnimatePresence mode="sync" custom={direction.current}>
          {screen === 'hero' && (
            <motion.div
              key="hero"
              className="fixed inset-0 z-10 h-dvh w-screen overflow-hidden bg-[#070707]"
              custom={direction.current}
              variants={heroVariants}
              initial="initial" animate="animate" exit="exit"
            >
              <Hero onContinueToMemory={goToMemory} />
            </motion.div>
          )}
          {screen === 'memory' && (
            <motion.div
              key="memory"
              className="fixed inset-0 z-20 h-dvh w-screen overflow-hidden bg-[#070707]"
              custom={direction.current}
              variants={memoryVariants}
              initial="initial" animate="animate" exit="exit"
            >
              <Memory arrivalKey={memoryArrivalKey} onBack={goToHero} onContinue={goToGPU} />
            </motion.div>
          )}
          {screen === 'gpu' && (
            <motion.div
              key="gpu"
              className="fixed inset-0 z-30 h-dvh w-screen overflow-hidden bg-[#070707]"
              custom={direction.current}
              variants={makeVariants(30)}
              initial="initial" animate="animate" exit="exit"
            >
              <GPU onBack={goToMemoryBack} onContinue={goToMotherboard} />
            </motion.div>
          )}
          {screen === 'motherboard' && (
            <motion.div
              key="motherboard"
              className="fixed inset-0 z-40 h-dvh w-screen overflow-hidden bg-[#060a06]"
              custom={direction.current}
              variants={makeVariants(40)}
              initial="initial" animate="animate" exit="exit"
            >
              <Motherboard onBack={goToGPUBack} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

export default App

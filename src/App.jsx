import  { useState } from 'react'
import Loading from './components/Loading'
import Hero from './components/Hero'
import { AnimatePresence } from 'framer-motion'

function App() {
  const [booted, setBooted] = useState(false);

  return (
    // Changed bg-gray-900 to bg-gray-950 to match your Loading component's depth
    <div className='h-screen w-screen bg-gray-950 '>
      <AnimatePresence mode="wait">
        {!booted ? (
          <Loading 
            key="loader" 
            onPowerOn={() => setBooted(true)} 
          />
        ) : (
          <Hero key="hero" />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
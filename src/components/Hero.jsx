import { motion } from 'framer-motion'

function Hero() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 1.1, filter: 'brightness(2)' }}
            animate={{ opacity: 1, scale: 1, filter: 'brightness(1)' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className='flex h-full w-full items-center justify-center'
        >
            <h1 className='text-4xl font-bold text-white uppercase tracking-tighter'>
                System Online
            </h1>
        </motion.div>
    )
}
export default Hero
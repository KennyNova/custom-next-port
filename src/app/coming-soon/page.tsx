'use client'

import { motion } from 'framer-motion'

export default function ComingSoonPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Coming Soon
          </motion.h1>
          
          <motion.div
            className="text-8xl md:text-9xl mb-8"
            initial={{ opacity: 0, rotate: -10 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            🤫
          </motion.div>
          
          <motion.p 
            className="text-xl text-muted-foreground max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Something exciting is in the works. Stay tuned.
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}

import React from 'react'
import { motion } from 'framer-motion'

const pageVariants = {
  initial: { 
    opacity: 0, 
    y: 12,
    filter: 'blur(4px)'
  },
  animate: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    }
  },
  exit: { 
    opacity: 0, 
    y: -8,
    filter: 'blur(4px)',
    transition: {
      duration: 0.2,
    }
  }
}

const PageTransition = ({ children }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}

export default PageTransition

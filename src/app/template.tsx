'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface TemplateProps {
    children: ReactNode
}

export default function Template({ children }: TemplateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        >
            {children}
        </motion.div>
    )
}

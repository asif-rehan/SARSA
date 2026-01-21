"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface HoverCardProps {
  children: ReactNode
  className?: string
  hoverScale?: number
  tapScale?: number
}

export function HoverCard({ 
  children, 
  className, 
  hoverScale = 1.02,
  tapScale = 0.98
}: HoverCardProps) {
  return (
    <motion.div
      className={cn("cursor-pointer", className)}
      whileHover={{ 
        scale: hoverScale,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{ 
        scale: tapScale,
        transition: { duration: 0.1 }
      }}
      initial={{ scale: 1 }}
    >
      {children}
    </motion.div>
  )
}
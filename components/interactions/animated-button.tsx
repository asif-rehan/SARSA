"use client"

import { motion } from "framer-motion"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AnimatedButtonProps extends ButtonProps {
  hoverScale?: number
  tapScale?: number
}

export function AnimatedButton({ 
  children, 
  className, 
  hoverScale = 1.05,
  tapScale = 0.95,
  ...props 
}: AnimatedButtonProps) {
  return (
    <motion.div
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
      <Button className={cn(className)} {...props}>
        {children}
      </Button>
    </motion.div>
  )
}
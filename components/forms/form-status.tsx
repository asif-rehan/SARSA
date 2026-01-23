"use client"

import { useState, useEffect } from "react"
import { ErrorMessage } from "./error-message"
import { SuccessMessage } from "./success-message"
import { motion, AnimatePresence } from "framer-motion"

interface FormStatusProps {
  error?: string | null
  success?: string | null
  onClearError?: () => void
  onClearSuccess?: () => void
  autoHideDelay?: number
}

export function FormStatus({ 
  error, 
  success, 
  onClearError, 
  onClearSuccess,
  autoHideDelay = 5000
}: FormStatusProps) {
  const [showError, setShowError] = useState(!!error)
  const [showSuccess, setShowSuccess] = useState(!!success)

  useEffect(() => {
    setShowError(!!error)
  }, [error])

  useEffect(() => {
    setShowSuccess(!!success)
    
    if (success && autoHideDelay > 0) {
      const timer = setTimeout(() => {
        setShowSuccess(false)
        onClearSuccess?.()
      }, autoHideDelay)
      
      return () => clearTimeout(timer)
    }
  }, [success, autoHideDelay, onClearSuccess])

  const handleDismissError = () => {
    setShowError(false)
    onClearError?.()
  }

  const handleDismissSuccess = () => {
    setShowSuccess(false)
    onClearSuccess?.()
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {showError && error && (
          <motion.div
            key={`error-${error}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ErrorMessage 
              message={error} 
              variant="banner"
              onDismiss={handleDismissError}
            />
          </motion.div>
        )}
        
        {showSuccess && success && (
          <motion.div
            key={`success-${success}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SuccessMessage 
              message={success} 
              variant="banner"
              onDismiss={handleDismissSuccess}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
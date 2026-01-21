import { CheckCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SuccessMessageProps {
  message: string
  variant?: "inline" | "banner" | "toast"
  onDismiss?: () => void
  className?: string
}

export function SuccessMessage({ 
  message, 
  variant = "inline", 
  onDismiss,
  className 
}: SuccessMessageProps) {
  const baseClasses = "flex items-center gap-2 text-sm"
  
  const variantClasses = {
    inline: "text-green-600 dark:text-green-400",
    banner: "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800 rounded-md p-3",
    toast: "bg-green-600 text-white rounded-md p-3 shadow-lg"
  }

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      <CheckCircle className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Dismiss success message"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
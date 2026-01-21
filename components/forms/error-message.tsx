import { AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ErrorMessageProps {
  message: string
  variant?: "inline" | "banner" | "toast"
  onDismiss?: () => void
  className?: string
}

export function ErrorMessage({ 
  message, 
  variant = "inline", 
  onDismiss,
  className 
}: ErrorMessageProps) {
  const baseClasses = "flex items-center gap-2 text-sm"
  
  const variantClasses = {
    inline: "text-destructive",
    banner: "bg-destructive/10 text-destructive border border-destructive/20 rounded-md p-3",
    toast: "bg-destructive text-destructive-foreground rounded-md p-3 shadow-lg"
  }

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FieldErrorProps {
  error?: string
  className?: string
}

export function FieldError({ error, className }: FieldErrorProps) {
  if (!error) return null

  return (
    <div className={cn("flex items-center gap-1 text-sm text-destructive mt-1", className)}>
      <AlertCircle className="h-3 w-3 flex-shrink-0" />
      <span>{error}</span>
    </div>
  )
}
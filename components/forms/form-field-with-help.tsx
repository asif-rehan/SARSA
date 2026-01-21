"use client"

import { ReactNode } from "react"
import { HelpCircle } from "lucide-react"
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface FormFieldWithHelpProps {
  label: string
  description?: string
  helpText?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function FormFieldWithHelp({
  label,
  description,
  helpText,
  required = false,
  children,
  className
}: FormFieldWithHelpProps) {
  return (
    <FormItem className={cn(className)}>
      <div className="flex items-center gap-2">
        <FormLabel className="flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </FormLabel>
        {helpText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <FormControl>
        {children}
      </FormControl>
      {description && (
        <FormDescription>
          {description}
        </FormDescription>
      )}
      <FormMessage />
    </FormItem>
  )
}
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("light")
    } else {
      // If system, check current system preference and toggle to opposite
      const systemPrefersDark = typeof window !== "undefined" && 
        window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(systemPrefersDark ? "light" : "dark")
    }
  }

  const isDark = theme === "dark" || (theme === "system" && 
    typeof window !== "undefined" && 
    window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      type="button"
    >
      {isDark ? (
        <Moon className="h-4 w-4" data-testid="moon-icon" />
      ) : (
        <Sun className="h-4 w-4" data-testid="sun-icon" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
"use client"

import { ThemeProvider } from "next-themes"
import { MotionConfig } from "motion/react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 380, damping: 32 }}>
        <TooltipProvider delayDuration={250}>
          {children}
          <Toaster position="bottom-center" />
        </TooltipProvider>
      </MotionConfig>
    </ThemeProvider>
  )
}

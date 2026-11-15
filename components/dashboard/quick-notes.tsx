"use client"

import { motion } from "motion/react"
import { CheckCircleIcon } from "@phosphor-icons/react"
import { rise } from "./motion"

export function QuickNotes({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <motion.section variants={rise} aria-labelledby="notes-title" className="rounded-[28px] bg-butter p-5">
      <div className="flex items-baseline justify-between">
        <h2 id="notes-title" className="text-sm font-semibold">
          Notas rápidas
        </h2>
        <span className="inline-flex items-center gap-1 text-xs text-foreground/60">
          <CheckCircleIcon weight="fill" className="size-3.5" /> salvo
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder="Anote algo…"
        aria-label="Notas rápidas"
        className="mt-3 w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-foreground/40"
      />
    </motion.section>
  )
}

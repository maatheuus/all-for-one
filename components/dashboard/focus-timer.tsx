"use client"

import { useEffect, useImperativeHandle, useState } from "react"
import { motion } from "motion/react"
import { toast } from "sonner"
import { ArrowCounterClockwiseIcon, PauseIcon, PlayIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { rise } from "./motion"

const DURATION = { focus: 25 * 60, break: 5 * 60 } as const
type Mode = keyof typeof DURATION

export type FocusTimerHandle = { start: () => void }

type TimerState = { mode: Mode; remaining: number; endsAt: number | null }

const idle = (mode: Mode): TimerState => ({ mode, remaining: DURATION[mode], endsAt: null })
const startTimer = (t: TimerState): TimerState => (t.endsAt ? t : { ...t, endsAt: Date.now() + t.remaining * 1000 })

export function FocusTimer({ ref }: { ref?: React.Ref<FocusTimerHandle> }) {
  const [timer, setTimer] = useState<TimerState>(idle("focus"))
  const running = timer.endsAt !== null

  const start = () => setTimer(startTimer)
  const pause = () => setTimer((t) => ({ ...t, endsAt: null }))
  const switchMode = (mode: Mode) => setTimer(idle(mode))

  useImperativeHandle(ref, () => ({ start: () => setTimer(startTimer) }), [])

  useEffect(() => {
    if (timer.endsAt === null) return
    const endsAt = timer.endsAt
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.round((endsAt - Date.now()) / 1000))
      if (remaining > 0) {
        setTimer((t) => ({ ...t, remaining }))
        return
      }
      setTimer((t) => {
        const next: Mode = t.mode === "focus" ? "break" : "focus"
        return idle(next)
      })
      toast.success(timer.mode === "focus" ? "Sessão de foco concluída 🎉" : "Pausa encerrada", {
        description: timer.mode === "focus" ? "Hora de uma pausa de 5 minutos." : "Bora para mais um ciclo?",
      })
    }, 250)
    return () => clearInterval(id)
  }, [timer.endsAt, timer.mode])

  const progress = 1 - timer.remaining / DURATION[timer.mode]
  const mm = String(Math.floor(timer.remaining / 60)).padStart(2, "0")
  const ss = String(timer.remaining % 60).padStart(2, "0")

  return (
    <motion.section
      variants={rise}
      id="focus"
      aria-label="Timer de foco"
      className="scroll-mt-6 rounded-[28px] bg-primary p-5 text-primary-foreground"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Foco</h2>
        <div className="flex rounded-full bg-primary-foreground/10 p-0.5 text-xs">
          {(["focus", "break"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={cn(
                "relative rounded-full px-2.5 py-1 font-medium outline-none focus-visible:ring-2 focus-visible:ring-lime",
                timer.mode === m ? "text-lime-foreground" : "opacity-60 hover:opacity-100",
              )}
            >
              {timer.mode === m && (
                <motion.span layoutId="focus-mode" className="absolute inset-0 rounded-full bg-lime" />
              )}
              <span className="relative">{m === "focus" ? "Foco 25" : "Pausa 5"}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative mx-auto my-5 grid size-44 place-items-center">
        <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx="60" cy="60" r="54" fill="none" strokeWidth="6" className="stroke-primary-foreground/10" />
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            className="stroke-lime"
            initial={false}
            animate={{ pathLength: Math.max(progress, 0.001) }}
            transition={{ duration: 0.4, ease: "linear" }}
          />
        </svg>
        <div className="text-center">
          <p className="text-4xl font-medium tracking-tighter tabular-nums">
            {mm}:{ss}
          </p>
          <p className="mt-1 text-xs opacity-60">{running ? (timer.mode === "focus" ? "focando…" : "respira…") : "pronto"}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={running ? pause : start}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-lime px-5 text-sm font-semibold text-lime-foreground outline-none focus-visible:ring-3 focus-visible:ring-lime/50"
        >
          {running ? <PauseIcon weight="fill" className="size-4" /> : <PlayIcon weight="fill" className="size-4" />}
          {running ? "Pausar" : "Começar"}
        </motion.button>
        <button
          type="button"
          onClick={() => switchMode(timer.mode)}
          aria-label="Reiniciar"
          className="grid size-10 place-items-center rounded-full bg-primary-foreground/10 outline-none transition-colors hover:bg-primary-foreground/20 focus-visible:ring-3 focus-visible:ring-lime/50"
        >
          <ArrowCounterClockwiseIcon className="size-4" />
        </button>
      </div>
    </motion.section>
  )
}

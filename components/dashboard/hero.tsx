"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { greeting } from "@/lib/hub"
import { ease, rise } from "./motion"

function RollingText({ text }: { text: string }) {
  return (
    <span className="inline-flex overflow-hidden">
      {text.split("").map((char, i) => (
        <span key={i} className="relative inline-block">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={char}
              className="inline-block"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.45, ease }}
            >
              {char}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  )
}

function Clock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const hh = String(now.getHours()).padStart(2, "0")
  const mm = String(now.getMinutes()).padStart(2, "0")
  const ss = String(now.getSeconds()).padStart(2, "0")

  return (
    <div className="flex items-start gap-1 font-medium tracking-tighter tabular-nums">
      <span className="text-6xl leading-none sm:text-7xl">
        <RollingText text={`${hh}:${mm}`} />
      </span>
      <span className="mt-1 text-lg leading-none text-muted-foreground">
        <RollingText text={ss} />
      </span>
    </div>
  )
}

export function Hero({
  name,
  pendingReads,
  suggestedName,
}: {
  name: string
  pendingReads: number
  suggestedName?: string
}) {
  const [{ hour, dateLabel }] = useState(() => {
    const d = new Date()
    return {
      hour: d.getHours(),
      dateLabel: d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }),
    }
  })
  const { lead, accent } = greeting(hour)
  const words = [lead, accent, `${name}.`]

  return (
    <motion.section variants={rise} className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <p className="mb-3 text-sm font-medium text-muted-foreground first-letter:uppercase">{dateLabel}</p>
        <h1 className="text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95] font-semibold tracking-[-0.045em]">
          {words.map((word, i) => (
            <span key={i} className="mr-[0.22em] inline-flex overflow-hidden pb-[0.08em] align-bottom">
              <motion.span
                className={i === 1 ? "font-serif font-normal tracking-[-0.02em] italic" : undefined}
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.9, ease, delay: 0.15 + i * 0.08 }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>
        <p className="mt-4 max-w-md text-[15px] text-pretty text-muted-foreground">
          {suggestedName ? (
            <>
              Hora de <span className="font-medium text-foreground">{suggestedName}</span>.{" "}
            </>
          ) : null}
          {pendingReads > 0
            ? `${pendingReads} ${pendingReads === 1 ? "leitura pendente" : "leituras pendentes"} na sua fila.`
            : "Fila de leitura zerada. Bom trabalho."}
        </p>
      </div>
      <Clock />
    </motion.section>
  )
}

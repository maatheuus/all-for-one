"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { ease, rise } from "./motion"

const weekdays = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"]

export function ActivityChart({ activity, totalLinks }: { activity: number[]; totalLinks: number }) {
  const [today] = useState(() => new Date().getDay())
  const labels = activity.map((_, i) => weekdays[(today - (activity.length - 1 - i) + 7) % 7])
  const max = Math.max(...activity, 1)
  const total = activity.reduce((sum, n) => sum + n, 0)
  const todayCount = activity.at(-1) ?? 0
  const average = Math.round(total / activity.length)

  return (
    <motion.section variants={rise} aria-labelledby="activity-title" className="rounded-[28px] border bg-card p-5">
      <div className="flex items-baseline justify-between">
        <h2 id="activity-title" className="text-sm font-semibold">
          Atividade
        </h2>
        <span className="text-xs text-muted-foreground">7 dias</span>
      </div>
      <p className="mt-3 text-4xl font-medium tracking-tighter tabular-nums">
        {total}
        <span className="ml-1.5 text-sm font-normal tracking-normal text-muted-foreground">aberturas</span>
      </p>

      <div className="mt-5 flex h-28 items-end gap-2" role="img" aria-label={`Aberturas por dia: ${activity.join(", ")}`}>
        {activity.map((value, i) => {
          const isToday = i === activity.length - 1
          return (
            <div key={i} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <span className="text-[10px] font-medium tabular-nums opacity-0 transition-opacity group-hover:opacity-100">
                {value}
              </span>
              <motion.div
                className={cn("w-full rounded-full", isToday ? "bg-lime" : "bg-muted group-hover:bg-foreground/15")}
                initial={{ height: 0 }}
                animate={{ height: `${(value / max) * 100}%` }}
                transition={{ duration: 0.8, ease, delay: 0.3 + i * 0.05 }}
              />
              <span className={cn("text-[11px]", isToday ? "font-semibold" : "text-muted-foreground")}>{labels[i]}</span>
            </div>
          )
        })}
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-2 border-t pt-4 text-center">
        {[
          { label: "hoje", value: todayCount },
          { label: "média/dia", value: average },
          { label: "links", value: totalLinks },
        ].map((stat) => (
          <div key={stat.label}>
            <dt className="text-[11px] text-muted-foreground">{stat.label}</dt>
            <dd className="text-lg font-semibold tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </motion.section>
  )
}

"use client"

import dynamic from "next/dynamic"

// Client-only: the shell reads localStorage and the current time on first render.
export const HubLoader = dynamic(() => import("./hub-shell").then((m) => m.HubShell), {
  ssr: false,
  loading: () => (
    <div className="mx-auto flex min-h-dvh max-w-[1680px] gap-3 p-2 sm:p-3" aria-busy="true">
      <div className="hidden w-[72px] shrink-0 animate-pulse rounded-[28px] bg-sidebar lg:block" />
      <div className="flex-1 animate-pulse rounded-[32px] bg-surface" />
      <div className="hidden w-[340px] shrink-0 animate-pulse rounded-[28px] bg-card xl:block" />
    </div>
  ),
})

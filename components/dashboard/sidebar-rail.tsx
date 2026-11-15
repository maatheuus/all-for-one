"use client"

import { useTheme } from "next-themes"
import {
  BookmarkSimpleIcon,
  HouseIcon,
  KeyboardIcon,
  LightningIcon,
  MoonIcon,
  SquaresFourIcon,
  SunIcon,
  TimerIcon,
} from "@phosphor-icons/react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const nav = [
  { href: "#top", label: "Início", icon: HouseIcon },
  { href: "#links", label: "Links", icon: SquaresFourIcon },
  { href: "#routines", label: "Rotinas", icon: LightningIcon },
  { href: "#read-later", label: "Ler depois", icon: BookmarkSimpleIcon },
  { href: "#focus", label: "Foco", icon: TimerIcon },
]

const railButton =
  "grid size-11 place-items-center rounded-2xl text-sidebar-foreground/60 outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-3 focus-visible:ring-lime/50"

function RailTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

export function ThemeToggleIcon() {
  const { resolvedTheme } = useTheme()
  return resolvedTheme === "dark" ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />
}

export function SidebarRail({ onShortcuts }: { onShortcuts: () => void }) {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <aside className="sticky top-3 hidden h-[calc(100dvh-1.5rem)] w-[72px] shrink-0 flex-col items-center rounded-[28px] bg-sidebar py-4 text-sidebar-foreground lg:flex">
      <a
        href="#top"
        aria-label="All for One"
        className="grid size-11 place-items-center rounded-2xl bg-lime font-serif text-2xl text-lime-foreground italic outline-none focus-visible:ring-3 focus-visible:ring-lime/50"
      >
        a
      </a>
      <nav aria-label="Seções" className="mt-8 flex flex-col gap-1.5">
        {nav.map(({ href, label, icon: Icon }) => (
          <RailTooltip key={href} label={label}>
            <a href={href} aria-label={label} className={railButton}>
              <Icon className="size-5" />
            </a>
          </RailTooltip>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-1.5">
        <RailTooltip label="Atalhos (?)">
          <button type="button" onClick={onShortcuts} aria-label="Atalhos de teclado" className={railButton}>
            <KeyboardIcon className="size-5" />
          </button>
        </RailTooltip>
        <RailTooltip label="Alternar tema (T)">
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Alternar tema"
            className={railButton}
          >
            <ThemeToggleIcon />
          </button>
        </RailTooltip>
      </div>
    </aside>
  )
}

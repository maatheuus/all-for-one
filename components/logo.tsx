import { cn } from "@/lib/utils"

/** Three paths converging into one point: many links, one place. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={className}>
      <path
        d="M6 7 L19 16 M6 16 H19 M6 25 L19 16"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="16" r="4" fill="currentColor" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("grid size-11 place-items-center rounded-2xl bg-lime text-lime-foreground", className)}>
      <LogoMark className="size-6" />
    </span>
  )
}

import type { Metadata } from "next"
import { RoutinesView } from "@/components/dashboard/views"

export const metadata: Metadata = {
  title: "Rotinas",
  description: "Conjuntos de links que abrem juntos, sugeridos pela hora do dia.",
  alternates: { canonical: "/rotinas" },
}

export default function Page() {
  return <RoutinesView />
}

import type { Metadata } from "next"
import { FocusView } from "@/components/dashboard/views"

export const metadata: Metadata = {
  title: "Foco",
  description: "Timer pomodoro e sua atividade da semana.",
  alternates: { canonical: "/foco" },
}

export default function Page() {
  return <FocusView />
}

import type { Metadata } from "next"
import { ReadLaterView } from "@/components/dashboard/views"

export const metadata: Metadata = {
  title: "Ler depois",
  description: "Artigos e páginas guardados para ler com calma.",
  alternates: { canonical: "/ler-depois" },
}

export default function Page() {
  return <ReadLaterView />
}

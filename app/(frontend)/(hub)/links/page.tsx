import type { Metadata } from "next"
import { LinksView } from "@/components/dashboard/views"

export const metadata: Metadata = {
  title: "Links",
  description: "Todos os seus links, por pasta e por uso.",
  alternates: { canonical: "/links" },
}

export default function Page() {
  return <LinksView />
}

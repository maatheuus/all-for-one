import { getHub } from "@/lib/hub-server"
import { HubLoader } from "@/components/dashboard/hub-loader"

export default async function HubLayout({ children }: LayoutProps<"/">) {
  const hub = await getHub()
  return <HubLoader hub={hub}>{children}</HubLoader>
}

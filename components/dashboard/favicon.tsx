import { cn } from "@/lib/utils"
import { faviconUrl } from "@/lib/hub"

export function Favicon({ url, className }: { url: string; className?: string }) {
  return (
    // Plain <img>: favicons are tiny remote icons, next/image optimization adds nothing here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={faviconUrl(url)}
      alt=""
      width={32}
      height={32}
      loading="lazy"
      className={cn("size-5 rounded-[6px]", className)}
    />
  )
}

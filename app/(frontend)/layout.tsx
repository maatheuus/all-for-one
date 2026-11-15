import type { Metadata, Viewport } from "next";
import { Geist_Mono, Instrument_Serif, Inter_Tight } from "next/font/google";
import { Providers } from "@/components/providers";
import { getHub } from "@/lib/hub-server";
import { BRAND, SITE_URL } from "@/lib/site";
import "./globals.css";

const interTight = Inter_Tight({ variable: "--font-sans", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getHub();

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: "All for One",
    title: { default: site.seoTitle, template: `%s · ${site.seoTitle}` },
    description: site.seoDescription,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: site.seoTitle,
      title: site.seoTitle,
      description: site.seoDescription,
    },
    twitter: { card: "summary_large_image", title: site.seoTitle, description: site.seoDescription },
    appleWebApp: { title: "All for One", statusBarStyle: "black-translucent" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f1ea" },
    { media: "(prefers-color-scheme: dark)", color: BRAND.ink },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${interTight.variable} ${instrumentSerif.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

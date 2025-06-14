import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"

import "@/styles/globals.css"

import { configuration } from "@/lib/config"
import { TailwindIndicator } from "@/components/global/tailwind-indicator"
import { Providers } from "@/components/providers/providers"

const font = Inter({
  subsets: ["latin"],
})

const title = configuration.site.openGraphTitle
const description = configuration.site.openGraphDescription

export const viewport: Viewport = {
  width: "device-width",
  height: "device-height",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export const metadata: Metadata = {
  title,
  description,
  icons: [`https://${configuration.site.domain}/favicon.ico`],
  openGraph: {
    title,
    description,
    images: [configuration.site.openGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [configuration.site.openGraphImage],
    creator: "@kevinswre",
  },
  metadataBase: new URL("https://pulse.com"),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          defer
          data-website-id="UEk_NVURdPixLMpE_Wp7htZI"
          data-domain="app.boringtemplate.com"
          src="https://www.datah.co/js/script.js"
        ></script>
        <script async src="https://cdn.seline.so/seline.js" data-token="8d6979e6af7dde8"></script>
      </head>

      <body className={`${font.className} antialiased`}>
        <Providers>{children}</Providers>
        <TailwindIndicator />
      </body>
    </html>
  )
}

import type { Metadata, Viewport } from "next"
import { DM_Sans, Playfair_Display } from "next/font/google"
import { Toaster } from "sonner"
import { AuthProvider } from "@/components/providers/auth-provider"
import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

export const metadata: Metadata = {
  title: "NearBuy - Buy & Sell Near You, Safely",
  description: "Ghana's trust-protected commerce platform. Every market, within reach. Buy and sell with escrow protection.",
  keywords: ["marketplace", "Ghana", "buy", "sell", "escrow", "trust", "local", "commerce"],
  authors: [{ name: "NearBuy" }],
  openGraph: {
    title: "NearBuy - Buy & Sell Near You, Safely",
    description: "Ghana's trust-protected commerce platform. Every market, within reach.",
    type: "website",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1B6B3A",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster 
            position="bottom-center" 
            toastOptions={{
              className: "font-sans",
              style: {
                background: "var(--ink)",
                color: "#fff",
                borderRadius: "var(--rs)",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}

import type { Metadata } from "next"
import { DM_Sans, Playfair_Display } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "./globals.css"

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
})

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Make My Marriage",
  description: "Your entire wedding. One place. Manage events, guests, budget, vendors, and invitations — together with your family.",
  openGraph: {
    title: "Make My Marriage",
    description: "Your entire wedding. One place. Manage events, guests, budget, vendors, and invitations — together with your family.",
    siteName: "Make My Marriage",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Make My Marriage",
    description: "Your entire wedding. One place. Manage events, guests, budget, vendors, and invitations — together with your family.",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

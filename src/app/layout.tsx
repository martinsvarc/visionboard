import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vision Board',
  description: 'Interactive Vision Board Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen h-full`}>
        <main className="h-full min-h-screen">
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  )
}

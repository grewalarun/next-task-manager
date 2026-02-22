import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'TaskFlow - Project Management',
  description: 'Modern SaaS task management dashboard for teams',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}><Providers>{children}</Providers> <Toaster/></body>
    </html>
  )
}

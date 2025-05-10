import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TanyaJawab',
  description: 'AI powered Q&A platform',
  generator: 'teufik',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

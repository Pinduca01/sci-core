import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SCI Core - Login',
  description: 'Sistema de autenticação SCI Core',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
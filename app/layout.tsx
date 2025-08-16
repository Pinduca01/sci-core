import type { Metadata } from 'next'
import { Inter, Poppins, Montserrat } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap'
})

const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap'
})

const montserrat = Montserrat({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'SCI Core',
  description: 'Sistema de gestão SCI Core',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${poppins.variable} ${montserrat.variable} font-inter`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
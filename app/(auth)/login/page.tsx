'use client'

import { useEffect, useState } from 'react'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const leftColumn = document.querySelector('.left-column') as HTMLElement
      if (!leftColumn) return

      const rect = leftColumn.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      setMousePosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
    }

    const leftColumn = document.querySelector('.left-column')
    if (leftColumn) {
      leftColumn.addEventListener('mousemove', handleMouseMove as EventListener)
      return () => leftColumn.removeEventListener('mousemove', handleMouseMove as EventListener)
    }
  }, [])

  return (
    <div className="min-h-screen flex">
      {/* Coluna Esquerda - Área Visual */}
      <div 
        className="left-column hidden md:flex md:w-[45%] lg:w-[50%] relative spotlight-container gradient-bg"
        style={{
          '--mx': `${mousePosition.x}%`,
          '--my': `${mousePosition.y}%`,
        } as React.CSSProperties}
      >
        {/* Overlay do efeito spotlight */}
        <div className="spotlight-overlay" />
        
        {/* Camada de ruído sutil (opcional) */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Coluna Direita - Formulário */}
      <div className="w-full md:w-[55%] lg:w-[50%] bg-pure-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
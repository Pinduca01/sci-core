'use client'

import { useEffect, useState } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import { BackgroundPaths } from '@/components/ui/background-paths'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex relative overflow-hidden">
      {/* Background Paths Component */}
      <BackgroundPaths />
      
      {/* Coluna Esquerda - Área Visual */}
      <div 
        className="left-column hidden md:flex md:w-[45%] lg:w-[50%] relative z-10"
      >
        {/* Conteúdo da coluna esquerda removido para focar no BackgroundPaths */}
      </div>

      {/* Coluna Direita - Formulário */}
      <div className="w-full md:w-[55%] lg:w-[50%] flex items-center justify-center p-8 relative z-10">
        {/* Overlay para criar opacidade na área do formulário */}
        <div className="absolute inset-0 bg-white/20"></div>
        
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 relative z-20">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
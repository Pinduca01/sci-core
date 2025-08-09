'use client'

import { useEffect, useState } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import Threads from '@/components/ui/threads'
import RotatingText from '@/components/ui/text-component'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex relative overflow-hidden">
      {/* Threads Background Component */}
      <div className="absolute inset-0 z-0">
        <Threads 
          color={[1.0, 0.259, 0.0]} 
          amplitude={1.5} 
          distance={0.3} 
          enableMouseInteraction={true} 
        />
      </div>
      
      {/* Coluna Esquerda - Área Visual */}
      <div
            className="left-column hidden md:flex md:w-[45%] lg:w-[50%] relative z-20 pointer-events-none items-start justify-center pt-48"
          >
        <div className="flex items-start justify-center px-8 h-full">
           <div className="flex items-center gap-8">
             <h1 className="text-6xl lg:text-7xl font-bold text-gray-800 font-montserrat">
                 SCI-Core
               </h1>
             <div className="text-6xl lg:text-7xl font-bold text-orange-500 font-poppins">
               <RotatingText
                 texts={["Controle", "Gestão", "Centralização", "Praticidade"]}
                 rotationInterval={3000}
                 staggerDuration={0.1}
                 className="block"
               />
             </div>
           </div>
         </div>
      </div>

      {/* Coluna Direita - Formulário */}
      <div className="w-full md:w-[55%] lg:w-[50%] flex items-center justify-center p-8 relative z-10 pointer-events-none">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 relative z-20 pointer-events-auto">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
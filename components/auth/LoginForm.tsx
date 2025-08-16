'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { signInWithPassword, resetPasswordForEmail, getUserProfile, getRedirectPathByRole } from '@/lib/auth'
import type { LoginCredentials, AuthError } from '@/lib/auth'

export default function LoginForm() {
  const router = useRouter()
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isResetMode, setIsResetMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  const [shake, setShake] = useState(false)

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!credentials.email || !credentials.password) {
      setError('Por favor, preencha todos os campos')
      triggerShake()
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Autenticar usuário
      const authData = await signInWithPassword(credentials)
      
      if (!authData.user) {
        throw new Error('Erro na autenticação')
      }

      // Buscar perfil do usuário
      const profile = await getUserProfile(authData.user.id)
      
      // Obter caminho de redirecionamento baseado na role
      const redirectPath = getRedirectPathByRole(profile.role)
      
      // Redirecionar
      router.push(redirectPath)
      
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.')
      triggerShake()
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!resetEmail) {
      setError('Por favor, insira seu email')
      triggerShake()
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await resetPasswordForEmail(resetEmail)
      setResetSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar email de recuperação')
      triggerShake()
    } finally {
      setIsLoading(false)
    }
  }

  if (isResetMode) {
    if (resetSuccess) {
      return (
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 font-poppins">
              Email enviado!
            </h1>
            <p className="text-gray-600">
              Verifique sua caixa de entrada para redefinir sua senha.
            </p>
          </div>
          
          <button
            onClick={() => {
              setIsResetMode(false)
              setResetSuccess(false)
              setResetEmail('')
            }}
            className="w-full text-radiant-orange hover:underline"
          >
            Voltar ao login
          </button>
        </div>
      )
    }

    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 font-poppins">
            Recuperar senha
          </h1>
          <p className="text-gray-600">
            Digite seu email para receber as instruções de recuperação.
          </p>
        </div>

        <form onSubmit={handlePasswordReset} className={`space-y-6 ${shake ? 'shake' : ''}`}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 placeholder-gray-400"
                placeholder="Digite seu email"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center"
          >
            {isLoading ? (
              <div className="spinner" />
            ) : (
              'Enviar instruções'
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsResetMode(false)
              setError(null)
            }}
            className="w-full text-gray-600 hover:text-gray-800 transition-colors"
          >
            Voltar ao login
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 font-poppins">
          Bem-vindo(a) de volta
        </h1>
        <p className="text-gray-600">
          Por favor, insira seus dados para continuar.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={`space-y-6 ${shake ? 'shake' : ''}`}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              value={credentials.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 placeholder-gray-400"
              placeholder="Digite seu email"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 placeholder-gray-400"
              placeholder="Digite sua senha"
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-radiant-orange focus:ring-radiant-orange"
            />
            <span className="ml-2 text-sm text-gray-600">Lembrar-me</span>
          </label>
          
          <button
            type="button"
            onClick={() => setIsResetMode(true)}
            className="text-sm text-radiant-orange hover:underline"
            disabled={isLoading}
          >
            Esqueci minha senha
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center"
        >
          {isLoading ? (
            <div className="spinner" />
          ) : (
            'Entrar'
          )}
        </button>
      </form>
    </div>
  )
}
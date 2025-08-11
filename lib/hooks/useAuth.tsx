'use client'

import { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { AuthService } from '../services/authService'
import { BombeiroService } from '../services/bombeiroService'
import { Database } from '../supabase'

type Bombeiro = Database['public']['Tables']['bombeiros']['Row']

interface AuthContextType {
  user: User | null
  profile: Database['public']['Tables']['profiles']['Row'] | null
  bombeiro: Bombeiro | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, role?: string) => Promise<void>
  signOut: () => Promise<void>
  refreshBombeiro: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Database['public']['Tables']['profiles']['Row'] | null>(null)
  const [bombeiro, setBombeiro] = useState<Bombeiro | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const loadBombeiro = async (userId: string) => {
    try {
      const bombeiroData = await BombeiroService.getBombeiroByUserId(userId)
      setBombeiro(bombeiroData)
    } catch (error) {
      console.error('Erro ao carregar dados do bombeiro:', error)
      setBombeiro(null)
    }
  }

  const loadInitialData = async () => {
    try {
      setLoading(true)
      
      const currentSession = await AuthService.getCurrentSession()
      setSession(currentSession)
      
      if (currentSession?.user) {
        setUser(currentSession.user)
        // Não carregar perfil aqui para evitar recursão RLS
        // O listener onAuthStateChange cuidará disso
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { user: authUser, session: authSession } = await AuthService.signIn(email, password)
      
      setUser(authUser)
      setSession(authSession)
      
      // Não carregar perfil imediatamente para evitar recursão RLS
      // O perfil será carregado pelo listener onAuthStateChange
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, role: string = 'user') => {
    try {
      setLoading(true)
      await AuthService.signUp(email, password, role)
    } catch (error) {
      console.error('Erro no registro:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await AuthService.signOut()
      
      setUser(null)
      setProfile(null)
      setBombeiro(null)
      setSession(null)
    } catch (error) {
      console.error('Erro no logout:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const refreshBombeiro = async () => {
    if (user) {
      await loadBombeiro(user.id)
    }
  }

  useEffect(() => {
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)
        
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user)
          setSession(session)
          
          // Tentar carregar perfil com tratamento de erro para recursão RLS
          try {
            const userProfile = await AuthService.getProfileByUserId(session.user.id)
            setProfile(userProfile)
            
            if (userProfile) {
              await loadBombeiro(session.user.id)
            }
          } catch (error) {
            console.warn('Erro ao carregar perfil (possível recursão RLS):', error)
            // Definir perfil básico temporário
            setProfile({
              id: session.user.id,
              email: session.user.email || '',
              role: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setBombeiro(null)
          setSession(null)
        }
        
        setLoading(false)
      }
    )

    loadInitialData()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value: AuthContextType = {
    user,
    profile,
    bombeiro,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshBombeiro
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

const usePermissions = () => {
  const { profile } = useAuth()
  
  const hasPermission = (requiredRole: string) => {
    if (!profile) return false
    return AuthService.hasPermission(profile.role, requiredRole)
  }
  
  const isAdmin = () => hasPermission('admin')
  const isManager = () => hasPermission('manager')
  const isUser = () => hasPermission('user')
  
  return {
    hasPermission,
    isAdmin,
    isManager,
    isUser,
    role: profile?.role || 'guest'
  }
}

export { AuthProvider, useAuth, usePermissions }
export default AuthProvider
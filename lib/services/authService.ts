import { supabase } from '../supabase'
import { Database } from '../supabase'
import { User, Session } from '@supabase/supabase-js'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export interface AuthUser {
  user: User
  profile: Profile
}

export class AuthService {
  // Login com email e senha
  static async signIn(email: string, password: string): Promise<{ user: User; session: Session }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      if (!data.user || !data.session) throw new Error('Falha na autenticação')

      return { user: data.user, session: data.session }
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  // Registro de novo usuário
  static async signUp(email: string, password: string, role: string = 'user'): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) throw error
      if (!data.user) throw new Error('Falha ao criar usuário')

      // Criar perfil do usuário
      await this.createProfile({
        id: data.user.id,
        email: data.user.email!,
        role
      })

      return data.user
    } catch (error) {
      console.error('Erro no registro:', error)
      throw error
    }
  }

  // Logout
  static async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Erro no logout:', error)
      throw error
    }
  }

  // Obter usuário atual
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error)
      return null
    }
  }

  // Obter sessão atual
  static async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('Erro ao obter sessão atual:', error)
      return null
    }
  }

  // Criar perfil do usuário
  static async createProfile(profileData: ProfileInsert): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Erro ao criar perfil:', error)
      throw error
    }
  }

  // Buscar perfil por ID do usuário
  static async getProfileByUserId(userId: string): Promise<Profile | null> {
    try {
      // Tentar buscar na tabela profiles primeiro
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // Se houver erro (incluindo recursão RLS), criar perfil básico
        console.warn('Erro ao buscar perfil, criando perfil básico:', error.message)
        
        const { data: userData } = await supabase.auth.getUser()
        
        return {
          id: userId,
          email: userData.user?.email || '',
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Profile
      }

      return data
    } catch (error: any) {
      // Fallback para perfil básico em caso de qualquer erro
      console.warn('Erro inesperado ao buscar perfil, usando fallback:', error.message)
      
      const { data: userData } = await supabase.auth.getUser()
      
      return {
        id: userId,
        email: userData.user?.email || '',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Profile
    }
  }

  // Atualizar perfil
  static async updateProfile(userId: string, profileData: ProfileUpdate): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      throw error
    }
  }

  // Obter usuário completo (user + profile)
  static async getAuthUser(): Promise<AuthUser | null> {
    try {
      const user = await this.getCurrentUser()
      if (!user) return null

      const profile = await this.getProfileByUserId(user.id)
      if (!profile) return null

      return { user, profile }
    } catch (error) {
      console.error('Erro ao obter usuário completo:', error)
      return null
    }
  }

  // Verificar se usuário tem permissão
  static hasPermission(userRole: string, requiredRole: string): boolean {
    const roleHierarchy = {
      'admin': 4,
      'manager': 3,
      'user': 2,
      'guest': 1
    }

    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

    return userLevel >= requiredLevel
  }

  // Reset de senha
  static async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error
    } catch (error) {
      console.error('Erro ao solicitar reset de senha:', error)
      throw error
    }
  }

  // Atualizar senha
  static async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
    } catch (error) {
      console.error('Erro ao atualizar senha:', error)
      throw error
    }
  }

  // Listener para mudanças de autenticação
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
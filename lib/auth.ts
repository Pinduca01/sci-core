import { supabase } from './supabase'
import { authConfig } from './auth.config'

export interface LoginCredentials {
  email: string
  password: string
}

export class AuthError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

export interface UserProfile {
  id: string
  email: string
  role: string
}

export async function signInWithPassword({ email, password }: LoginCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new AuthError(error.message, error.message)
  }

  return data
}

export async function resetPasswordForEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) {
    throw new AuthError(error.message, error.message)
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  // Primeiro, tentar usar a função RPC que criamos
  try {
    const { data: profileData, error: rpcError } = await supabase
      .rpc('get_user_profile')
    
    if (!rpcError && profileData && profileData.length > 0) {
      return {
        id: profileData[0].id,
        email: profileData[0].email,
        role: profileData[0].role
      }
    }
  } catch (rpcError) {
    console.warn('Erro ao usar RPC get_user_profile:', rpcError)
  }

  // Fallback: buscar diretamente na tabela profiles
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Erro detalhado:', error)
    throw new AuthError(`Erro ao buscar perfil do usuário: ${error.message}`, error.code)
  }

  if (!data) {
    throw new AuthError('Perfil do usuário não encontrado', 'PROFILE_NOT_FOUND')
  }

  return data
}

export function getRedirectPathByRole(role: string): string {
  // Mapeamento atualizado para as roles que configuramos no Supabase
  const rolePathMap: { [key: string]: string } = {
    'admin': '/dashboard/admin',
    'manager': '/dashboard/manager', 
    'user': '/dashboard/user',
    // Manter compatibilidade com roles antigas se existirem
    'GS': '/dashboard/admin',
    'BA_CE': '/dashboard/team-lead',
    'ANALYST': '/dashboard/analyst',
    'MANAGER': '/dashboard/manager',
    'USER': '/dashboard/user',
  }
  
  return rolePathMap[role] || '/dashboard'
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new AuthError(error.message, error.message)
  }
}

export function getCurrentUser() {
  return supabase.auth.getUser()
}
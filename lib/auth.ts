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
  const { data, error } = await supabase
    .from(authConfig.profileSource)
    .select('id, email, role')
    .eq('id', userId)
    .single()

  if (error) {
    throw new AuthError('Erro ao buscar perfil do usuário', error.code)
  }

  return data
}

export function getRedirectPathByRole(role: string): string {
  // TODO: Expandir mapeamento conforme necessário
  const rolePathMap: { [key: string]: string } = {
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
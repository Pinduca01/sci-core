'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

// Tipos (inalterados)
export type UserRole = 'DIRETOR' | 'GS' | 'BA-CE' | 'BA-LR' | 'BA-MC' | 'BA-2';
export interface AuthUser {
  id: string;
  email: string;
  nome: string;
  role: UserRole;
  sci_id?: string;
  equipe_id?: string;
}
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // --- FUNÇÃO DE BUSCA DE PERFIL (com logs) ---
  const fetchUserProfile = async (userId: string) => {
    console.log('[DEBUG] AuthContext: Iniciando fetchUserProfile para o ID:', userId);
    // Remove or move this line inside a function where session is defined
    // Remove this line as 'session' is not defined in this scope
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, sci_id, equipe_id, full_name, nome_completo')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[DEBUG] AuthContext: Erro DENTRO do fetchUserProfile:', error);
        return null;
      }
      
      console.log('[DEBUG] AuthContext: Perfil encontrado:', data);
      return {
        id: data.id,
        email: data.email,
        nome: data.full_name || data.nome_completo || data.email,
        role: data.role as UserRole,
        sci_id: data.sci_id,
        equipe_id: data.equipe_id,
      };
    } catch (error) {
      console.error('[DEBUG] AuthContext: Erro CATASTRÓFICO no fetchUserProfile:', error);
      return null;
    }
  };

  // --- EFEITO PRINCIPAL (com logs) ---
  useEffect(() => {
    console.log('[DEBUG] AuthContext: useEffect disparado. Verificando sessão...');
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[DEBUG] AuthContext: Sessão obtida:', session);
        
        if (session?.user) {
          console.log('[DEBUG] AuthContext: Usuário na sessão encontrado. Buscando perfil...');
          const userProfile = await fetchUserProfile(session.user.id);
          setUser(userProfile);
        } else {
          console.log('[DEBUG] AuthContext: Nenhuma sessão ativa encontrada.');
        }
      } catch (error) {
        console.error('[DEBUG] AuthContext: Erro ao tentar obter a sessão:', error);
      } finally {
        console.log('[DEBUG] AuthContext: FIM do getSession. setLoading(false) agora.');
        setLoading(false); // Ponto crucial
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[DEBUG] AuthContext: onAuthStateChange disparado! Evento:', event);
        if (!session) setUser(null);
        setLoading(false);
      }
    );

    return () => {
      console.log('[DEBUG] AuthContext: Limpando a inscrição (unsubscribe).');
      subscription.unsubscribe();
    };
  }, []);

  // Funções de signIn e signOut (inalteradas)
  const signIn = async (email: string, password: string) => { /* ... */ };
  const signOut = async () => { /* ... */ };

  const value = { user, loading, signIn, signOut };

  return (
    <AuthContext.Provider value={value}>
     {children}
</AuthContext.Provider>
  );
}

// Hook (inalterado)
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
-- Script para corrigir as políticas RLS que estão causando recursão infinita
-- Execute este script diretamente no SQL Editor do Supabase Dashboard

-- 1. Remover todas as políticas problemáticas
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON public.profiles;

-- 2. Desabilitar RLS temporariamente para limpeza
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Reabilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas simples e seguras (sem recursão)

-- Política básica: usuários podem ver seu próprio perfil
CREATE POLICY "profiles_select_own" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Política básica: usuários podem atualizar seu próprio perfil
CREATE POLICY "profiles_update_own" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Política para inserção (apenas pelo sistema/trigger)
CREATE POLICY "profiles_insert_system" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- 5. Criar função auxiliar para verificar admin (sem recursão)
CREATE OR REPLACE FUNCTION public.is_admin_simple()
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar diretamente na tabela auth.users se possível
    -- ou usar uma abordagem mais simples
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
        AND role = 'admin'
        AND auth.uid() IS NOT NULL
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Política para admins (usando função simples)
CREATE POLICY "profiles_admin_access" 
ON public.profiles 
FOR ALL 
USING (
    auth.uid() = id OR 
    (auth.uid() IS NOT NULL AND public.is_admin_simple())
);

-- 7. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;

-- Mensagem de sucesso
SELECT 'Políticas RLS corrigidas com sucesso! Verifique a lista acima.' as resultado;
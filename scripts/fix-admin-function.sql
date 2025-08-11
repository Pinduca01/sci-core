-- Script para corrigir a função is_admin_user
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. Remover função atual
DROP FUNCTION IF EXISTS public.is_admin_user();

-- 2. Criar nova função que verifica pela tabela profiles ao invés de auth.users
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  );
$$;

-- 3. Testar a função
SELECT public.is_admin_user() as is_admin_test;

-- 4. Verificar se o usuário gs.teste@medmais.com tem role admin
SELECT id, email, role FROM public.profiles WHERE email = 'gs.teste@medmais.com';

SELECT 'Função is_admin_user corrigida com sucesso!' as resultado;
-- Script para corrigir apenas a política RLS da tabela bombeiros
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Remover a política existente (se houver)
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.bombeiros;

-- 2. Criar nova política com sintaxe correta
CREATE POLICY "Enable all operations for authenticated users" ON public.bombeiros
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 3. Verificar se a política foi criada corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'bombeiros';
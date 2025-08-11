-- Script para corrigir problemas do banco de dados
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. Remover políticas RLS problemáticas
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem atualizar todos os perfis" ON public.profiles;

-- 2. Remover função problemática se existir
DROP FUNCTION IF EXISTS public.is_admin_or_manager();

-- 3. Criar função simples para verificar admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email IN ('admin@sci.com', 'gs.teste@medmais.com', 'admin@sci-core.com')
  );
$$;

-- 4. Recriar tabela profiles se necessário
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    nome_completo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS simples e seguras
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON public.profiles
    FOR SELECT USING (public.is_admin_user());

CREATE POLICY "profiles_update_admin" ON public.profiles
    FOR UPDATE USING (public.is_admin_user());

CREATE POLICY "profiles_insert_admin" ON public.profiles
    FOR INSERT WITH CHECK (public.is_admin_user());

-- 7. Recriar tabela bombeiros se necessário
CREATE TABLE IF NOT EXISTS public.bombeiros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    numero_bombeiro TEXT UNIQUE NOT NULL,
    nome_completo TEXT NOT NULL,
    cpf TEXT UNIQUE,
    rg TEXT,
    data_nascimento DATE,
    telefone TEXT,
    email TEXT,
    endereco TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,
    posto_graduacao TEXT,
    situacao TEXT DEFAULT 'ativo',
    data_admissao DATE,
    salario DECIMAL(10,2),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Habilitar RLS para bombeiros
ALTER TABLE public.bombeiros ENABLE ROW LEVEL SECURITY;

-- 9. Criar políticas RLS para bombeiros
CREATE POLICY "bombeiros_select_own" ON public.bombeiros
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "bombeiros_update_own" ON public.bombeiros
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "bombeiros_select_admin" ON public.bombeiros
    FOR SELECT USING (public.is_admin_user());

CREATE POLICY "bombeiros_update_admin" ON public.bombeiros
    FOR UPDATE USING (public.is_admin_user());

CREATE POLICY "bombeiros_insert_admin" ON public.bombeiros
    FOR INSERT WITH CHECK (public.is_admin_user());

CREATE POLICY "bombeiros_delete_admin" ON public.bombeiros
    FOR DELETE USING (public.is_admin_user());

-- 10. Criar tabela documentos se necessário
CREATE TABLE IF NOT EXISTS public.documentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bombeiro_id UUID REFERENCES public.bombeiros(id) ON DELETE CASCADE,
    nome_arquivo TEXT NOT NULL,
    tipo_documento TEXT,
    url_arquivo TEXT NOT NULL,
    tamanho_arquivo BIGINT,
    data_upload TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id)
);

-- 11. Habilitar RLS para documentos
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

-- 12. Criar políticas RLS para documentos
CREATE POLICY "documentos_select_own" ON public.documentos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bombeiros 
            WHERE bombeiros.id = documentos.bombeiro_id 
            AND bombeiros.user_id = auth.uid()
        )
    );

CREATE POLICY "documentos_insert_own" ON public.documentos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bombeiros 
            WHERE bombeiros.id = documentos.bombeiro_id 
            AND bombeiros.user_id = auth.uid()
        )
    );

CREATE POLICY "documentos_select_admin" ON public.documentos
    FOR SELECT USING (public.is_admin_user());

CREATE POLICY "documentos_insert_admin" ON public.documentos
    FOR INSERT WITH CHECK (public.is_admin_user());

CREATE POLICY "documentos_delete_admin" ON public.documentos
    FOR DELETE USING (public.is_admin_user());

-- 13. Criar triggers para updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_updated_at_profiles ON public.profiles;
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_bombeiros ON public.bombeiros;
CREATE TRIGGER handle_updated_at_bombeiros
    BEFORE UPDATE ON public.bombeiros
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 14. Inserir dados de teste se não existirem
INSERT INTO public.profiles (id, email, role, nome_completo)
SELECT 
    auth.users.id,
    auth.users.email,
    CASE 
        WHEN auth.users.email IN ('admin@sci.com', 'gs.teste@medmais.com', 'admin@sci-core.com') THEN 'admin'
        ELSE 'user'
    END,
    COALESCE(auth.users.raw_user_meta_data->>'full_name', 'Usuário')
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.users.id
);

-- 15. Atualizar cache do schema
NOTIFY pgrst, 'reload schema';

SELECT 'Script executado com sucesso! Tabelas e políticas RLS criadas/atualizadas.' as resultado;
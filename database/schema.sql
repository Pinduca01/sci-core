-- Criação das tabelas para o sistema SCI-Core
-- Execute este script no SQL Editor do Supabase

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de perfis (já existe, mas vamos garantir que está correta)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'guest')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de bombeiros
CREATE TABLE IF NOT EXISTS public.bombeiros (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    nome_completo TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    rg TEXT NOT NULL,
    data_nascimento DATE NOT NULL,
    telefone TEXT NOT NULL,
    endereco TEXT NOT NULL,
    cep TEXT NOT NULL,
    cidade TEXT NOT NULL,
    estado TEXT NOT NULL,
    posto_graduacao TEXT NOT NULL,
    numero_bombeiro TEXT UNIQUE NOT NULL,
    unidade TEXT NOT NULL,
    data_admissao DATE NOT NULL,
    situacao TEXT NOT NULL DEFAULT 'ativo' CHECK (situacao IN ('ativo', 'inativo', 'licenca', 'aposentado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de documentos
CREATE TABLE IF NOT EXISTS public.documentos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bombeiro_id UUID REFERENCES public.bombeiros(id) ON DELETE CASCADE NOT NULL,
    nome_original TEXT NOT NULL,
    nome_personalizado TEXT,
    tipo_documento TEXT NOT NULL,
    tamanho BIGINT NOT NULL,
    url_arquivo TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_bombeiros_user_id ON public.bombeiros(user_id);
CREATE INDEX IF NOT EXISTS idx_bombeiros_cpf ON public.bombeiros(cpf);
CREATE INDEX IF NOT EXISTS idx_bombeiros_numero_bombeiro ON public.bombeiros(numero_bombeiro);
CREATE INDEX IF NOT EXISTS idx_documentos_bombeiro_id ON public.documentos(bombeiro_id);
CREATE INDEX IF NOT EXISTS idx_documentos_created_at ON public.documentos(created_at DESC);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bombeiros_updated_at ON public.bombeiros;
CREATE TRIGGER update_bombeiros_updated_at
    BEFORE UPDATE ON public.bombeiros
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documentos_updated_at ON public.documentos;
CREATE TRIGGER update_documentos_updated_at
    BEFORE UPDATE ON public.documentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Função para criar perfil automaticamente quando um usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'user');
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Políticas de segurança (RLS - Row Level Security)

-- Habilitar RLS nas tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bombeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem ver seu próprio perfil"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.profiles;
CREATE POLICY "Admins podem ver todos os perfis"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para bombeiros
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.bombeiros;
CREATE POLICY "Usuários podem ver seus próprios dados"
    ON public.bombeiros FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir seus próprios dados" ON public.bombeiros;
CREATE POLICY "Usuários podem inserir seus próprios dados"
    ON public.bombeiros FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON public.bombeiros;
CREATE POLICY "Usuários podem atualizar seus próprios dados"
    ON public.bombeiros FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins podem ver todos os bombeiros" ON public.bombeiros;
CREATE POLICY "Admins podem ver todos os bombeiros"
    ON public.bombeiros FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Políticas para documentos
DROP POLICY IF EXISTS "Usuários podem ver seus próprios documentos" ON public.documentos;
CREATE POLICY "Usuários podem ver seus próprios documentos"
    ON public.documentos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.bombeiros
            WHERE id = bombeiro_id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Usuários podem inserir seus próprios documentos" ON public.documentos;
CREATE POLICY "Usuários podem inserir seus próprios documentos"
    ON public.documentos FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bombeiros
            WHERE id = bombeiro_id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios documentos" ON public.documentos;
CREATE POLICY "Usuários podem atualizar seus próprios documentos"
    ON public.documentos FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.bombeiros
            WHERE id = bombeiro_id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Usuários podem deletar seus próprios documentos" ON public.documentos;
CREATE POLICY "Usuários podem deletar seus próprios documentos"
    ON public.documentos FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.bombeiros
            WHERE id = bombeiro_id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins podem ver todos os documentos" ON public.documentos;
CREATE POLICY "Admins podem ver todos os documentos"
    ON public.documentos FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Criar bucket para documentos (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos-bombeiros', 'documentos-bombeiros', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para o storage bucket
DROP POLICY IF EXISTS "Usuários podem fazer upload de seus documentos" ON storage.objects;
CREATE POLICY "Usuários podem fazer upload de seus documentos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'documentos-bombeiros' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Usuários podem ver seus próprios arquivos" ON storage.objects;
CREATE POLICY "Usuários podem ver seus próprios arquivos"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'documentos-bombeiros' AND
        (
            auth.uid()::text = (storage.foldername(name))[1] OR
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role IN ('admin', 'manager')
            )
        )
    );

DROP POLICY IF EXISTS "Usuários podem deletar seus próprios arquivos" ON storage.objects;
CREATE POLICY "Usuários podem deletar seus próprios arquivos"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'documentos-bombeiros' AND
        (
            auth.uid()::text = (storage.foldername(name))[1] OR
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role IN ('admin', 'manager')
            )
        )
    );

-- Inserir dados de exemplo (opcional)
-- Descomente as linhas abaixo se quiser dados de teste

/*
-- Inserir perfil admin de exemplo
INSERT INTO public.profiles (id, email, role)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@sci-core.com',
    'admin'
) ON CONFLICT (id) DO NOTHING;

-- Inserir bombeiro de exemplo
INSERT INTO public.bombeiros (
    user_id,
    nome_completo,
    cpf,
    rg,
    data_nascimento,
    telefone,
    endereco,
    cep,
    cidade,
    estado,
    posto_graduacao,
    numero_bombeiro,
    unidade,
    data_admissao
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'João Silva Santos',
    '123.456.789-00',
    '12.345.678-9',
    '1985-05-15',
    '(11) 99999-9999',
    'Rua das Flores, 123',
    '01234-567',
    'São Paulo',
    'SP',
    'Soldado',
    'BM-12345',
    '1º Batalhão',
    '2010-03-01'
) ON CONFLICT (user_id) DO NOTHING;
*/

-- Comentários finais
-- Este script cria toda a estrutura necessária para o sistema SCI-Core
-- Inclui tabelas, índices, triggers, políticas de segurança e bucket de storage
-- Execute no SQL Editor do Supabase para configurar o banco de dados
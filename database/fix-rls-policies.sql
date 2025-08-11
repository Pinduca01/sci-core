-- Script para corrigir as políticas RLS que estão causando recursão infinita
-- Execute este script no SQL Editor do Supabase

-- Remover todas as políticas existentes para recriá-las corretamente
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem ver todos os bombeiros" ON public.bombeiros;
DROP POLICY IF EXISTS "Admins podem ver todos os documentos" ON public.documentos;

-- Políticas corrigidas para profiles (sem recursão)
-- Política básica: usuários podem ver e editar seu próprio perfil
CREATE POLICY "Usuários podem ver seu próprio perfil"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Política para inserção de novos perfis (apenas pelo trigger)
CREATE POLICY "Sistema pode inserir perfis"
    ON public.profiles FOR INSERT
    WITH CHECK (true);

-- Políticas corrigidas para bombeiros
-- Manter as políticas existentes que não causam recursão
CREATE POLICY "Usuários podem ver seus próprios dados bombeiro"
    ON public.bombeiros FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios dados bombeiro"
    ON public.bombeiros FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios dados bombeiro"
    ON public.bombeiros FOR UPDATE
    USING (auth.uid() = user_id);

-- Política simplificada para admins/managers (usando função)
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Agora usar a função nas políticas para evitar recursão
CREATE POLICY "Admins podem gerenciar bombeiros"
    ON public.bombeiros FOR ALL
    USING (public.is_admin_or_manager());

-- Políticas para documentos (mantendo as existentes que funcionam)
CREATE POLICY "Usuários podem gerenciar seus próprios documentos"
    ON public.documentos FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.bombeiros
            WHERE id = bombeiro_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins podem gerenciar todos os documentos"
    ON public.documentos FOR ALL
    USING (public.is_admin_or_manager());

-- Política especial para permitir que admins vejam todos os perfis
-- Usando uma abordagem diferente para evitar recursão
CREATE POLICY "Admins podem ver todos os perfis"
    ON public.profiles FOR SELECT
    USING (
        auth.uid() = id OR 
        public.is_admin_or_manager()
    );

-- Comentário: 
-- A função is_admin_or_manager() é marcada como SECURITY DEFINER
-- Isso significa que ela executa com os privilégios do criador (superuser)
-- evitando assim a recursão nas políticas RLS
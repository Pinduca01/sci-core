# 🔧 Instruções para Corrigir Problemas do Banco de Dados

## Problema Identificado
O sistema está apresentando os seguintes erros:
- ❌ `Could not find the table 'public.bombeiros' in the schema cache`
- ❌ `infinite recursion detected in policy for relation "profiles"`
- ❌ Redirecionamento incorreto após login

## ✅ Solução: Execute o SQL no Supabase Dashboard

### Passo 1: Acesse o Supabase Dashboard
1. Abra seu navegador
2. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
3. Faça login na sua conta
4. Selecione seu projeto

### Passo 2: Abra o SQL Editor
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**

### Passo 3: Execute o SQL de Correção
Copie e cole o seguinte SQL no editor:

```sql
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

-- 7. Recriar tabela bombeiros
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

-- 10. Criar tabela documentos
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

-- 14. Inserir dados de teste
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
```

### Passo 4: Executar o SQL
1. Clique no botão **"Run"** (ou pressione Ctrl+Enter)
2. Aguarde a execução completar
3. Verifique se não há erros na saída

### Passo 5: Verificar Tabelas
Após executar o SQL, verifique se as tabelas foram criadas:
1. No menu lateral, clique em **"Table Editor"**
2. Você deve ver as tabelas: `profiles`, `bombeiros`, `documentos`

## 🔄 Após Executar o SQL

### 1. Reiniciar o Servidor de Desenvolvimento
```bash
# Pare o servidor (Ctrl+C) e reinicie
npm run dev
```

### 2. Limpar Cache do Navegador
- Pressione `Ctrl+Shift+R` para recarregar sem cache
- Ou abra o DevTools (F12) > Network > marque "Disable cache"

### 3. Testar o Login
- Acesse `http://localhost:3001/login`
- Use as credenciais:
  - **Email**: `gs.teste@medmais.com` (admin)
  - **Senha**: (verifique no Supabase Dashboard > Authentication > Users)

## 🎯 Credenciais de Teste

Para criar um usuário de teste:
1. No Supabase Dashboard, vá para **Authentication > Users**
2. Clique em **"Add user"**
3. Crie um usuário com email `teste@sci.com` e senha `123456`
4. O sistema automaticamente criará o perfil correspondente

## ❓ Se Ainda Houver Problemas

1. **Erro de tabela não encontrada**: Execute o SQL novamente
2. **Erro de recursão**: Verifique se as políticas RLS foram recriadas
3. **Redirecionamento incorreto**: Limpe o cache do navegador completamente
4. **Erro de autenticação**: Verifique as credenciais no Supabase Dashboard

## 📞 Suporte
Se os problemas persistirem, verifique:
- Logs do console do navegador (F12)
- Logs do servidor Next.js
- Configurações do projeto no Supabase Dashboard
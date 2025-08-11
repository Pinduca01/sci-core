# 🔧 Instruções para Corrigir Problema do Admin

## 📋 Problema Identificado

O usuário admin `gs.teste@medmais.com` existe e tem a role 'admin' correta, mas a função `is_admin_user()` não está funcionando adequadamente, impedindo o acesso às funcionalidades administrativas.

## 🛠️ Solução

### Passo 1: Executar SQL no Supabase Dashboard

1. Acesse o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Execute o seguinte SQL:

```sql
-- Corrigir função is_admin_user
DROP FUNCTION IF EXISTS public.is_admin_user();

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

-- Atualizar cache do schema
NOTIFY pgrst, 'reload schema';

SELECT 'Função is_admin_user corrigida!' as resultado;
```

### Passo 2: Verificar se as tabelas existem

Se ainda houver erro da tabela `bombeiros`, execute também:

```sql
-- Executar todo o script de correção
-- (Copie e cole o conteúdo do arquivo scripts/fix-database.sql)
```

### Passo 3: Reiniciar o Servidor

1. Pare o servidor atual (Ctrl+C no terminal)
2. Execute: `npm run dev`

### Passo 4: Limpar Cache do Navegador

1. Abra as **Ferramentas do Desenvolvedor** (F12)
2. Clique com botão direito no botão de atualizar
3. Selecione **"Esvaziar cache e recarregar forçadamente"**

### Passo 5: Testar o Login

**Credenciais do Admin:**
- Email: `gs.teste@medmais.com`
- Senha: `123456`

Após o login, você deve ser redirecionado para `/dashboard/admin` e ver a tela administrativa completa.

## 🔍 Diagnóstico Atual

✅ **Usuário admin existe**: `gs.teste@medmais.com`  
✅ **Role correta**: `admin`  
✅ **Perfil na tabela profiles**: Criado  
❌ **Função is_admin_user**: Precisa ser corrigida  
✅ **Página admin existe**: `/dashboard/admin/page.tsx`  

## 🚨 Se o Problema Persistir

Se após seguir todos os passos o problema continuar:

1. Execute o diagnóstico: `node scripts/debug-admin-profile.js`
2. Verifique os logs do navegador (F12 > Console)
3. Verifique se há erros no terminal do servidor

## 📞 Informações Técnicas

- **ID do usuário admin**: `6c403dac-ad45-4db6-a873-ac3879945279`
- **Email**: `gs.teste@medmais.com`
- **Role**: `admin`
- **Página de destino**: `/dashboard/admin`

O problema está na função `is_admin_user()` que não está reconhecendo corretamente o usuário como admin, impedindo o acesso às políticas RLS e consequentemente às funcionalidades administrativas.
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixRLSPolicies() {
  console.log('Iniciando correção das políticas RLS...')
  
  try {
    // Remover políticas existentes
    console.log('Removendo políticas existentes...')
    
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON profiles;',
      'DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON profiles;',
      'DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON profiles;',
      'DROP POLICY IF EXISTS "Admins podem atualizar todos os perfis" ON profiles;',
      'DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON profiles;'
    ]
    
    for (const policy of dropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy })
      if (error && !error.message.includes('does not exist')) {
        console.warn('Erro ao remover política:', error.message)
      }
    }
    
    // Criar função auxiliar para verificar admin
    console.log('Criando função auxiliar...')
    
    const createFunction = `
      CREATE OR REPLACE FUNCTION is_admin_or_manager()
      RETURNS BOOLEAN
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        RETURN EXISTS (
          SELECT 1 FROM auth.users 
          WHERE auth.users.id = auth.uid()
          AND auth.users.email IN (
            'admin@sci.com',
            'manager@sci.com',
            'gs.teste@medmais.com'
          )
        );
      END;
      $$;
    `
    
    const { error: funcError } = await supabase.rpc('exec_sql', { sql: createFunction })
    if (funcError) {
      console.error('Erro ao criar função:', funcError.message)
    } else {
      console.log('Função auxiliar criada com sucesso')
    }
    
    // Criar novas políticas
    console.log('Criando novas políticas...')
    
    const newPolicies = [
      `CREATE POLICY "Usuários podem ver seu próprio perfil" ON profiles
       FOR SELECT USING (auth.uid() = id);`,
       
      `CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON profiles
       FOR UPDATE USING (auth.uid() = id);`,
       
      `CREATE POLICY "Usuários podem inserir seu próprio perfil" ON profiles
       FOR INSERT WITH CHECK (auth.uid() = id);`,
       
      `CREATE POLICY "Admins podem ver todos os perfis" ON profiles
       FOR SELECT USING (is_admin_or_manager());`,
       
      `CREATE POLICY "Admins podem atualizar todos os perfis" ON profiles
       FOR UPDATE USING (is_admin_or_manager());`
    ]
    
    for (const policy of newPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy })
      if (error) {
        console.error('Erro ao criar política:', error.message)
      } else {
        console.log('Política criada com sucesso')
      }
    }
    
    console.log('Correção das políticas RLS concluída!')
    
  } catch (error) {
    console.error('Erro durante a correção:', error)
  }
}

fixRLSPolicies()
  .then(() => {
    console.log('Script executado com sucesso')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Erro fatal:', error)
    process.exit(1)
  })
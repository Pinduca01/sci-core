const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRLSPolicies() {
  console.log('🔧 Iniciando correção das políticas RLS...');
  
  try {
    // 1. Remover políticas problemáticas
    console.log('🗑️ Removendo políticas existentes...');
    
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON profiles',
      'DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON profiles',
      'DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON profiles',
      'DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON profiles'
    ];
    
    for (const sql of dropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error && !error.message.includes('does not exist')) {
        console.log(`⚠️ Aviso ao remover política: ${error.message}`);
      }
    }
    
    // 2. Criar função auxiliar sem recursão
    console.log('🔧 Criando função auxiliar...');
    const createFunction = `
      CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
      RETURNS BOOLEAN AS $$
      DECLARE
        user_role TEXT;
      BEGIN
        SELECT role INTO user_role FROM auth.users 
        WHERE id = auth.uid();
        
        RETURN user_role IN ('admin', 'manager');
      EXCEPTION
        WHEN OTHERS THEN
          RETURN FALSE;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    const { error: funcError } = await supabase.rpc('exec_sql', { sql: createFunction });
    if (funcError) {
      console.log('⚠️ Aviso ao criar função:', funcError.message);
    }
    
    // 3. Criar políticas simples
    console.log('✨ Criando novas políticas...');
    
    const newPolicies = [
      `CREATE POLICY "profiles_select_own" ON profiles
        FOR SELECT USING (auth.uid() = id)`,
      
      `CREATE POLICY "profiles_update_own" ON profiles
        FOR UPDATE USING (auth.uid() = id)`,
      
      `CREATE POLICY "profiles_insert_system" ON profiles
        FOR INSERT WITH CHECK (true)`
    ];
    
    for (const sql of newPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.log(`⚠️ Aviso ao criar política: ${error.message}`);
      }
    }
    
    console.log('✅ Correção das políticas RLS concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error.message);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  fixRLSPolicies()
    .then(() => {
      console.log('🎉 Script executado com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { fixRLSPolicies };
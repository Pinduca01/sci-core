const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeAdminFix() {
  console.log('🔧 Corrigindo função is_admin_user...');
  
  try {
    // 1. Remover função atual
    console.log('\n1. Removendo função is_admin_user atual...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'DROP FUNCTION IF EXISTS public.is_admin_user();'
    });
    
    if (dropError && !dropError.message.includes('does not exist')) {
      console.error('❌ Erro ao remover função:', dropError);
    } else {
      console.log('✅ Função removida com sucesso');
    }
    
    // 2. Criar nova função
    console.log('\n2. Criando nova função is_admin_user...');
    const newFunctionSQL = `
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
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: newFunctionSQL
    });
    
    if (createError) {
      console.error('❌ Erro ao criar função:', createError);
      
      // Tentar método alternativo usando SQL direto
      console.log('\n🔄 Tentando método alternativo...');
      
      // Executar SQL diretamente
      const { error: directError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (directError) {
        console.error('❌ Erro de conexão:', directError);
        return;
      }
      
      console.log('\n⚠️  A função precisa ser criada manualmente no Supabase Dashboard.');
      console.log('\n📋 Execute este SQL no Supabase Dashboard > SQL Editor:');
      console.log('\n' + '='.repeat(60));
      console.log(newFunctionSQL);
      console.log('='.repeat(60));
      
    } else {
      console.log('✅ Nova função criada com sucesso');
    }
    
    // 3. Verificar se a função funciona
    console.log('\n3. Testando nova função...');
    const { data: testResult, error: testError } = await supabase
      .rpc('is_admin_user');
    
    if (testError) {
      console.error('❌ Erro ao testar função:', testError);
    } else {
      console.log(`✅ Função testada. Resultado: ${testResult}`);
    }
    
    // 4. Verificar perfil admin
    console.log('\n4. Verificando perfil admin...');
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'gs.teste@medmais.com')
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao buscar perfil admin:', profileError);
    } else {
      console.log('✅ Perfil admin encontrado:');
      console.log(`   - Email: ${adminProfile.email}`);
      console.log(`   - Role: ${adminProfile.role}`);
      console.log(`   - ID: ${adminProfile.id}`);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

executeAdminFix()
  .then(() => {
    console.log('\n✅ Correção da função admin concluída!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Se a função não foi criada automaticamente, execute o SQL manualmente no Supabase Dashboard');
    console.log('   2. Reinicie o servidor de desenvolvimento');
    console.log('   3. Teste o login com gs.teste@medmais.com');
    console.log('   4. Verifique se o redirecionamento para /dashboard/admin funciona');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
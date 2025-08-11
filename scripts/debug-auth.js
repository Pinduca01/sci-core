const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugAuth() {
  console.log('🔍 Verificando configuração de autenticação...');
  
  try {
    // Verificar usuários existentes
    console.log('\n📋 Verificando usuários cadastrados...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log('❌ Erro ao listar usuários:', usersError.message);
      
      // Tentar buscar perfis diretamente
      console.log('\n🔄 Tentando buscar perfis diretamente...');
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);
        
      if (profilesError) {
        console.log('❌ Erro ao buscar perfis:', profilesError.message);
      } else {
        console.log('✅ Perfis encontrados:', profiles?.length || 0);
        profiles?.forEach(profile => {
          console.log(`   - ${profile.email} (${profile.role})`);
        });
      }
    } else {
      console.log('✅ Usuários encontrados:', users?.users?.length || 0);
      users?.users?.forEach(user => {
        console.log(`   - ${user.email} (${user.id})`);
      });
    }
    
    // Verificar configurações do projeto
    console.log('\n⚙️ Configurações do ambiente:');
    console.log('   - SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurado' : '❌ Não configurado');
    console.log('   - SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Não configurado');
    
    // Testar conexão com o banco
    console.log('\n🔗 Testando conexão com o banco...');
    const { data: testData, error: testError } = await supabase
      .from('bombeiros')
      .select('count')
      .limit(1);
      
    if (testError) {
      console.log('❌ Erro na conexão:', testError.message);
    } else {
      console.log('✅ Conexão com banco funcionando');
    }
    
    console.log('\n🎯 Diagnóstico concluído!');
    console.log('\n💡 Dicas para resolver problemas:');
    console.log('   1. Limpe o cache do navegador (Ctrl+Shift+R)');
    console.log('   2. Verifique se está acessando http://localhost:3001');
    console.log('   3. Tente fazer logout e login novamente');
    console.log('   4. Verifique as credenciais no Supabase Dashboard');
    
  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error.message);
  }
}

debugAuth();
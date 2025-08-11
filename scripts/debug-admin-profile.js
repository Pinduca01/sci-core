const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugAdminProfile() {
  console.log('🔍 Verificando perfil do usuário admin...');
  
  try {
    // 1. Verificar usuários na tabela auth.users
    console.log('\n1. Verificando usuários registrados:');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
      return;
    }
    
    console.log(`📊 Total de usuários: ${users.users.length}`);
    users.users.forEach(user => {
      console.log(`   - ${user.email} (ID: ${user.id})`);
    });
    
    // 2. Verificar perfis na tabela profiles
    console.log('\n2. Verificando perfis na tabela profiles:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('❌ Erro ao buscar perfis:', profilesError);
    } else {
      console.log(`📊 Total de perfis: ${profiles.length}`);
      profiles.forEach(profile => {
        console.log(`   - ${profile.email} | Role: ${profile.role} | ID: ${profile.id}`);
      });
    }
    
    // 3. Verificar especificamente o usuário admin
    const adminEmails = ['admin@sci.com', 'gs.teste@medmais.com', 'admin@sci-core.com'];
    
    console.log('\n3. Verificando usuários admin específicos:');
    for (const email of adminEmails) {
      const user = users.users.find(u => u.email === email);
      if (user) {
        console.log(`\n👤 Usuário encontrado: ${email}`);
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Criado em: ${user.created_at}`);
        
        // Verificar perfil correspondente
        const profile = profiles?.find(p => p.id === user.id);
        if (profile) {
          console.log(`   ✅ Perfil encontrado:`);
          console.log(`      - Role: ${profile.role}`);
          console.log(`      - Nome: ${profile.nome_completo}`);
          console.log(`      - Email: ${profile.email}`);
        } else {
          console.log(`   ❌ Perfil NÃO encontrado na tabela profiles`);
        }
      } else {
        console.log(`❌ Usuário ${email} não encontrado`);
      }
    }
    
    // 4. Testar função is_admin_user
    console.log('\n4. Testando função is_admin_user:');
    const { data: isAdminResult, error: isAdminError } = await supabase
      .rpc('is_admin_user');
    
    if (isAdminError) {
      console.error('❌ Erro ao testar função is_admin_user:', isAdminError);
    } else {
      console.log(`✅ Função is_admin_user retornou: ${isAdminResult}`);
    }
    
    // 5. Verificar tabela bombeiros
    console.log('\n5. Verificando tabela bombeiros:');
    const { data: bombeiros, error: bombeirosError } = await supabase
      .from('bombeiros')
      .select('*')
      .limit(5);
    
    if (bombeirosError) {
      console.error('❌ Erro ao acessar tabela bombeiros:', bombeirosError);
    } else {
      console.log(`✅ Tabela bombeiros acessível. Total de registros: ${bombeiros.length}`);
      if (bombeiros.length > 0) {
        console.log('   Primeiros registros:');
        bombeiros.forEach(b => {
          console.log(`   - ${b.nome_completo} (${b.numero_bombeiro})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

debugAdminProfile()
  .then(() => {
    console.log('\n✅ Diagnóstico concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Usar service role para operações administrativas
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function resetAdminPassword() {
  console.log('🔧 Redefinindo senha do usuário admin...')
  console.log('📧 Email: gs.teste@medmais.com')
  console.log('🔑 Nova senha: 123456')
  console.log('')

  try {
    // Buscar o usuário admin
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError.message)
      return
    }

    const adminUser = users.users.find(u => u.email === 'gs.teste@medmais.com')
    
    if (!adminUser) {
      console.error('❌ Usuário admin não encontrado!')
      return
    }

    console.log('👤 Usuário encontrado:')
    console.log(`   ID: ${adminUser.id}`)
    console.log(`   Email: ${adminUser.email}`)
    console.log('')

    // Redefinir a senha
    const { data, error } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      {
        password: '123456'
      }
    )

    if (error) {
      console.error('❌ Erro ao redefinir senha:', error.message)
      return
    }

    console.log('✅ Senha redefinida com sucesso!')
    console.log('🔑 Nova senha: 123456')
    console.log('')

    // Testar o login com a nova senha
    console.log('🔍 Testando login com a nova senha...')
    
    // Criar cliente normal para teste de login
    const testClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const { data: authData, error: authError } = await testClient.auth.signInWithPassword({
      email: 'gs.teste@medmais.com',
      password: '123456'
    })

    if (authError) {
      console.error('❌ Erro no teste de login:', authError.message)
      return
    }

    console.log('✅ Teste de login realizado com sucesso!')
    console.log('👤 Usuário logado:', authData.user.email)
    
    // Fazer logout do teste
    await testClient.auth.signOut()
    console.log('🚪 Logout do teste realizado')
    console.log('')
    console.log('🎉 Agora você pode fazer login com:')
    console.log('📧 Email: gs.teste@medmais.com')
    console.log('🔑 Senha: 123456')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

resetAdminPassword()
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLogin() {
  console.log('🔍 Testando login do usuário admin...')
  console.log('📧 Email: gs.teste@medmais.com')
  console.log('🔑 Senha: 123456')
  console.log('')

  try {
    // Tentar fazer login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'gs.teste@medmais.com',
      password: '123456'
    })

    if (authError) {
      console.error('❌ Erro na autenticação:', authError.message)
      console.error('Código do erro:', authError.status)
      return
    }

    console.log('✅ Login realizado com sucesso!')
    console.log('👤 Usuário ID:', authData.user.id)
    console.log('📧 Email:', authData.user.email)
    console.log('')

    // Buscar perfil do usuário
    console.log('🔍 Buscando perfil do usuário...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError.message)
      return
    }

    console.log('✅ Perfil encontrado:')
    console.log('👤 ID:', profile.id)
    console.log('📧 Email:', profile.email)
    console.log('🎭 Role:', profile.role)
    console.log('')

    // Testar função is_admin_user
    console.log('🔍 Testando função is_admin_user...')
    const { data: isAdmin, error: adminError } = await supabase
      .rpc('is_admin_user')

    if (adminError) {
      console.error('❌ Erro ao testar função is_admin_user:', adminError.message)
    } else {
      console.log('🎭 is_admin_user retornou:', isAdmin)
    }

    // Fazer logout
    await supabase.auth.signOut()
    console.log('🚪 Logout realizado')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

testLogin()
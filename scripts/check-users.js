const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Usar service role para acessar dados administrativos
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUsers() {
  console.log('🔍 Verificando usuários no sistema...')
  console.log('')

  try {
    // Listar todos os usuários (usando service role)
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) {
      console.error('❌ Erro ao listar usuários:', usersError.message)
      return
    }

    console.log(`👥 Total de usuários encontrados: ${users.users.length}`)
    console.log('')

    users.users.forEach((user, index) => {
      console.log(`👤 Usuário ${index + 1}:`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Confirmado: ${user.email_confirmed_at ? 'Sim' : 'Não'}`)
      console.log(`   Criado em: ${new Date(user.created_at).toLocaleString('pt-BR')}`)
      console.log(`   Último login: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('pt-BR') : 'Nunca'}`)
      console.log('')
    })

    // Verificar perfis na tabela profiles
    console.log('🔍 Verificando perfis na tabela profiles...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')

    if (profilesError) {
      console.error('❌ Erro ao buscar perfis:', profilesError.message)
      return
    }

    console.log(`📋 Total de perfis encontrados: ${profiles.length}`)
    console.log('')

    profiles.forEach((profile, index) => {
      console.log(`📋 Perfil ${index + 1}:`)
      console.log(`   ID: ${profile.id}`)
      console.log(`   Email: ${profile.email}`)
      console.log(`   Role: ${profile.role}`)
      console.log(`   Criado em: ${new Date(profile.created_at).toLocaleString('pt-BR')}`)
      console.log('')
    })

    // Verificar especificamente o usuário admin
    const adminUser = users.users.find(u => u.email === 'gs.teste@medmais.com')
    if (adminUser) {
      console.log('🔍 Detalhes do usuário admin:')
      console.log(`   Email confirmado: ${adminUser.email_confirmed_at ? 'Sim' : 'Não'}`)
      console.log(`   Status: ${adminUser.banned_until ? 'Banido' : 'Ativo'}`)
      console.log(`   Metadata: ${JSON.stringify(adminUser.user_metadata, null, 2)}`)
    } else {
      console.log('❌ Usuário admin gs.teste@medmais.com não encontrado!')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

checkUsers()
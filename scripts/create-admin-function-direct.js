const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Usar service role para operações administrativas
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminFunction() {
  console.log('🔧 Criando função is_admin_user diretamente...')
  console.log('')

  try {
    // SQL para criar a função
    const createFunctionSQL = `
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
    `

    console.log('📝 Executando SQL:')
    console.log(createFunctionSQL)
    console.log('')

    // Tentar executar usando query direta
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (error) {
      console.log('⚠️  Não foi possível executar SQL automaticamente.')
      console.log('📋 Execute manualmente no Supabase Dashboard:')
      console.log('')
      console.log('============================================================')
      console.log(createFunctionSQL)
      console.log('============================================================')
      console.log('')
    }

    // Testar se a função já existe
    console.log('🔍 Testando função is_admin_user...')
    
    // Primeiro fazer login como admin
    const testClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const { data: authData, error: authError } = await testClient.auth.signInWithPassword({
      email: 'gs.teste@medmais.com',
      password: '123456'
    })

    if (authError) {
      console.error('❌ Erro no login de teste:', authError.message)
      return
    }

    console.log('✅ Login de teste realizado')

    // Testar a função
    const { data: isAdminResult, error: functionError } = await testClient
      .rpc('is_admin_user')

    if (functionError) {
      console.error('❌ Erro ao testar função:', functionError.message)
      console.log('')
      console.log('📋 A função precisa ser criada manualmente no Supabase Dashboard.')
      console.log('📝 Execute este SQL:')
      console.log('')
      console.log('============================================================')
      console.log(`DROP FUNCTION IF EXISTS public.is_admin_user();`)
      console.log('')
      console.log(`CREATE OR REPLACE FUNCTION public.is_admin_user()`)
      console.log(`RETURNS boolean`)
      console.log(`LANGUAGE sql`)
      console.log(`SECURITY DEFINER`)
      console.log(`AS $$`)
      console.log(`  SELECT EXISTS (`)
      console.log(`    SELECT 1 FROM public.profiles`)
      console.log(`    WHERE profiles.id = auth.uid()`)
      console.log(`    AND profiles.role = 'admin'`)
      console.log(`  );`)
      console.log(`$$;`)
      console.log('============================================================')
    } else {
      console.log('✅ Função is_admin_user funcionando!')
      console.log('🎭 Resultado:', isAdminResult)
    }

    // Logout do teste
    await testClient.auth.signOut()
    console.log('🚪 Logout do teste realizado')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

createAdminFunction()
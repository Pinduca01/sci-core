const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTables() {
  console.log('Verificando e criando tabelas no banco de dados...')
  
  try {
    // Verificar se a tabela bombeiros existe
    console.log('Verificando tabela bombeiros...')
    const { data: bombeirosCheck, error: bombeirosCheckError } = await supabase
      .from('bombeiros')
      .select('count', { count: 'exact', head: true })
    
    if (bombeirosCheckError) {
      console.log('❌ Tabela bombeiros não encontrada:', bombeirosCheckError.message)
      console.log('\n📋 INSTRUÇÕES PARA CRIAR AS TABELAS:')
      console.log('1. Acesse o Supabase Dashboard: https://supabase.com/dashboard')
      console.log('2. Vá para o seu projeto')
      console.log('3. Clique em "SQL Editor" no menu lateral')
      console.log('4. Cole o conteúdo do arquivo database/schema.sql')
      console.log('5. Execute o script clicando em "Run"')
      console.log('\nOu execute manualmente estas queries:')
      
      console.log('\n-- Criar tabela bombeiros:')
      console.log(`CREATE TABLE IF NOT EXISTS public.bombeiros (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  nome_completo TEXT NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  rg TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  telefone TEXT NOT NULL,
  endereco TEXT NOT NULL,
  cep TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  posto_graduacao TEXT NOT NULL,
  numero_bombeiro TEXT UNIQUE NOT NULL,
  unidade TEXT NOT NULL,
  data_admissao DATE NOT NULL,
  situacao TEXT NOT NULL DEFAULT 'ativo' CHECK (situacao IN ('ativo', 'inativo', 'licenca', 'aposentado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);`)
      
      console.log('\n-- Habilitar RLS:')
      console.log('ALTER TABLE public.bombeiros ENABLE ROW LEVEL SECURITY;')
      
      console.log('\n-- Criar políticas RLS:')
      console.log(`CREATE POLICY "Usuários podem ver seus próprios dados" ON public.bombeiros
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios dados" ON public.bombeiros
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios dados" ON public.bombeiros
  FOR UPDATE USING (auth.uid() = user_id);`)
      
    } else {
      console.log('✅ Tabela bombeiros encontrada')
      console.log(`   Registros: ${bombeirosCheck?.length || 0}`)
    }
    
    // Verificar tabela profiles
    console.log('\nVerificando tabela profiles...')
    const { data: profilesCheck, error: profilesCheckError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
    
    if (profilesCheckError) {
      console.log('❌ Tabela profiles não encontrada:', profilesCheckError.message)
    } else {
      console.log('✅ Tabela profiles encontrada')
    }
    
    // Verificar tabela documentos
    console.log('\nVerificando tabela documentos...')
    const { data: documentosCheck, error: documentosCheckError } = await supabase
      .from('documentos')
      .select('count', { count: 'exact', head: true })
    
    if (documentosCheckError) {
      console.log('❌ Tabela documentos não encontrada:', documentosCheckError.message)
    } else {
      console.log('✅ Tabela documentos encontrada')
    }
    
    // Verificar se há usuários
    console.log('\nVerificando usuários...')
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.log('❌ Erro ao verificar usuários:', usersError.message)
    } else {
      console.log(`✅ Usuários encontrados: ${users?.length || 0}`)
      if (users && users.length > 0) {
        users.forEach(user => {
          console.log(`   - ${user.email} (${user.id})`)
        })
      }
    }
    
  } catch (error) {
    console.error('Erro durante a verificação:', error)
  }
}

createTables()
  .then(() => {
    console.log('\nVerificação concluída')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Erro fatal:', error)
    process.exit(1)
  })
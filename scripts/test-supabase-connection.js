const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Definida' : 'Não definida');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('🔄 Testando conexão com o Supabase...');
    
    // Testar conexão listando tabelas existentes
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error);
      return false;
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    
    // Verificar se a tabela bombeiros já existe
    const { data: bombeiroData, error: bombeiroError } = await supabase
      .from('bombeiros')
      .select('*')
      .limit(1);
    
    if (bombeiroError) {
      if (bombeiroError.code === 'PGRST116') {
        console.log('⚠️ Tabela "bombeiros" não existe ainda');
        console.log('📝 Você precisa criar a tabela no Supabase Dashboard');
        console.log('🔗 Acesse: https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0] + '/editor');
        console.log('');
        console.log('📋 SQL para criar a tabela:');
        console.log(`
CREATE TABLE bombeiros (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  funcao VARCHAR(10) NOT NULL CHECK (funcao IN ('BA-GS', 'BA-CE', 'BA-LR', 'BA-MC', 'BA-2')),
  matricula VARCHAR(50) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Ativo', 'Férias', 'Afastado', 'Licença')),
  telefone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  endereco TEXT,
  data_admissao DATE,
  salario VARCHAR(20) DEFAULT 'R$ 0,00',
  documentos INTEGER DEFAULT 0,
  ferista BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_bombeiros_matricula ON bombeiros(matricula);
CREATE INDEX idx_bombeiros_email ON bombeiros(email);
CREATE INDEX idx_bombeiros_status ON bombeiros(status);
CREATE INDEX idx_bombeiros_funcao ON bombeiros(funcao);

-- Habilitar RLS
ALTER TABLE bombeiros ENABLE ROW LEVEL SECURITY;

-- Criar política
CREATE POLICY "Permitir acesso completo para usuários autenticados" ON bombeiros
  FOR ALL USING (auth.role() = 'authenticated');
        `);
        return false;
      } else {
        console.error('❌ Erro ao verificar tabela bombeiros:', bombeiroError);
        return false;
      }
    } else {
      console.log('✅ Tabela "bombeiros" já existe!');
      console.log('📊 Dados encontrados:', bombeiroData?.length || 0, 'registros');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return false;
  }
}

testConnection();
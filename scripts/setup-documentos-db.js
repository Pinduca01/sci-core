const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Definida' : 'Não definida');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDocumentosDB() {
  console.log('🚀 Configurando sistema de documentos...');

  try {
    // 1. Verificar se a tabela já existe
    console.log('🔍 Verificando estrutura existente...');
    const { data: existingTable } = await supabase
      .from('bombeiros_documentos')
      .select('id')
      .limit(1);

    if (existingTable !== null) {
      console.log('✅ Tabela bombeiros_documentos já existe!');
      return;
    }

    console.log('📋 Tabela não existe, vamos usar o SQL direto...');
    console.log('⚠️  Execute o seguinte SQL no painel do Supabase:');
    console.log('');
    console.log('-- 1. Criar tabela bombeiros_documentos');
    console.log(`CREATE TABLE IF NOT EXISTS bombeiros_documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bombeiro_id UUID NOT NULL REFERENCES bombeiros(id) ON DELETE CASCADE,
  nome_arquivo TEXT NOT NULL,
  nome_original TEXT NOT NULL,
  tipo_arquivo TEXT NOT NULL,
  tamanho BIGINT NOT NULL,
  caminho_storage TEXT NOT NULL UNIQUE,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);
    console.log('');
    console.log('-- 2. Criar índices');
    console.log(`CREATE INDEX IF NOT EXISTS idx_bombeiros_documentos_bombeiro_id ON bombeiros_documentos(bombeiro_id);
CREATE INDEX IF NOT EXISTS idx_bombeiros_documentos_created_at ON bombeiros_documentos(created_at);`);
    console.log('');
    console.log('-- 3. Habilitar RLS');
    console.log(`ALTER TABLE bombeiros_documentos ENABLE ROW LEVEL SECURITY;`);
    console.log('');
    console.log('-- 4. Criar políticas RLS');
    console.log(`CREATE POLICY "Usuários autenticados podem ler documentos" ON bombeiros_documentos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir documentos" ON bombeiros_documentos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar documentos" ON bombeiros_documentos
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem excluir documentos" ON bombeiros_documentos
  FOR DELETE USING (auth.role() = 'authenticated');`);
    console.log('');
    console.log('-- 5. Criar função e trigger');
    console.log(`CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bombeiros_documentos_updated_at
    BEFORE UPDATE ON bombeiros_documentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();`);
    console.log('');
    console.log('📝 Após executar o SQL acima:');
    console.log('   1. Criar bucket "bombeiros-documentos" no Supabase Storage');
    console.log('   2. Configurar políticas do bucket');
    console.log('   3. Testar upload de documentos');

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupDocumentosDB();
}

module.exports = { setupDocumentosDB };
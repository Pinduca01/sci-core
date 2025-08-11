const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function recreateTable() {
  try {
    console.log('🗑️ Removendo tabela bombeiros existente...');
    
    // Primeiro, vamos tentar remover a tabela existente
    const dropResult = await supabase.rpc('exec_sql', {
      sql: 'DROP TABLE IF EXISTS bombeiros CASCADE;'
    });

    if (dropResult.error) {
      console.log('⚠️ Aviso ao remover tabela:', dropResult.error.message);
    } else {
      console.log('✅ Tabela removida com sucesso!');
    }

    console.log('🔨 Criando nova tabela bombeiros...');
    
    // Criar a tabela com a estrutura correta
    const createTableSQL = `
      CREATE TABLE bombeiros (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        funcao VARCHAR(50) DEFAULT 'BA-GS',
        matricula VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'Ativo',
        telefone VARCHAR(20),
        email VARCHAR(255),
        endereco TEXT,
        data_admissao DATE DEFAULT CURRENT_DATE,
        salario VARCHAR(50) DEFAULT 'R$ 0,00',
        documentos INTEGER DEFAULT 0,
        ferista BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const createResult = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });

    if (createResult.error) {
      console.log('❌ Erro ao criar tabela:', createResult.error.message);
      
      // Se a função exec_sql não funcionar, vamos tentar uma abordagem diferente
      console.log('🔄 Tentando abordagem alternativa...');
      console.log('');
      console.log('📋 Execute este SQL no Supabase Dashboard:');
      console.log('🌐 Acesse: https://supabase.com/dashboard/project/iccsydwuqpyqdpnftitr/editor');
      console.log('');
      console.log('-- SQL para executar:');
      console.log('DROP TABLE IF EXISTS bombeiros CASCADE;');
      console.log('');
      console.log(createTableSQL);
      console.log('');
      console.log('-- Habilitar RLS:');
      console.log('ALTER TABLE bombeiros ENABLE ROW LEVEL SECURITY;');
      console.log('');
      console.log('-- Criar política:');
      console.log(`CREATE POLICY "Permitir acesso completo para usuários autenticados" ON bombeiros
        FOR ALL USING (auth.role() = 'authenticated');`);
      console.log('');
      console.log('-- Inserir dados de teste:');
      console.log(`INSERT INTO bombeiros (nome, funcao, matricula, status, telefone, email, endereco, salario) VALUES
        ('João Silva', 'BA-GS', 'BM001', 'Ativo', '(11) 99999-1111', 'joao@bombeiros.com', 'Rua A, 123', 'R$ 3.500,00'),
        ('Maria Santos', 'BA-CE', 'BM002', 'Ativo', '(11) 99999-2222', 'maria@bombeiros.com', 'Rua B, 456', 'R$ 4.200,00'),
        ('Pedro Costa', 'BA-LR', 'BM003', 'Férias', '(11) 99999-3333', 'pedro@bombeiros.com', 'Rua C, 789', 'R$ 3.800,00');`);
      
      return;
    }

    console.log('✅ Tabela criada com sucesso!');

    console.log('🔐 Habilitando RLS...');
    const rlsResult = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE bombeiros ENABLE ROW LEVEL SECURITY;'
    });

    if (rlsResult.error) {
      console.log('⚠️ Aviso ao habilitar RLS:', rlsResult.error.message);
    } else {
      console.log('✅ RLS habilitado!');
    }

    console.log('📋 Criando política de acesso...');
    const policyResult = await supabase.rpc('exec_sql', {
      sql: `CREATE POLICY "Permitir acesso completo para usuários autenticados" ON bombeiros
            FOR ALL USING (auth.role() = 'authenticated');`
    });

    if (policyResult.error) {
      console.log('⚠️ Aviso ao criar política:', policyResult.error.message);
    } else {
      console.log('✅ Política criada!');
    }

    console.log('📊 Inserindo dados de teste...');
    const insertResult = await supabase
      .from('bombeiros')
      .insert([
        {
          nome: 'João Silva',
          funcao: 'BA-GS',
          matricula: 'BM001',
          status: 'Ativo',
          telefone: '(11) 99999-1111',
          email: 'joao@bombeiros.com',
          endereco: 'Rua A, 123',
          salario: 'R$ 3.500,00'
        },
        {
          nome: 'Maria Santos',
          funcao: 'BA-CE',
          matricula: 'BM002',
          status: 'Ativo',
          telefone: '(11) 99999-2222',
          email: 'maria@bombeiros.com',
          endereco: 'Rua B, 456',
          salario: 'R$ 4.200,00'
        },
        {
          nome: 'Pedro Costa',
          funcao: 'BA-LR',
          matricula: 'BM003',
          status: 'Férias',
          telefone: '(11) 99999-3333',
          email: 'pedro@bombeiros.com',
          endereco: 'Rua C, 789',
          salario: 'R$ 3.800,00'
        }
      ]);

    if (insertResult.error) {
      console.log('⚠️ Aviso ao inserir dados:', insertResult.error.message);
    } else {
      console.log('✅ Dados de teste inseridos!');
    }

    console.log('🧪 Testando a nova estrutura...');
    const testResult = await supabase
      .from('bombeiros')
      .select('*')
      .limit(1);

    if (testResult.error) {
      console.log('❌ Erro ao testar:', testResult.error.message);
    } else {
      console.log('✅ Teste bem-sucedido!');
      if (testResult.data && testResult.data.length > 0) {
        console.log('📄 Estrutura da tabela:', Object.keys(testResult.data[0]));
      }
    }

    console.log('🎉 Tabela bombeiros recriada com sucesso!');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

recreateTable();
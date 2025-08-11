const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndFixTable() {
  try {
    console.log('🔍 Verificando estrutura da tabela bombeiros...');
    
    // Verificar se a tabela existe e suas colunas
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'bombeiros')
      .eq('table_schema', 'public');

    if (columnsError) {
      console.error('❌ Erro ao verificar colunas:', columnsError);
      return;
    }

    console.log('📋 Colunas encontradas:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    // Verificar se a coluna 'documentos' existe
    const documentosColumn = columns.find(col => col.column_name === 'documentos');
    
    if (!documentosColumn) {
      console.log('⚠️  Coluna "documentos" não encontrada. Adicionando...');
      
      // Adicionar a coluna documentos
      const { error: addColumnError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE bombeiros ADD COLUMN IF NOT EXISTS documentos INTEGER DEFAULT 0;'
      });

      if (addColumnError) {
        console.error('❌ Erro ao adicionar coluna documentos:', addColumnError);
        
        // Tentar método alternativo usando SQL direto
        console.log('🔄 Tentando método alternativo...');
        const { error: directError } = await supabase
          .from('bombeiros')
          .select('id')
          .limit(1);
          
        if (directError && directError.message.includes('documentos')) {
          console.log('✅ Confirmado: coluna documentos está faltando');
          console.log('📝 Execute manualmente no Supabase Dashboard:');
          console.log('   ALTER TABLE bombeiros ADD COLUMN documentos INTEGER DEFAULT 0;');
        }
      } else {
        console.log('✅ Coluna documentos adicionada com sucesso!');
      }
    } else {
      console.log('✅ Coluna documentos já existe');
    }

    // Testar inserção de dados
    console.log('🧪 Testando inserção de dados...');
    const testData = {
      nome: 'Teste Usuario',
      funcao: 'BA-GS',
      matricula: 'TEST001',
      status: 'Ativo',
      telefone: '(11) 99999-0000',
      email: 'teste@test.com',
      endereco: 'Endereço de teste',
      data_admissao: new Date().toISOString().split('T')[0],
      salario: 'R$ 0,00',
      documentos: 0,
      ferista: false
    };

    const { data: insertData, error: insertError } = await supabase
      .from('bombeiros')
      .insert([testData])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro no teste de inserção:', insertError);
    } else {
      console.log('✅ Teste de inserção bem-sucedido!');
      console.log('📄 Dados inseridos:', insertData);
      
      // Remover dados de teste
      await supabase
        .from('bombeiros')
        .delete()
        .eq('matricula', 'TEST001');
      console.log('🗑️  Dados de teste removidos');
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

checkAndFixTable();
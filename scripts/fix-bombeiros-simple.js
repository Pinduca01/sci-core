const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAndFix() {
  try {
    console.log('🧪 Testando inserção direta na tabela bombeiros...');
    
    // Testar inserção sem a coluna documentos primeiro
    const testDataWithoutDocs = {
      nome: 'Teste Usuario',
      funcao: 'BA-GS',
      matricula: 'TEST001',
      status: 'Ativo',
      telefone: '(11) 99999-0000',
      email: 'teste@test.com',
      endereco: 'Endereço de teste',
      data_admissao: new Date().toISOString().split('T')[0],
      salario: 'R$ 0,00',
      ferista: false
    };

    console.log('📝 Tentando inserir SEM a coluna documentos...');
    const { data: insertData1, error: insertError1 } = await supabase
      .from('bombeiros')
      .insert([testDataWithoutDocs])
      .select()
      .single();

    if (insertError1) {
      console.log('❌ Erro sem documentos:', insertError1.message);
    } else {
      console.log('✅ Inserção SEM documentos funcionou!');
      // Limpar teste
      await supabase.from('bombeiros').delete().eq('matricula', 'TEST001');
    }

    // Testar inserção COM a coluna documentos
    const testDataWithDocs = {
      ...testDataWithoutDocs,
      matricula: 'TEST002',
      documentos: 0
    };

    console.log('📝 Tentando inserir COM a coluna documentos...');
    const { data: insertData2, error: insertError2 } = await supabase
      .from('bombeiros')
      .insert([testDataWithDocs])
      .select()
      .single();

    if (insertError2) {
      console.log('❌ Erro com documentos:', insertError2.message);
      
      if (insertError2.message.includes('documentos')) {
        console.log('🔧 A coluna documentos não existe. Vamos tentar criar...');
        
        // Tentar criar a coluna usando uma função SQL personalizada
        console.log('📋 Execute este SQL no Supabase Dashboard:');
        console.log('   ALTER TABLE bombeiros ADD COLUMN IF NOT EXISTS documentos INTEGER DEFAULT 0;');
        console.log('');
        console.log('🌐 Acesse: https://supabase.com/dashboard/project/iccsydwuqpyqdpnftitr/editor');
        console.log('   1. Vá para SQL Editor');
        console.log('   2. Execute o comando acima');
        console.log('   3. Teste novamente');
      }
    } else {
      console.log('✅ Inserção COM documentos funcionou!');
      // Limpar teste
      await supabase.from('bombeiros').delete().eq('matricula', 'TEST002');
    }

    // Verificar dados existentes
    console.log('📊 Verificando dados existentes...');
    const { data: existingData, error: selectError } = await supabase
      .from('bombeiros')
      .select('*')
      .limit(3);

    if (selectError) {
      console.log('❌ Erro ao buscar dados:', selectError.message);
    } else {
      console.log(`✅ Encontrados ${existingData.length} registros existentes`);
      if (existingData.length > 0) {
        console.log('📄 Primeiro registro:', existingData[0]);
      }
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

testAndFix();
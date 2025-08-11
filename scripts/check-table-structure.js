const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela bombeiros...');
    
    // Tentar inserir apenas com campos básicos para descobrir quais existem
    const basicData = {
      nome: 'Teste Estrutura'
    };

    console.log('📝 Testando inserção com apenas nome...');
    const { data: test1, error: error1 } = await supabase
      .from('bombeiros')
      .insert([basicData])
      .select()
      .single();

    if (error1) {
      console.log('❌ Erro com nome:', error1.message);
    } else {
      console.log('✅ Nome funcionou!');
      console.log('📄 Estrutura retornada:', Object.keys(test1));
      
      // Limpar teste
      await supabase.from('bombeiros').delete().eq('nome', 'Teste Estrutura');
    }

    // Testar com mais campos
    const extendedData = {
      nome: 'Teste Estrutura 2',
      matricula: 'TEST001'
    };

    console.log('📝 Testando inserção com nome e matricula...');
    const { data: test2, error: error2 } = await supabase
      .from('bombeiros')
      .insert([extendedData])
      .select()
      .single();

    if (error2) {
      console.log('❌ Erro com matricula:', error2.message);
    } else {
      console.log('✅ Nome e matricula funcionaram!');
      console.log('📄 Estrutura retornada:', Object.keys(test2));
      
      // Limpar teste
      await supabase.from('bombeiros').delete().eq('matricula', 'TEST001');
    }

    // Verificar se a tabela tem algum registro para ver a estrutura
    console.log('📊 Verificando registros existentes...');
    const { data: existing, error: selectError } = await supabase
      .from('bombeiros')
      .select('*')
      .limit(1);

    if (selectError) {
      console.log('❌ Erro ao buscar registros:', selectError.message);
    } else {
      if (existing && existing.length > 0) {
        console.log('✅ Estrutura da tabela baseada em registro existente:');
        console.log('📄 Colunas:', Object.keys(existing[0]));
        console.log('📄 Primeiro registro:', existing[0]);
      } else {
        console.log('ℹ️ Tabela vazia, não é possível determinar estrutura completa');
      }
    }

    // Tentar descobrir quais campos são obrigatórios
    console.log('🧪 Testando campos individuais...');
    
    const fieldsToTest = [
      { funcao: 'BA-GS' },
      { status: 'Ativo' },
      { telefone: '(11) 99999-0000' },
      { email: 'teste@test.com' },
      { endereco: 'Teste' },
      { data_admissao: '2024-01-01' },
      { salario: 'R$ 0,00' }
    ];

    for (const field of fieldsToTest) {
      const fieldName = Object.keys(field)[0];
      const testData = {
        nome: `Teste ${fieldName}`,
        matricula: `TEST_${fieldName.toUpperCase()}`,
        ...field
      };

      const { data, error } = await supabase
        .from('bombeiros')
        .insert([testData])
        .select()
        .single();

      if (error) {
        console.log(`❌ Campo '${fieldName}' falhou:`, error.message);
      } else {
        console.log(`✅ Campo '${fieldName}' funcionou!`);
        // Limpar teste
        await supabase.from('bombeiros').delete().eq('matricula', testData.matricula);
      }
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

checkTableStructure();
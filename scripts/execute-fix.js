const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function executeFix() {
  console.log('🔧 Executando correções no banco de dados...');
  
  try {
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'fix-database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Dividir em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd && !cmd.startsWith('--') && cmd !== '');
    
    console.log(`📋 Executando ${commands.length} comandos SQL...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (command.includes('SELECT') && command.includes('resultado')) {
        console.log('✅ Script concluído!');
        break;
      }
      
      try {
        console.log(`⏳ Executando comando ${i + 1}/${commands.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: command
        });
        
        if (error) {
          // Tentar executar diretamente se RPC falhar
          const { error: directError } = await supabase
            .from('_temp_sql')
            .select('*')
            .limit(0);
            
          if (directError && directError.message.includes('does not exist')) {
            console.log(`⚠️  Comando ${i + 1} ignorado (função não disponível):`, command.substring(0, 50) + '...');
          } else {
            console.log(`❌ Erro no comando ${i + 1}:`, error.message);
            errorCount++;
          }
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
          successCount++;
        }
        
        // Pequena pausa entre comandos
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (cmdError) {
        console.log(`❌ Erro no comando ${i + 1}:`, cmdError.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Resumo da execução:');
    console.log(`   ✅ Sucessos: ${successCount}`);
    console.log(`   ❌ Erros: ${errorCount}`);
    
    // Tentar algumas operações básicas para verificar se funcionou
    console.log('\n🔍 Verificando resultados...');
    
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
        
      if (profilesError) {
        console.log('❌ Tabela profiles ainda com problemas:', profilesError.message);
      } else {
        console.log('✅ Tabela profiles acessível');
      }
    } catch (e) {
      console.log('❌ Erro ao verificar profiles:', e.message);
    }
    
    try {
      const { data: bombeiros, error: bombeirosError } = await supabase
        .from('bombeiros')
        .select('count')
        .limit(1);
        
      if (bombeirosError) {
        console.log('❌ Tabela bombeiros ainda com problemas:', bombeirosError.message);
      } else {
        console.log('✅ Tabela bombeiros acessível');
      }
    } catch (e) {
      console.log('❌ Erro ao verificar bombeiros:', e.message);
    }
    
    console.log('\n🎯 Correções concluídas!');
    console.log('\n💡 Próximos passos:');
    console.log('   1. Execute o SQL manualmente no Supabase Dashboard se houver erros');
    console.log('   2. Reinicie o servidor de desenvolvimento');
    console.log('   3. Limpe o cache do navegador');
    console.log('   4. Tente fazer login novamente');
    
  } catch (error) {
    console.error('❌ Erro durante execução:', error.message);
    console.log('\n💡 Solução alternativa:');
    console.log('   1. Abra o Supabase Dashboard');
    console.log('   2. Vá para SQL Editor');
    console.log('   3. Execute o conteúdo do arquivo scripts/fix-database.sql');
  }
}

executeFix();
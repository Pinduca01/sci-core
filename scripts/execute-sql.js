const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQLScript() {
  try {
    console.log('🔄 Executando script SQL para criar tabela bombeiros...');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'create-bombeiros-table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Dividir o SQL em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Executando ${commands.length} comandos SQL...`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        console.log(`⏳ Executando comando ${i + 1}/${commands.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: command
        });
        
        if (error) {
          console.error(`❌ Erro no comando ${i + 1}:`, error);
          // Continuar com os próximos comandos mesmo se houver erro
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
        }
      }
    }
    
    console.log('🎉 Script SQL executado com sucesso!');
    
    // Verificar se a tabela foi criada
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'bombeiros');
    
    if (tablesError) {
      console.error('❌ Erro ao verificar tabela:', tablesError);
    } else if (tables && tables.length > 0) {
      console.log('✅ Tabela "bombeiros" criada com sucesso!');
    } else {
      console.log('⚠️ Tabela "bombeiros" não encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

executeSQLScript();
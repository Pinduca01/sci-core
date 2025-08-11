const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iccsydwuqpyqdpnftitr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljaXN5ZHd1cXB5cWRwbmZ0aXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzU5MzEsImV4cCI6MjA1MDU1MTkzMX0.Ej9Ej4Ej4Ej4Ej4Ej4Ej4Ej4Ej4Ej4Ej4Ej4Ej4Ej4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function addEquipeColumn() {
  try {
    console.log('🔧 Adicionando coluna equipe...');
    
    // Primeiro, vamos tentar adicionar a coluna diretamente
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE public.bombeiros ADD COLUMN IF NOT EXISTS equipe TEXT NOT NULL DEFAULT 'Alfa' CHECK (equipe IN ('Alfa', 'Bravo', 'Charlie', 'Delta'));`
    });
    
    if (alterError) {
      console.log('⚠️ Erro ao adicionar coluna (pode já existir):', alterError.message);
      
      // Se falhar, vamos tentar uma abordagem mais simples
      console.log('🔄 Tentando abordagem alternativa...');
      const { error: simpleAlterError } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE public.bombeiros ADD COLUMN IF NOT EXISTS equipe TEXT DEFAULT 'Alfa';`
      });
      
      if (simpleAlterError) {
        console.log('❌ Erro na abordagem alternativa:', simpleAlterError.message);
        console.log('📋 Execute manualmente no Supabase Dashboard:');
        console.log('   ALTER TABLE public.bombeiros ADD COLUMN equipe TEXT DEFAULT \'Alfa\';');
        return;
      } else {
        console.log('✅ Coluna equipe adicionada (sem constraint)!');
      }
    } else {
      console.log('✅ Coluna equipe adicionada com sucesso!');
    }
    
    // Atualizar bombeiros existentes com equipes aleatórias
    console.log('🔄 Atualizando bombeiros existentes...');
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `UPDATE public.bombeiros SET equipe = CASE 
              WHEN id % 4 = 1 THEN 'Alfa'
              WHEN id % 4 = 2 THEN 'Bravo' 
              WHEN id % 4 = 3 THEN 'Charlie'
              ELSE 'Delta'
            END;`
    });
    
    if (updateError) {
      console.log('❌ Erro ao atualizar equipes:', updateError.message);
    } else {
      console.log('✅ Equipes atribuídas com sucesso!');
    }
    
    // Verificar resultado
    console.log('📊 Verificando resultado...');
    const { data, error } = await supabase
      .from('bombeiros')
      .select('id, nome, equipe')
      .order('equipe');
      
    if (error) {
      console.log('❌ Erro ao verificar:', error.message);
    } else {
      console.log('📊 Bombeiros por equipe:');
      const equipes = {};
      data.forEach(b => {
        if (!equipes[b.equipe]) equipes[b.equipe] = [];
        equipes[b.equipe].push(b.nome);
      });
      
      Object.keys(equipes).forEach(equipe => {
        console.log(`  ${equipe}: ${equipes[equipe].join(', ')}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

addEquipeColumn();
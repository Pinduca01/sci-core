-- Schema para o módulo de Ocorrências do SCI-Core
-- Execute este script no SQL Editor do Supabase

-- Tabela de ocorrências
CREATE TABLE IF NOT EXISTS public.ocorrencias (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Informações básicas
    titulo TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN (
        'Atendimento à Aeronave Presidencial',
        'Condições de Baixa Visibilidade',
        'Emergências Médicas em Geral',
        'Iluminação de Emergência em Pista de Pouso e Decolagem',
        'Incêndio em Instalações Aeroportuárias',
        'Incêndios Florestais ou em Áreas de Cobertura Vegetal Próximas ao Aeródromo',
        'Incêndios ou Vazamentos de Combustíveis no PAA',
        'Ocorrência aeronáutica',
        'Ocorrências com Artigos Perigosos',
        'Remoção de Animais e Dispersão de Avifauna'
    )),
    status TEXT NOT NULL DEFAULT 'Aberta' CHECK (status IN ('Aberta', 'Em Andamento', 'Resolvida', 'Cancelada')),
    prioridade TEXT NOT NULL DEFAULT 'Média' CHECK (prioridade IN ('Baixa', 'Média', 'Alta', 'Crítica')),
    
    -- Data e localização
    data_ocorrencia DATE NOT NULL,
    hora_ocorrencia TIME NOT NULL,
    endereco TEXT NOT NULL,
    area TEXT NOT NULL,
    
    -- Equipe e bombeiros
    equipe TEXT NOT NULL CHECK (equipe IN ('Equipe Alpha', 'Equipe Bravo', 'Equipe Charlie', 'Equipe Delta')),
    bombeiros_envolvidos TEXT[] NOT NULL DEFAULT '{}',
    
    -- Cronologia
    hora_acionamento TIME NOT NULL,
    hora_saida TIME NOT NULL,
    hora_chegada TIME NOT NULL,
    hora_termino TIME NOT NULL,
    hora_retorno TIME NOT NULL,
    tempo_total_minutos INTEGER GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (hora_retorno - hora_acionamento)) / 60
    ) STORED,
    
    -- Vítimas
    vitimas_fatais INTEGER NOT NULL DEFAULT 0,
    vitimas_feridas INTEGER NOT NULL DEFAULT 0,
    
    -- Recursos utilizados
    viaturas TEXT,
    equipamentos_utilizados TEXT[],
    
    -- Descrições
    descricao TEXT NOT NULL,
    descricao_detalhada TEXT,
    
    -- Responsável pelo registro
    responsavel_id UUID REFERENCES public.profiles(id) NOT NULL,
    responsavel_nome TEXT NOT NULL,
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_ocorrencias_data_ocorrencia ON public.ocorrencias(data_ocorrencia DESC);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_tipo ON public.ocorrencias(tipo);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_status ON public.ocorrencias(status);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_equipe ON public.ocorrencias(equipe);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_responsavel_id ON public.ocorrencias(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_created_at ON public.ocorrencias(created_at DESC);

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_ocorrencias_updated_at ON public.ocorrencias;
CREATE TRIGGER update_ocorrencias_updated_at
    BEFORE UPDATE ON public.ocorrencias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS na tabela
ALTER TABLE public.ocorrencias ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para ocorrências

-- Todos os usuários autenticados podem ver todas as ocorrências
DROP POLICY IF EXISTS "Usuários autenticados podem ver ocorrências" ON public.ocorrencias;
CREATE POLICY "Usuários autenticados podem ver ocorrências"
    ON public.ocorrencias FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Usuários autenticados podem inserir ocorrências
DROP POLICY IF EXISTS "Usuários autenticados podem inserir ocorrências" ON public.ocorrencias;
CREATE POLICY "Usuários autenticados podem inserir ocorrências"
    ON public.ocorrencias FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND responsavel_id = auth.uid());

-- Apenas o responsável pela ocorrência ou admins/managers podem atualizar
DROP POLICY IF EXISTS "Responsável ou admins podem atualizar ocorrências" ON public.ocorrencias;
CREATE POLICY "Responsável ou admins podem atualizar ocorrências"
    ON public.ocorrencias FOR UPDATE
    USING (
        responsavel_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Apenas admins podem deletar ocorrências
DROP POLICY IF EXISTS "Apenas admins podem deletar ocorrências" ON public.ocorrencias;
CREATE POLICY "Apenas admins podem deletar ocorrências"
    ON public.ocorrencias FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Função para validar horários da ocorrência
CREATE OR REPLACE FUNCTION validate_ocorrencia_horarios()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar que os horários estão em ordem lógica
    IF NEW.hora_acionamento > NEW.hora_saida THEN
        RAISE EXCEPTION 'Horário de saída deve ser posterior ao acionamento';
    END IF;
    
    IF NEW.hora_saida > NEW.hora_chegada THEN
        RAISE EXCEPTION 'Horário de chegada deve ser posterior à saída';
    END IF;
    
    IF NEW.hora_chegada > NEW.hora_termino THEN
        RAISE EXCEPTION 'Horário de término deve ser posterior à chegada';
    END IF;
    
    IF NEW.hora_termino > NEW.hora_retorno THEN
        RAISE EXCEPTION 'Horário de retorno deve ser posterior ao término';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para validar horários
DROP TRIGGER IF EXISTS validate_ocorrencia_horarios_trigger ON public.ocorrencias;
CREATE TRIGGER validate_ocorrencia_horarios_trigger
    BEFORE INSERT OR UPDATE ON public.ocorrencias
    FOR EACH ROW
    EXECUTE FUNCTION validate_ocorrencia_horarios();

-- Comentários
COMMENT ON TABLE public.ocorrencias IS 'Tabela para armazenar todas as ocorrências atendidas pela SCI';
COMMENT ON COLUMN public.ocorrencias.tempo_total_minutos IS 'Tempo total em minutos calculado automaticamente';
COMMENT ON COLUMN public.ocorrencias.bombeiros_envolvidos IS 'Array com nomes dos bombeiros envolvidos na ocorrência';
COMMENT ON COLUMN public.ocorrencias.equipamentos_utilizados IS 'Array com equipamentos utilizados na ocorrência';
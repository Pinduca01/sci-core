-- Script completo para recriar a tabela bombeiros no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Remover a tabela existente (se houver)
DROP TABLE IF EXISTS public.bombeiros CASCADE;

-- 2. Criar a tabela bombeiros com a estrutura correta
CREATE TABLE public.bombeiros (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    funcao TEXT NOT NULL DEFAULT 'BA-GS',
    matricula TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'Ativo',
    telefone TEXT NOT NULL,
    email TEXT NOT NULL,
    endereco TEXT DEFAULT '',
    data_admissao DATE NOT NULL DEFAULT CURRENT_DATE,
    documentos INTEGER DEFAULT 0,
    ferista BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Criar índices para melhor performance
CREATE INDEX idx_bombeiros_matricula ON public.bombeiros(matricula);
CREATE INDEX idx_bombeiros_nome ON public.bombeiros(nome);
CREATE INDEX idx_bombeiros_funcao ON public.bombeiros(funcao);
CREATE INDEX idx_bombeiros_status ON public.bombeiros(status);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE public.bombeiros ENABLE ROW LEVEL SECURITY;

-- 5. Criar política de acesso (permitir todas as operações para usuários autenticados)
CREATE POLICY "Enable all operations for authenticated users" ON public.bombeiros
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 6. Inserir dados de teste
INSERT INTO public.bombeiros (nome, funcao, matricula, status, telefone, email, endereco, data_admissao, documentos, ferista) VALUES
('João Silva Santos', 'BA-GS', '1234', 'Ativo', '(11) 99999-9999', 'joao.silva@bombeiros.gov.br', 'Rua das Flores, 123 - Centro', '2020-03-15', 12, false),
('Maria Oliveira Costa', 'BA-CE', '5678', 'Férias', '(11) 88888-8888', 'maria.oliveira@bombeiros.gov.br', 'Av. Principal, 456 - Jardim', '2019-08-22', 8, true),
('Carlos Roberto Lima', 'BA-LR', '9012', 'Ativo', '(11) 77777-7777', 'carlos.lima@bombeiros.gov.br', 'Rua da Paz, 789 - Vila Nova', '2021-01-10', 15, false),
('Ana Paula Ferreira', 'BA-MC', '3456', 'Afastado', '(11) 66666-6666', 'ana.ferreira@bombeiros.gov.br', 'Rua do Sol, 321 - Centro', '2018-11-05', 10, true),
('Pedro Henrique Souza', 'BA-2', '7890', 'Licença', '(11) 55555-5555', 'pedro.souza@bombeiros.gov.br', 'Av. das Nações, 654 - Bairro Alto', '2022-06-18', 6, false);

-- 7. Verificar se os dados foram inseridos corretamente
SELECT * FROM public.bombeiros ORDER BY id;
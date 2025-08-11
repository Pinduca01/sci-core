-- Criar tabela bombeiros no Supabase
CREATE TABLE IF NOT EXISTS bombeiros (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  funcao VARCHAR(10) NOT NULL CHECK (funcao IN ('BA-GS', 'BA-CE', 'BA-LR', 'BA-MC', 'BA-2')),
  matricula VARCHAR(50) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Ativo', 'Férias', 'Afastado', 'Licença')),
  telefone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  endereco TEXT,
  data_admissao DATE,
  salario VARCHAR(20) DEFAULT 'R$ 0,00',
  documentos INTEGER DEFAULT 0,
  ferista BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_bombeiros_matricula ON bombeiros(matricula);
CREATE INDEX IF NOT EXISTS idx_bombeiros_email ON bombeiros(email);
CREATE INDEX IF NOT EXISTS idx_bombeiros_status ON bombeiros(status);
CREATE INDEX IF NOT EXISTS idx_bombeiros_funcao ON bombeiros(funcao);

-- Habilitar RLS (Row Level Security)
ALTER TABLE bombeiros ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir acesso completo para usuários autenticados
CREATE POLICY "Permitir acesso completo para usuários autenticados" ON bombeiros
  FOR ALL USING (auth.role() = 'authenticated');

-- Inserir dados mockados na tabela
INSERT INTO bombeiros (nome, funcao, matricula, status, telefone, email, endereco, data_admissao, salario, documentos, ferista) VALUES
('João Silva Santos', 'BA-GS', '1234', 'Ativo', '(11) 99999-9999', 'joao.silva@bombeiros.gov.br', 'Rua das Flores, 123 - Centro', '2020-01-15', 'R$ 4.500,00', 8, false),
('Maria Oliveira Costa', 'BA-CE', '5678', 'Ativo', '(11) 88888-8888', 'maria.oliveira@bombeiros.gov.br', 'Av. Principal, 456 - Jardim', '2019-03-22', 'R$ 5.200,00', 12, true),
('Carlos Lima Pereira', 'BA-LR', '9012', 'Férias', '(11) 77777-7777', 'carlos.lima@bombeiros.gov.br', 'Rua da Paz, 789 - Vila Nova', '2021-07-10', 'R$ 4.800,00', 5, false),
('Ana Ferreira Souza', 'BA-MC', '3456', 'Ativo', '(11) 66666-6666', 'ana.ferreira@bombeiros.gov.br', 'Praça Central, 321 - Centro', '2018-11-05', 'R$ 5.500,00', 15, true),
('Pedro Henrique Souza', 'BA-2', '7890', 'Licença', '(11) 55555-5555', 'pedro.souza@bombeiros.gov.br', 'Av. das Nações, 654 - Bairro Alto', '2022-06-18', 'R$ 5.900,00', 6, false)
ON CONFLICT (matricula) DO NOTHING;
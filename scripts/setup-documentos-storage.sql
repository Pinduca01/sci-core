-- Script para configurar o sistema de documentos no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Criar tabela para metadados dos documentos
CREATE TABLE IF NOT EXISTS bombeiros_documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bombeiro_id INTEGER NOT NULL,
  nome_arquivo VARCHAR(255) NOT NULL,
  nome_original VARCHAR(255) NOT NULL,
  tipo_arquivo VARCHAR(100) NOT NULL,
  tamanho BIGINT NOT NULL,
  caminho_storage TEXT NOT NULL,
  data_upload TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_bombeiros_documentos_bombeiro_id ON bombeiros_documentos(bombeiro_id);
CREATE INDEX IF NOT EXISTS idx_bombeiros_documentos_data_upload ON bombeiros_documentos(data_upload DESC);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE bombeiros_documentos ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de segurança
-- Política para leitura: apenas usuários autenticados podem ver documentos
CREATE POLICY "Usuários autenticados podem ver documentos" ON bombeiros_documentos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para inserção: apenas usuários autenticados podem inserir documentos
CREATE POLICY "Usuários autenticados podem inserir documentos" ON bombeiros_documentos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para atualização: apenas usuários autenticados podem atualizar documentos
CREATE POLICY "Usuários autenticados podem atualizar documentos" ON bombeiros_documentos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para exclusão: apenas usuários autenticados podem excluir documentos
CREATE POLICY "Usuários autenticados podem excluir documentos" ON bombeiros_documentos
  FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Criar bucket de storage (execute no painel Storage do Supabase)
-- Vá para Storage > Create Bucket
-- Nome: bombeiros-documentos
-- Público: false (privado)

-- 6. Configurar políticas do bucket (execute após criar o bucket)
-- Política para upload
INSERT INTO storage.policies (name, bucket_id, definition, check_definition)
VALUES (
  'Usuários autenticados podem fazer upload',
  'bombeiros-documentos',
  '(auth.role() = ''authenticated'')',
  '(auth.role() = ''authenticated'')'
);

-- Política para download
INSERT INTO storage.policies (name, bucket_id, definition, check_definition)
VALUES (
  'Usuários autenticados podem fazer download',
  'bombeiros-documentos',
  '(auth.role() = ''authenticated'')',
  '(auth.role() = ''authenticated'')'
);

-- Política para exclusão
INSERT INTO storage.policies (name, bucket_id, definition, check_definition)
VALUES (
  'Usuários autenticados podem excluir',
  'bombeiros-documentos',
  '(auth.role() = ''authenticated'')',
  '(auth.role() = ''authenticated'')'
);

-- 7. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Trigger para atualizar updated_at
CREATE TRIGGER update_bombeiros_documentos_updated_at
    BEFORE UPDATE ON bombeiros_documentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Comentários para documentação
COMMENT ON TABLE bombeiros_documentos IS 'Tabela para armazenar metadados dos documentos dos bombeiros';
COMMENT ON COLUMN bombeiros_documentos.bombeiro_id IS 'ID do bombeiro (referência à tabela bombeiros)';
COMMENT ON COLUMN bombeiros_documentos.nome_arquivo IS 'Nome personalizado do arquivo';
COMMENT ON COLUMN bombeiros_documentos.nome_original IS 'Nome original do arquivo enviado';
COMMENT ON COLUMN bombeiros_documentos.tipo_arquivo IS 'MIME type do arquivo';
COMMENT ON COLUMN bombeiros_documentos.tamanho IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN bombeiros_documentos.caminho_storage IS 'Caminho do arquivo no storage do Supabase';
COMMENT ON COLUMN bombeiros_documentos.uploaded_by IS 'ID do usuário que fez o upload';
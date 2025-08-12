-- Migração para adicionar campos de mapa à tabela ocorrências
-- Execute este script no SQL Editor do Supabase

-- Adicionar colunas de localização e mapa
ALTER TABLE public.ocorrencias 
ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS zoom INTEGER DEFAULT 17,
ADD COLUMN IF NOT EXISTS bearing REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS pitch REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS map_provider TEXT DEFAULT 'maptiler',
ADD COLUMN IF NOT EXISTS snapshot_url TEXT;

-- Comentários para as novas colunas
COMMENT ON COLUMN public.ocorrencias.lat IS 'Latitude da localização da ocorrência';
COMMENT ON COLUMN public.ocorrencias.lng IS 'Longitude da localização da ocorrência';
COMMENT ON COLUMN public.ocorrencias.zoom IS 'Nível de zoom do mapa (padrão: 17)';
COMMENT ON COLUMN public.ocorrencias.bearing IS 'Rotação do mapa em graus (padrão: 0)';
COMMENT ON COLUMN public.ocorrencias.pitch IS 'Inclinação do mapa em graus (padrão: 0)';
COMMENT ON COLUMN public.ocorrencias.map_provider IS 'Provedor do mapa utilizado (padrão: maptiler)';
COMMENT ON COLUMN public.ocorrencias.snapshot_url IS 'URL do snapshot estático do mapa no Supabase Storage';

-- Índice para consultas por localização
CREATE INDEX IF NOT EXISTS idx_ocorrencias_location ON public.ocorrencias(lat, lng);
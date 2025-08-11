-- Script para adicionar coluna equipe na tabela bombeiros
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Adicionar coluna equipe
ALTER TABLE public.bombeiros 
ADD COLUMN IF NOT EXISTS equipe TEXT NOT NULL DEFAULT 'Alfa' 
CHECK (equipe IN ('Alfa', 'Bravo', 'Charlie', 'Delta'));

-- 2. Atualizar bombeiros existentes com equipes aleatórias
UPDATE public.bombeiros 
SET equipe = CASE 
    WHEN id % 4 = 1 THEN 'Alfa'
    WHEN id % 4 = 2 THEN 'Bravo'
    WHEN id % 4 = 3 THEN 'Charlie'
    ELSE 'Delta'
END
WHERE equipe IS NULL OR equipe = 'Alfa';

-- 3. Verificar resultado
SELECT id, nome, equipe FROM public.bombeiros ORDER BY equipe, nome;
-- ============================================================
-- Migração: Adicionar campos condicionais de hospedagem
-- Tabela: properties
-- Data: 2026-02-22
-- Contexto: Campos específicos para unidades alugáveis de hospedagem
--   (Quarto de Hotel, Quarto Privativo, Quarto Compartilhado, Cama em Albergue, etc.)
-- ============================================================

-- Banheiro privativo: relevante para quartos privativos e compartilhados
ALTER TABLE properties
    ADD COLUMN IF NOT EXISTS banheiro_privativo BOOLEAN DEFAULT NULL;

-- Tipo de cama: relevante para quartos privativos (king, queen, casal, solteiro, beliche)
ALTER TABLE properties
    ADD COLUMN IF NOT EXISTS tipo_cama TEXT DEFAULT NULL;

-- Total de camas no quarto: relevante para quartos compartilhados / cama em albergue
ALTER TABLE properties
    ADD COLUMN IF NOT EXISTS total_camas_quarto INTEGER DEFAULT NULL;

-- Locker/armário com cadeado: relevante para albergues
ALTER TABLE properties
    ADD COLUMN IF NOT EXISTS locker_disponivel BOOLEAN DEFAULT NULL;

-- Comentários descritivos para documentação
COMMENT ON COLUMN properties.banheiro_privativo IS 'Indica se o banheiro é privativo (TRUE) ou compartilhado (FALSE). Relevante para quartos privativos e compartilhados.';
COMMENT ON COLUMN properties.tipo_cama IS 'Tipo de cama principal: king, queen, casal, solteiro, beliche. Relevante para quartos privativos de hospedagem.';
COMMENT ON COLUMN properties.total_camas_quarto IS 'Número total de camas no quarto compartilhado ou dormitório de albergue.';
COMMENT ON COLUMN properties.locker_disponivel IS 'Indica se há locker/armário com cadeado disponível. Relevante para albergues.';

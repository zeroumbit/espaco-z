-- ============================================
-- CORREÇÃO: Adiciona colunas faltantes na tabela tenants
-- Executar no SQL Editor do Supabase
-- ============================================

-- Adiciona as colunas de dados da empresa que estão faltando
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS business_type TEXT CHECK (business_type IN ('PF', 'PJ'));

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS document TEXT;

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS main_module TEXT CHECK (main_module IN ('hospedagem', 'alugueis', 'vendas'));

-- Verifica se as colunas foram adicionadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tenants' 
AND column_name IN ('business_type', 'document', 'main_module')
ORDER BY column_name;

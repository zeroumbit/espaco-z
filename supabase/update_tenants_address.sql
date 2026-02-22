-- ============================================
-- ATUALIZAÇÃO: Adiciona colunas de endereço na tabela tenants
-- Executar no SQL Editor do Supabase
-- ============================================
-- Este script é IDEMPOTENTE - pode ser executado múltiplas vezes
-- ============================================

-- Adiciona as colunas de endereço detalhado
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS cep TEXT;

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS number TEXT;

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS neighborhood TEXT;

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS complement TEXT;

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS address_completed BOOLEAN DEFAULT FALSE;

-- Adiciona comentário nas colunas
COMMENT ON COLUMN tenants.cep IS 'CEP do endereço (apenas números)';
COMMENT ON COLUMN tenants.address IS 'Logradouro/Rua do endereço';
COMMENT ON COLUMN tenants.number IS 'Número do endereço';
COMMENT ON COLUMN tenants.neighborhood IS 'Bairro do endereço';
COMMENT ON COLUMN tenants.complement IS 'Complemento do endereço (opcional)';
COMMENT ON COLUMN tenants.latitude IS 'Latitude da localização';
COMMENT ON COLUMN tenants.longitude IS 'Longitude da localização';
COMMENT ON COLUMN tenants.address_completed IS 'Indica se o endereço detalhado foi completado';

-- Verifica se todas as colunas foram adicionadas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tenants'
AND column_name IN ('cep', 'address', 'number', 'neighborhood', 'complement', 'latitude', 'longitude', 'address_completed')
ORDER BY column_name;

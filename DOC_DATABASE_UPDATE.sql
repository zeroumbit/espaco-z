-- EXECUTAR NO SQL EDITOR DO SUPABASE PARA CORRIGIR O ERRO DE COLUNA INEXISTENTE

-- Adiciona a coluna de status de onboarding
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS address_completed BOOLEAN DEFAULT FALSE;

-- Adiciona os campos de endereço detalhados (caso ainda não existam)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS cep TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS number TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS neighborhood TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS complement TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS latitude DECIMAL;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS longitude DECIMAL;

-- Atualiza tenants existentes para false por padrão
UPDATE tenants SET address_completed = FALSE WHERE address_completed IS NULL;

-- Garante que as permissões de RLS permitam a leitura/escrita dessas colunas
-- (Normalmente não é necessário se o RLS for por tabela, mas bom verificar)

COMMENT ON COLUMN tenants.address_completed IS 'Indica se o anunciante completou o cadastro de endereço detalhado';

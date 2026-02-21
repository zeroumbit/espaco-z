-- ============================================
-- ESPAÇO Z - Schema V3 Migration
-- Normalização de Imóveis (Properties) e Anúncios (Listings)
-- ============================================

-- 1. PROPERTIES (O imóvel físico)
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo_imovel TEXT NOT NULL, -- apartamento, casa, terreno, etc.
  subtipo_imovel TEXT,
  
  -- Métricas
  area_total NUMERIC(12,2),
  area_privativa NUMERIC(12,2),
  area_terreno NUMERIC(12,2),
  
  -- Composição
  quartos INTEGER DEFAULT 0,
  suites INTEGER DEFAULT 0,
  banheiros_sociais INTEGER DEFAULT 0,
  salas INTEGER DEFAULT 0,
  vagas_garagem INTEGER DEFAULT 0,
  
  -- Conservação e Idade
  ano_construcao INTEGER,
  estado_conservacao TEXT, -- novo, excelente, bom, regular, reforma
  
  -- Localização
  cep TEXT,
  logradouro TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'CE',
  pais TEXT NOT NULL DEFAULT 'Brasil',
  zona TEXT, -- urbana, rural, litorânea
  
  -- Atributos Flexíveis (Comodidades, Proximidades)
  amenities JSONB DEFAULT '[]'::jsonb,
  proximidades JSONB DEFAULT '[]'::jsonb,
  caracteristicas_extras JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PROPERTY MEDIA (Galeria de Imagens/Vídeos)
CREATE TABLE IF NOT EXISTS property_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  url TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'foto', -- foto, video, tour_virtual
  alt_text TEXT,
  ordem INTEGER DEFAULT 0,
  is_main_thumbnail BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. LISTINGS (A oferta comercial)
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  modulo TEXT NOT NULL, -- hospedagem, aluguel, venda
  status TEXT NOT NULL DEFAULT 'rascunho', -- rascunho, ativo, pausado, expirado, vendido, alugado
  
  preco_base_centavos BIGINT NOT NULL DEFAULT 0,
  valor_m2_centavos BIGINT,
  
  slug TEXT UNIQUE,
  exclusividade BOOLEAN DEFAULT false,
  
  -- Destaques e Impulsionamento
  destaque BOOLEAN DEFAULT false,
  destaque_tipo TEXT, -- bronze, silver, gold
  destaque_inicio TIMESTAMPTZ,
  destaque_fim TIMESTAMPTZ,
  
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. LISTING HOSPEDAGEM (Detalhes específicos de aluguel por temporada)
CREATE TABLE IF NOT EXISTS listing_hospedagem (
  listing_id UUID PRIMARY KEY REFERENCES listings(id) ON DELETE CASCADE,
  
  tipo_anuncio TEXT, -- casa inteira, quarto privativo, etc.
  capacidade_maxima INTEGER DEFAULT 1,
  camas_casal INTEGER DEFAULT 0,
  camas_solteiro INTEGER DEFAULT 0,
  tipo_checkin TEXT,
  
  preco_fim_semana_centavos BIGINT,
  taxa_limpeza_centavos BIGINT,
  caucao_centavos BIGINT,
  desconto_semanal INTEGER, -- percentual
  desconto_mensal INTEGER, -- percentual
  
  minimo_noites INTEGER DEFAULT 1,
  maximo_noites INTEGER,
  
  regras_hospedagem JSONB DEFAULT '{}'::jsonb
);

-- 5. LISTING ALUGUEL (Detalhes específicos de aluguel anual/mensal)
CREATE TABLE IF NOT EXISTS listing_aluguel (
  listing_id UUID PRIMARY KEY REFERENCES listings(id) ON DELETE CASCADE,
  
  valor_condominio_centavos BIGINT,
  valor_iptu_centavos BIGINT,
  valor_seguro_incendio_centavos BIGINT,
  valor_caucao_centavos BIGINT,
  
  garantias_aceitas JSONB DEFAULT '[]'::jsonb, -- caucao, fiador, seguro_fianca
  indice_reajuste TEXT DEFAULT 'IGPM',
  periodo_reajuste TEXT DEFAULT 'anual',
  prazo_minimo_contrato INTEGER DEFAULT 12, -- meses
  
  mobilia JSONB DEFAULT '{}'::jsonb
);

-- 6. LISTING VENDA (Detalhes específicos de venda)
CREATE TABLE IF NOT EXISTS listing_venda (
  listing_id UUID PRIMARY KEY REFERENCES listings(id) ON DELETE CASCADE,
  
  matricula_imovel TEXT,
  cartorio_registro TEXT,
  escritura BOOLEAN DEFAULT false,
  aceita_financiamento BOOLEAN DEFAULT false,
  aceita_permuta BOOLEAN DEFAULT false,
  fgts BOOLEAN DEFAULT false,
  entrada_minima_percentual INTEGER,
  
  status_obra TEXT, -- pronto, em_construcao, lancamento
  previsao_entrega DATE,
  incorporadora TEXT,
  construtora TEXT
);

-- 7. LISTING STATS (Desempenho)
CREATE TABLE IF NOT EXISTS listing_stats (
  listing_id UUID PRIMARY KEY REFERENCES listings(id) ON DELETE CASCADE,
  views_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  leads_count INTEGER DEFAULT 0,
  last_view_at TIMESTAMPTZ
);

-- 8. INDEXES & RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_hospedagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_aluguel ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_stats ENABLE ROW LEVEL SECURITY;

-- DROP OLD POLICIES IF RE-RUNNING
DROP POLICY IF EXISTS "properties_tenant_access" ON properties;
DROP POLICY IF EXISTS "listings_public_select" ON listings;
DROP POLICY IF EXISTS "listings_tenant_all" ON listings;

-- POLICIES
CREATE POLICY "properties_tenant_access" ON properties
  FOR ALL USING (organization_id = get_auth_tenant());

CREATE POLICY "listings_public_select" ON listings
  FOR SELECT USING (status = 'ativo');

CREATE POLICY "listings_tenant_all" ON listings
  FOR ALL USING (organization_id = get_auth_tenant());

-- TRIGGERS PARA UPDATED_AT
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- FUNÇÃO PARA CRIAR STATS AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION create_listing_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO listing_stats (listing_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_listing_stats
  AFTER INSERT ON listings
  FOR EACH ROW EXECUTE FUNCTION create_listing_stats();

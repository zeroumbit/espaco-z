-- ============================================
-- ESPAÇO Z - Database Schema
-- PostgreSQL + Supabase with RLS
-- ============================================
-- Este script é IDEMPOTENTE - pode ser executado múltiplas vezes
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- 1. TENANTS (Anunciantes)
-- ============================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  description TEXT,
  city TEXT NOT NULL DEFAULT 'Fortaleza',
  state TEXT NOT NULL DEFAULT 'CE',
  phone TEXT,
  whatsapp TEXT,
  email TEXT NOT NULL,
  website TEXT,
  instagram TEXT,
  facebook TEXT,
  
  -- Dados da Empresa (cadastro inicial)
  business_type TEXT CHECK (business_type IN ('PF', 'PJ')),
  document TEXT,
  main_module TEXT CHECK (main_module IN ('hospedagem', 'alugueis', 'vendas')),
  atuacao_especifica TEXT[] DEFAULT '{}',

  -- Endereço Completo
  cep TEXT,
  address TEXT,
  number TEXT,
  neighborhood TEXT,
  complement TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address_completed BOOLEAN DEFAULT FALSE,

  subscription_plan TEXT NOT NULL DEFAULT 'trial',
  max_spaces INTEGER NOT NULL DEFAULT 1,
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 days'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. PROFILES (Perfis de Usuário)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'usuario' CHECK (role IN ('visitante', 'usuario', 'anunciante', 'admin')),
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SECURITY HELPER FUNCTIONS (dependem de profiles)
-- ============================================

-- Fast lookup for the current user's tenant_id
CREATE OR REPLACE FUNCTION public.get_auth_tenant()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Fast check if the current user is a Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================
-- 3. SPACES (Espaços/Anúncios)
-- ============================================
CREATE TABLE IF NOT EXISTS spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  module TEXT NOT NULL CHECK (module IN ('hospedagem', 'alugueis', 'vendas')),
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'ativo', 'pausado', 'inativo')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  property_type TEXT NOT NULL DEFAULT 'apartamento',

  -- Location
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'CE',
  neighborhood TEXT NOT NULL DEFAULT '',
  address TEXT,
  zip_code TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,

  -- Details
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  max_guests INTEGER DEFAULT 1,
  area_m2 NUMERIC(10,2),

  -- Pricing
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  price_period TEXT CHECK (price_period IN ('semanal', 'mensal', 'anual')),
  cleaning_fee NUMERIC(10,2),

  -- Hosting specific
  instant_booking BOOLEAN DEFAULT false,
  check_in_time TEXT DEFAULT '14:00',
  check_out_time TEXT DEFAULT '11:00',
  min_nights INTEGER DEFAULT 1,
  max_nights INTEGER DEFAULT 365,

  -- Sales specific
  sale_type TEXT CHECK (sale_type IN ('classificado', 'completo')),

  -- Media & extras (JSONB arrays)
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
  rules JSONB DEFAULT '[]'::jsonb,

  -- Badges & boost
  badges JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_boosted BOOLEAN NOT NULL DEFAULT false,
  boost_expires_at TIMESTAMPTZ,

  -- Stats
  views_count INTEGER NOT NULL DEFAULT 0,
  favorites_count INTEGER NOT NULL DEFAULT 0,
  rating_average NUMERIC(3,2),
  rating_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for common queries (use CONCURRENTLY IF NOT EXISTS pattern)
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_spaces_module ON spaces(module);
  CREATE INDEX IF NOT EXISTS idx_spaces_tenant ON spaces(tenant_id);
  CREATE INDEX IF NOT EXISTS idx_spaces_status ON spaces(status);
  CREATE INDEX IF NOT EXISTS idx_spaces_city ON spaces(city);
  CREATE INDEX IF NOT EXISTS idx_spaces_module_status ON spaces(module, status);
END $$;

-- ============================================
-- 4. BOOKINGS (Reservas - Hospedagem)
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  guest_user_id UUID NOT NULL REFERENCES auth.users(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmada', 'cancelada', 'concluida')),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INTEGER NOT NULL DEFAULT 1,
  total_price NUMERIC(12,2) NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_bookings_space ON bookings(space_id);
  CREATE INDEX IF NOT EXISTS idx_bookings_guest ON bookings(guest_user_id);
  CREATE INDEX IF NOT EXISTS idx_bookings_tenant ON bookings(tenant_id);
END $$;

-- ============================================
-- 5. CONVERSATIONS & MESSAGES (Chat)
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID REFERENCES spaces(id) ON DELETE SET NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  module TEXT NOT NULL CHECK (module IN ('hospedagem', 'alugueis', 'vendas')),
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
  CREATE INDEX IF NOT EXISTS idx_conversations_tenant ON conversations(tenant_id);
  CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
END $$;

-- ============================================
-- 6. REVIEWS (Avaliações - Hospedagem)
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  reviewed_id UUID NOT NULL REFERENCES auth.users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_reviews_space ON reviews(space_id);
END $$;

-- ============================================
-- 7. FAVORITES
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, space_id)
);

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
END $$;

-- ============================================
-- 8. CALENDAR BLOCKS (Hospedagem)
-- ============================================
CREATE TABLE IF NOT EXISTS calendar_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  price_override NUMERIC(10,2),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  UNIQUE(space_id, date)
);

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_calendar_space ON calendar_blocks(space_id);
END $$;

-- ============================================
-- 9. LOCAL ADVERTISERS (Perto de Você)
-- ============================================
CREATE TABLE IF NOT EXISTS local_advertisers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  phone TEXT,
  whatsapp TEXT,
  website TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'CE',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  radius_km NUMERIC(5,1) NOT NULL DEFAULT 5.0,
  plan TEXT NOT NULL DEFAULT 'basico' CHECK (plan IN ('basico', 'pro', 'prime')),
  show_in_hospedagem BOOLEAN NOT NULL DEFAULT true,
  show_in_alugueis BOOLEAN NOT NULL DEFAULT true,
  show_in_vendas BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 10. SUBSCRIPTIONS (Planos de Assinatura)
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  price_monthly NUMERIC(10,2) NOT NULL,
  price_yearly NUMERIC(10,2),
  is_yearly BOOLEAN NOT NULL DEFAULT false,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  mercadopago_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON subscriptions(tenant_id);
END $$;

-- ============================================
-- 11. COOKIE CONSENTS (LGPD)
-- ============================================
CREATE TABLE IF NOT EXISTS cookie_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  essential BOOLEAN NOT NULL DEFAULT true,
  analytics BOOLEAN NOT NULL DEFAULT false,
  marketing BOOLEAN NOT NULL DEFAULT false,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 12. SALE FUNNEL (Funil de Vendas)
-- ============================================
CREATE TABLE IF NOT EXISTS sale_funnel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  step TEXT NOT NULL DEFAULT 'interesse' CHECK (step IN ('interesse', 'visita', 'proposta', 'documentacao', 'fechamento')),
  notes TEXT,
  visit_date TIMESTAMPTZ,
  proposal_amount NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_sale_funnel_space ON sale_funnel(space_id);
  CREATE INDEX IF NOT EXISTS idx_sale_funnel_tenant ON sale_funnel(tenant_id);
END $$;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on all tables (safe to run multiple times)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookie_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_funnel ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating (to handle updates)
DROP POLICY IF EXISTS "spaces_select_policy" ON spaces;
DROP POLICY IF EXISTS "spaces_modify_policy" ON spaces;
DROP POLICY IF EXISTS "tenants_select_active" ON tenants;
DROP POLICY IF EXISTS "tenants_owner_update" ON tenants;
DROP POLICY IF EXISTS "profiles_view_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "bookings_access_policy" ON bookings;
DROP POLICY IF EXISTS "bookings_insert_policy" ON bookings;
DROP POLICY IF EXISTS "conversations_access_policy" ON conversations;
DROP POLICY IF EXISTS "messages_access_policy" ON messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
DROP POLICY IF EXISTS "reviews_select" ON reviews;
DROP POLICY IF EXISTS "favorites_own" ON favorites;
DROP POLICY IF EXISTS "calendar_select" ON calendar_blocks;
DROP POLICY IF EXISTS "calendar_tenant" ON calendar_blocks;
DROP POLICY IF EXISTS "local_advertisers_select" ON local_advertisers;
DROP POLICY IF EXISTS "subscriptions_tenant" ON subscriptions;
DROP POLICY IF EXISTS "tenants_insert_policy" ON tenants;


-- SPACES: Active spaces are public. Staff/Admin see everything for their tenant.
CREATE POLICY "spaces_select_policy" ON spaces
  FOR SELECT USING (
    status = 'ativo'
    OR is_super_admin()
    OR tenant_id = get_auth_tenant()
  );

-- SPACES: Only owners/admin can manage
CREATE POLICY "spaces_modify_policy" ON spaces
  FOR ALL USING (
    is_super_admin()
    OR tenant_id = get_auth_tenant()
  )
  WITH CHECK (
    is_super_admin()
    OR tenant_id = get_auth_tenant()
  );

-- TENANTS: Public can see active tenants
CREATE POLICY "tenants_select_active" ON tenants
  FOR SELECT USING (is_active = true OR is_super_admin());

-- TENANTS: Only owner can update profile (except plan/active status)
CREATE POLICY "tenants_owner_update" ON tenants
  FOR UPDATE USING (user_id = auth.uid() OR is_super_admin());

-- TENANTS: Allow authenticated users to create their own tenant
CREATE POLICY "tenants_insert_policy" ON tenants
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- PROFILES: Admin sees everyone. Users see themselves.
CREATE POLICY "profiles_view_policy" ON profiles
  FOR SELECT USING (true);

-- PROFILES: Allow insert for authenticated users (needed for trigger on signup)
CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT WITH CHECK (true);

-- PROFILES: Users can update their own profile
CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (user_id = auth.uid() OR is_super_admin());

-- BOOKINGS: Isolation by guest or tenant
CREATE POLICY "bookings_access_policy" ON bookings
  FOR SELECT USING (
    guest_user_id = auth.uid()
    OR tenant_id = get_auth_tenant()
    OR is_super_admin()
  );

CREATE POLICY "bookings_insert_policy" ON bookings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- CONVERSATIONS: Participants only
CREATE POLICY "conversations_access_policy" ON conversations
  FOR SELECT USING (
    user_id = auth.uid()
    OR tenant_id = get_auth_tenant()
    OR is_super_admin()
  );

-- MESSAGES: Only conversation participants
CREATE POLICY "messages_access_policy" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND (user_id = auth.uid() OR tenant_id = get_auth_tenant() OR is_super_admin())
    )
  );

CREATE POLICY "messages_insert_policy" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- MESSAGES: Authenticated users can insert
CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- REVIEWS: Public read
CREATE POLICY "reviews_select" ON reviews
  FOR SELECT USING (true);

-- FAVORITES: User manages own
CREATE POLICY "favorites_own" ON favorites
  FOR ALL USING (user_id = auth.uid());

-- CALENDAR: Public read for active spaces
CREATE POLICY "calendar_select" ON calendar_blocks
  FOR SELECT USING (
    space_id IN (SELECT id FROM spaces WHERE status = 'ativo')
  );

-- CALENDAR: Tenant manages
CREATE POLICY "calendar_tenant" ON calendar_blocks
  FOR ALL USING (
    space_id IN (
      SELECT s.id FROM spaces s
      JOIN tenants t ON s.tenant_id = t.id
      WHERE t.user_id = auth.uid()
    )
  );

-- LOCAL ADVERTISERS: Public read
CREATE POLICY "local_advertisers_select" ON local_advertisers
  FOR SELECT USING (is_active = true);

-- SUBSCRIPTIONS: Tenant can see their own
CREATE POLICY "subscriptions_tenant" ON subscriptions
  FOR SELECT USING (
    tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid())
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop triggers before recreating
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_spaces_updated_at ON spaces;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
DROP TRIGGER IF EXISTS update_sale_funnel_updated_at ON sale_funnel;

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_spaces_updated_at
  BEFORE UPDATE ON spaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sale_funnel_updated_at
  BEFORE UPDATE ON sale_funnel
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'usuario'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update space rating after review
DROP TRIGGER IF EXISTS after_review_insert ON reviews;
DROP FUNCTION IF EXISTS update_space_rating();

CREATE OR REPLACE FUNCTION update_space_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE spaces SET
    rating_average = (
      SELECT AVG(rating)::NUMERIC(3,2) FROM reviews WHERE space_id = NEW.space_id
    ),
    rating_count = (
      SELECT COUNT(*) FROM reviews WHERE space_id = NEW.space_id
    )
  WHERE id = NEW.space_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_space_rating();

-- Update favorites count
DROP TRIGGER IF EXISTS after_favorite_change ON favorites;
DROP FUNCTION IF EXISTS update_favorites_count();

CREATE OR REPLACE FUNCTION update_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE spaces SET favorites_count = favorites_count + 1 WHERE id = NEW.space_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE spaces SET favorites_count = favorites_count - 1 WHERE id = OLD.space_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_favorite_change
  AFTER INSERT OR DELETE ON favorites
  FOR EACH ROW EXECUTE FUNCTION update_favorites_count();

-- ============================================
-- 13. ANTI-PRIVILEGE ESCALATION
-- ============================================

-- Prevent users from changing their own role or tenant_id
DROP TRIGGER IF EXISTS trigger_protect_profile_fields ON profiles;
DROP FUNCTION IF EXISTS public.protect_profile_fields();

CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Se não for super admin
  IF NOT is_super_admin() THEN
    -- Impede que qualquer um se torne 'admin'
    IF NEW.role = 'admin' THEN
      NEW.role = OLD.role;
    END IF;

    -- Se o usuário já possui um tenant_id, impede a alteração do tenant_id ou do role
    -- (Isso evita que um anunciante mude de empresa ou volte a ser usuário comum)
    IF OLD.tenant_id IS NOT NULL THEN
      IF NEW.tenant_id <> OLD.tenant_id THEN
        NEW.tenant_id = OLD.tenant_id;
      END IF;
      IF NEW.role <> OLD.role THEN
        NEW.role = OLD.role;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE TRIGGER trigger_protect_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

-- ============================================
-- FIX: Rebuild handle_new_user trigger
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Adicionar coluna atuacao_especifica (se não existir)
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS atuacao_especifica TEXT[] DEFAULT '{}';

-- 2. Recriar o trigger handle_new_user com tratamento de erro
-- Isso garante que erros no INSERT do profile não impeçam a criação do user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'usuario'
  )
  ON CONFLICT (user_id) DO NOTHING;  -- Evita erro se o profile já existir
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não impede a criação do usuário
    RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

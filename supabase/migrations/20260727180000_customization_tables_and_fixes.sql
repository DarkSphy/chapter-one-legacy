-- ====================================================================
-- SCRIPT DE ATUALIZAÇÃO E CORREÇÃO DO BANCO DE DADOS (SUPABASE)
-- Execute este script no SQL Editor do seu painel Supabase
-- ====================================================================

-- 1. Garante que todas as colunas necessárias na tabela CHILDREN existam
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS mother_name TEXT;
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS last_period_date DATE;
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS birth_weight_grams INTEGER;
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS birth_height_cm NUMERIC(5,2);
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS eye_color TEXT;
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS hair_color TEXT;
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS gender TEXT;

-- 2. Garante que todas as colunas necessárias na tabela CHAPTERS existam
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0;

-- Remove restrições antigas conflitantes e recria a restrição única correta para (user_id, slug)
ALTER TABLE public.chapters DROP CONSTRAINT IF EXISTS chapters_slug_key;
ALTER TABLE public.chapters DROP CONSTRAINT IF EXISTS chapters_user_id_slug_key;
ALTER TABLE public.chapters ADD CONSTRAINT chapters_user_id_slug_key UNIQUE (user_id, slug);

-- 3. Cria a tabela de CATEGORIAS personalizadas
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own categories" ON public.categories;
CREATE POLICY "own categories" ON public.categories 
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- 4. Cria a tabela de SENTIMENTOS (Emoções) personalizados
CREATE TABLE IF NOT EXISTS public.feelings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  label TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '✨',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, label)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feelings TO authenticated;
GRANT ALL ON public.feelings TO service_role;
ALTER TABLE public.feelings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own feelings" ON public.feelings;
CREATE POLICY "own feelings" ON public.feelings 
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- 5. Confere e recria as políticas de segurança RLS para CHILDREN e CHAPTERS
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own children" ON public.children;
CREATE POLICY "own children" ON public.children 
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own chapters" ON public.chapters;
CREATE POLICY "own chapters" ON public.chapters 
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

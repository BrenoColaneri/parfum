-- ==============================================================================
-- PARFUM - SCHEMA OFICIAL DO BANCO DE DADOS (PostgreSQL / Supabase)
-- ==============================================================================

-- 1. Criação da tabela de Inventário (Biblioteria Olfativa)
CREATE TABLE IF NOT EXISTS public.inventory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  brand text,
  concentration text,
  type text NOT NULL,
  gender text DEFAULT 'Unissex',
  intensity text DEFAULT 'Moderada',
  icon text,
  notes text,
  price_paid numeric(10,2) DEFAULT 0,
  full_details jsonb,
  fill_level integer DEFAULT 100,
  user_rating integer DEFAULT 0,
  user_review text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Criação da tabela de Desejos (Wishlist)
CREATE TABLE IF NOT EXISTS public.wishlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  target_price numeric(10,2) NOT NULL,
  volume text,
  link text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Criação da tabela SOTD (Scent of the Day / Perfume do Dia)
CREATE TABLE IF NOT EXISTS public.sotd_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  perfume_id uuid REFERENCES public.inventory(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT sotd_user_perfume_date_unique UNIQUE (user_id, perfume_id, date)
);

-- 4. Índices para Otimização e Escalabilidade
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON public.inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_sotd_history_user_date ON public.sotd_history(user_id, date DESC);

-- 5. Habilitando a segurança de nível de linha (Row Level Security - RLS)
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sotd_history ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de Segurança (Isolamento Estrito por Usuário)

-- Políticas para Inventory
DROP POLICY IF EXISTS "Usuários podem ver seu próprio inventário" ON public.inventory;
CREATE POLICY "Usuários podem ver seu próprio inventário"
ON public.inventory FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own inventory" ON public.inventory;
CREATE POLICY "Users can insert their own inventory" 
ON public.inventory FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own inventory" ON public.inventory;
CREATE POLICY "Users can update their own inventory" 
ON public.inventory FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own inventory" ON public.inventory;
CREATE POLICY "Users can delete their own inventory" 
ON public.inventory FOR DELETE USING (auth.uid() = user_id);

-- Políticas para Wishlist
DROP POLICY IF EXISTS "Users can view their own wishlist" ON public.wishlist;
CREATE POLICY "Users can view their own wishlist" 
ON public.wishlist FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own wishlist" ON public.wishlist;
CREATE POLICY "Users can insert their own wishlist" 
ON public.wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own wishlist" ON public.wishlist;
CREATE POLICY "Users can update their own wishlist" 
ON public.wishlist FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem excluir seus próprios desejos" ON public.wishlist;
CREATE POLICY "Usuários podem excluir seus próprios desejos" 
ON public.wishlist FOR DELETE USING (auth.uid() = user_id);

-- Políticas para SOTD History
DROP POLICY IF EXISTS "Usuários podem ver seu próprio historico SOTD" ON public.sotd_history;
CREATE POLICY "Usuários podem ver seu próprio historico SOTD" 
ON public.sotd_history FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir seu próprio historico SOTD" ON public.sotd_history;
CREATE POLICY "Usuários podem inserir seu próprio historico SOTD" 
ON public.sotd_history FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem excluir seu próprio historico SOTD" ON public.sotd_history;
CREATE POLICY "Usuários podem excluir seu próprio historico SOTD" 
ON public.sotd_history FOR DELETE USING (auth.uid() = user_id);

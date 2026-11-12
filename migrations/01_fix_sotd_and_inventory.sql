-- ==============================================================================
-- PARFUM - Migração 01: Padronização de Tabelas, Campos Faltantes e Integridade
-- Executar no SQL Editor do Supabase Dashboard
-- ==============================================================================

-- 1. Garante que a coluna 'price_paid' existe na tabela inventory
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'inventory' 
        AND column_name = 'price_paid'
    ) THEN
        ALTER TABLE public.inventory ADD COLUMN price_paid numeric(10,2) DEFAULT 0;
    END IF;
END $$;

-- 2. Adiciona colunas auxiliares 'gender' e 'intensity' para suportar filtros avançados
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'inventory' 
        AND column_name = 'gender'
    ) THEN
        ALTER TABLE public.inventory ADD COLUMN gender text DEFAULT 'Unissex';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'inventory' 
        AND column_name = 'intensity'
    ) THEN
        ALTER TABLE public.inventory ADD COLUMN intensity text DEFAULT 'Moderada';
    END IF;
END $$;

-- 3. Padronização da tabela SOTD:
-- Caso exista uma tabela antiga com nome 'sotd', migra para 'sotd_history'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'sotd'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'sotd_history'
    ) THEN
        ALTER TABLE public.sotd RENAME TO sotd_history;
    END IF;
END $$;

-- Criação da tabela sotd_history caso ainda não exista
CREATE TABLE IF NOT EXISTS public.sotd_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    perfume_id uuid REFERENCES public.inventory(id) ON DELETE CASCADE NOT NULL,
    date date NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Chave estrangeira com ON DELETE CASCADE para evitar erros ao excluir perfume
DO $$
BEGIN
    -- Remove constraint antiga se não tiver cascade
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'sotd_history_perfume_id_fkey'
        AND table_name = 'sotd_history'
    ) THEN
        ALTER TABLE public.sotd_history DROP CONSTRAINT sotd_history_perfume_id_fkey;
        ALTER TABLE public.sotd_history 
            ADD CONSTRAINT sotd_history_perfume_id_fkey 
            FOREIGN KEY (perfume_id) REFERENCES public.inventory(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. Evitar registros duplicados para o mesmo perfume no mesmo dia pelo mesmo usuário
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'sotd_history_user_perfume_date_unique'
        AND table_name = 'sotd_history'
    ) THEN
        ALTER TABLE public.sotd_history
            ADD CONSTRAINT sotd_history_user_perfume_date_unique 
            UNIQUE (user_id, perfume_id, date);
    END IF;
END $$;

-- 6. Índices para ganho de performance e otimização de consultas
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON public.inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_sotd_history_user_date ON public.sotd_history(user_id, date DESC);

-- 7. Habilitação de RLS e Políticas de Segurança
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sotd_history ENABLE ROW LEVEL SECURITY;

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


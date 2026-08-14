-- 1. Criação da tabela de Inventário (Biblioteria)
create table public.inventory (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text not null,
  icon text,
  brand text,
  concentration text,
  notes text,
  full_details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Criação da tabela de Desejos (Wishlist)
create table public.wishlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  target_price numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Habilitando a segurança de nível de linha (RLS)
alter table public.inventory enable row level security;
alter table public.wishlist enable row level security;

-- 4. Políticas de segurança (usuários só acessam seus próprios dados)
create policy "Users can view their own inventory" on public.inventory for select using (auth.uid() = user_id);
create policy "Users can insert their own inventory" on public.inventory for insert with check (auth.uid() = user_id);
create policy "Users can delete their own inventory" on public.inventory for delete using (auth.uid() = user_id);
create policy "Users can update their own inventory" on public.inventory for update using (auth.uid() = user_id);

create policy "Users can view their own wishlist" on public.wishlist for select using (auth.uid() = user_id);
create policy "Users can insert their own wishlist" on public.wishlist for insert with check (auth.uid() = user_id);
create policy "Users can delete their own wishlist" on public.wishlist for delete using (auth.uid() = user_id);
create policy "Users can update their own wishlist" on public.wishlist for update using (auth.uid() = user_id);

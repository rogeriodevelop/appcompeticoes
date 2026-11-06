-- Arena Competições: esquema do banco (Supabase / PostgreSQL)
-- Como usar: Supabase > SQL Editor > New query > colar este arquivo > Run.
-- Pode ser executado mais de uma vez sem perder dados.

-- ---------- Tabelas ----------
create table if not exists public.competicoes (
  id        text primary key,
  owner     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nome      text not null,
  local     text,
  ordem     int  not null default 0,
  criado_em timestamptz not null default now()
);

create table if not exists public.esportes (
  id            text primary key,
  owner         uuid not null default auth.uid() references auth.users(id) on delete cascade,
  competicao_id text not null references public.competicoes(id) on delete cascade,
  modalidade    text not null,
  categoria     text,
  sexo          text not null default 'Misto' check (sexo in ('Masculino', 'Feminino', 'Misto')),
  formato       text not null default 'pontos' check (formato in ('pontos', 'mata', 'grupos')),
  turnos        int  not null default 1 check (turnos in (1, 2)),
  num_grupos    int  not null default 2 check (num_grupos between 2 and 8),
  classificados int  not null default 2 check (classificados between 1 and 8),
  gerado        boolean not null default false,
  mata_gerado   boolean not null default false,
  ordem         int  not null default 0
);

create table if not exists public.grupos (
  id         text primary key,
  owner      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  esporte_id text not null references public.esportes(id) on delete cascade,
  nome       text not null,
  ordem      int  not null default 0
);

create table if not exists public.equipes (
  id         text primary key,
  owner      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  esporte_id text not null references public.esportes(id) on delete cascade,
  grupo_id   text references public.grupos(id) on delete set null,
  nome       text not null,
  sigla      text,
  tecnico    text,
  ordem      int  not null default 0
);

create table if not exists public.atletas (
  id         text primary key,
  owner      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  esporte_id text not null references public.esportes(id) on delete cascade,
  equipe_id  text not null references public.equipes(id) on delete cascade,
  nome       text not null,
  numero     int,
  posicao    text,
  ordem      int  not null default 0
);

create table if not exists public.jogos (
  id         text primary key,
  owner      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  esporte_id text not null references public.esportes(id) on delete cascade,
  fase       text not null,
  rodada     int  not null default 1,
  idx        int,
  ko         boolean not null default false,
  bye        boolean not null default false,
  casa_id    text references public.equipes(id) on delete set null,
  fora_id    text references public.equipes(id) on delete set null,
  gc         int,
  gf         int,
  pc         int,
  pf         int,
  data       text,
  local      text,
  status     text not null default 'ag' check (status in ('ag', 'fin')),
  ordem      int  not null default 0
);

create table if not exists public.eventos (
  id         text primary key,
  owner      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  jogo_id    text not null references public.jogos(id) on delete cascade,
  tipo       text not null check (tipo in ('gol', 'contra', 'amarelo', 'vermelho')),
  equipe_id  text references public.equipes(id) on delete set null,
  atleta_id  text references public.atletas(id) on delete set null,
  minuto     int,
  ordem      int  not null default 0
);

-- Regulamento da competição (texto livre do organizador). Seguro rodar de novo.
alter table public.competicoes add column if not exists regulamento text check (regulamento is null or char_length(regulamento) <= 20000);

-- Colunas do chaveamento personalizado (fase preliminar, rótulos, 3º lugar). Seguro rodar de novo.
alter table public.jogos add column if not exists nome     text;
alter table public.jogos add column if not exists rot_casa text;
alter table public.jogos add column if not exists rot_fora text;
alter table public.jogos add column if not exists dv_jogo  text;
alter table public.jogos add column if not exists dv_lado  text check (dv_lado in ('casa', 'fora'));
alter table public.jogos add column if not exists dp_jogo  text;
alter table public.jogos add column if not exists dp_lado  text check (dp_lado in ('casa', 'fora'));
-- Parciais dos sets (vôlei, tênis etc.), em JSON: [[25,20],[21,25]]
alter table public.jogos add column if not exists sets     text;

-- ---------- Índices das chaves estrangeiras ----------
create index if not exists esportes_competicao_idx on public.esportes (competicao_id);
create index if not exists grupos_esporte_idx      on public.grupos   (esporte_id);
create index if not exists equipes_esporte_idx     on public.equipes  (esporte_id);
create index if not exists equipes_grupo_idx       on public.equipes  (grupo_id);
create index if not exists atletas_esporte_idx     on public.atletas  (esporte_id);
create index if not exists atletas_equipe_idx      on public.atletas  (equipe_id);
create index if not exists jogos_esporte_idx       on public.jogos    (esporte_id);
create index if not exists jogos_casa_idx          on public.jogos    (casa_id);
create index if not exists jogos_fora_idx          on public.jogos    (fora_id);
create index if not exists eventos_jogo_idx        on public.eventos  (jogo_id);
create index if not exists eventos_atleta_idx      on public.eventos  (atleta_id);
create index if not exists eventos_equipe_idx      on public.eventos  (equipe_id);
create index if not exists competicoes_owner_idx   on public.competicoes (owner);

-- ---------- Segurança (RLS) ----------
-- Qualquer pessoa lê (área pública). Só quem está logado grava, e apenas nas linhas que criou.
do $$
declare t text;
begin
  foreach t in array array['competicoes','esportes','grupos','equipes','atletas','jogos','eventos'] loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "leitura publica" on public.%I', t);
    execute format('create policy "leitura publica" on public.%I for select to anon, authenticated using (true)', t);

    execute format('drop policy if exists "dono grava" on public.%I', t);
    execute format('create policy "dono grava" on public.%I for all to authenticated using (owner = (select auth.uid())) with check (owner = (select auth.uid()))', t);

    execute format('grant select on public.%I to anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

-- ---------- Contatos do site (formulário "Falar com a equipe") ----------
-- Qualquer visitante pode ENVIAR; só o administrador (e-mail abaixo) consegue LER.
create table if not exists public.contatos (
  id          uuid primary key default gen_random_uuid(),
  criado_em   timestamptz not null default now(),
  nome        text not null check (char_length(nome) between 1 and 120),
  email       text not null check (char_length(email) between 3 and 160),
  whatsapp    text not null check (char_length(whatsapp) between 1 and 30),
  tipo        text not null check (tipo in ('Particular', 'Público')),
  cidade      text not null check (char_length(cidade) between 1 and 80),
  uf          text not null check (char_length(uf) = 2),
  modalidades text not null check (char_length(modalidades) between 1 and 160),
  periodo     text not null check (char_length(periodo) between 1 and 80),
  mensagem    text not null check (char_length(mensagem) between 1 and 1000)
);

alter table public.contatos enable row level security;

drop policy if exists "visitante envia" on public.contatos;
create policy "visitante envia" on public.contatos for insert to anon, authenticated with check (true);

drop policy if exists "admin le" on public.contatos;
create policy "admin le" on public.contatos for select to authenticated
  using (lower((select auth.jwt() ->> 'email')) = 'rogeriosblack@gmail.com');

grant insert on public.contatos to anon, authenticated;
grant select on public.contatos to authenticated;

-- Arena Competições: gestores convidados por competição (OPCIONAL)
-- Quem é convidado (pelo e-mail) lança resultados e edita a competição, mas não a exclui
-- nem convida outras pessoas. Só o dono convida. Rode DEPOIS do schema.sql.
-- Como usar: Supabase > SQL Editor > New query > colar > Run. Pode rodar de novo.

create table if not exists public.gestores (
  competicao_id text not null references public.competicoes(id) on delete cascade,
  email         text not null check (char_length(email) between 3 and 160 and email = lower(email)),
  criado_em     timestamptz not null default now(),
  primary key (competicao_id, email)
);

-- ---------- Funções de apoio (security definer: leem a tabela sem esbarrar nas regras dela) ----------
create or replace function public.email_atual() returns text
  language sql stable as $$ select lower(coalesce(auth.jwt() ->> 'email', '')) $$;

create or replace function public.gestor_de_comp(cid text) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.gestores g where g.competicao_id = cid and g.email = public.email_atual())
$$;

create or replace function public.gestor_de_esporte(eid text) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.esportes e join public.gestores g on g.competicao_id = e.competicao_id
                 where e.id = eid and g.email = public.email_atual())
$$;

create or replace function public.gestor_de_jogo(jid text) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.jogos j join public.esportes e on e.id = j.esporte_id
                 join public.gestores g on g.competicao_id = e.competicao_id
                 where j.id = jid and g.email = public.email_atual())
$$;

-- ---------- Regras da tabela gestores ----------
alter table public.gestores enable row level security;
grant select, insert, delete on public.gestores to authenticated;

drop policy if exists "ve gestores" on public.gestores;
create policy "ve gestores" on public.gestores for select to authenticated
  using (email = public.email_atual()
         or exists (select 1 from public.competicoes c where c.id = competicao_id and c.owner = (select auth.uid())));

drop policy if exists "dono convida" on public.gestores;
create policy "dono convida" on public.gestores for insert to authenticated
  with check (exists (select 1 from public.competicoes c where c.id = competicao_id and c.owner = (select auth.uid())));

drop policy if exists "dono remove" on public.gestores;
create policy "dono remove" on public.gestores for delete to authenticated
  using (exists (select 1 from public.competicoes c where c.id = competicao_id and c.owner = (select auth.uid())));

-- ---------- O que o gestor convidado pode gravar ----------
-- Competição: só alterar (nome, local, regulamento). Nunca excluir.
drop policy if exists "gestor edita" on public.competicoes;
create policy "gestor edita" on public.competicoes for update to authenticated
  using (public.gestor_de_comp(id)) with check (public.gestor_de_comp(id));

drop policy if exists "gestor grava" on public.esportes;
create policy "gestor grava" on public.esportes for all to authenticated
  using (public.gestor_de_comp(competicao_id)) with check (public.gestor_de_comp(competicao_id));

do $$
declare t text;
begin
  foreach t in array array['grupos','equipes','atletas','jogos'] loop
    execute format('drop policy if exists "gestor grava" on public.%I', t);
    execute format('create policy "gestor grava" on public.%I for all to authenticated using (public.gestor_de_esporte(esporte_id)) with check (public.gestor_de_esporte(esporte_id))', t);
  end loop;
end $$;

drop policy if exists "gestor grava" on public.eventos;
create policy "gestor grava" on public.eventos for all to authenticated
  using (public.gestor_de_jogo(jogo_id)) with check (public.gestor_de_jogo(jogo_id));

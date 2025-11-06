-- =====================================================================
--  PostgreSQL version using MAX(pk)+1 for primary key generation
--  Schema: api
-- =====================================================================

drop schema if exists api cascade;
create schema api;
set search_path = api;

-- =====================================================================
--  Table and Constraints
-- =====================================================================

create table api.test_table (
   pk          integer primary key,
   descript    varchar(100) not null,
   salary      numeric not null check (salary >= 0),
   sts         integer default 0 not null check (sts in (0,1)),
   email       varchar(300) unique,
   position_pk integer not null,
   created_at  timestamp with time zone default now() not null,
   updated_at  timestamp with time zone default now() not null
);

-- Foreign key (requires api.positions to exist)
-- create table api.positions (pk integer primary key, name text); -- Uncomment if needed
alter table api.test_table
   add constraint test_table_position_fk foreign key (position_pk)
      references api.positions (pk);

create index test_table_salary_idx on api.test_table (salary);

-- =====================================================================
--  Triggers
-- =====================================================================

-- 1️⃣ Trigger to generate PK as MAX(pk)+1
create or replace function api.trg_test_table_pk_fn()
returns trigger language plpgsql as $$
begin
   if new.pk is null then
      select coalesce(max(pk), 0) + 1 into new.pk from api.test_table;
   end if;
   return new;
end;
$$;

create trigger trg_test_table_pk
   before insert on api.test_table
   for each row
   execute procedure api.trg_test_table_pk_fn();

-- 2️⃣ Trigger to update "updated_at" automatically
create or replace function api.trg_test_table_updated_at_fn()
returns trigger language plpgsql as $$
begin
   new.updated_at := now();
   return new;
end;
$$;

create trigger trg_test_table_updated_at
   before update on api.test_table
   for each row
   execute procedure api.trg_test_table_updated_at_fn();

-- =====================================================================
--  Utility functions
-- =====================================================================

create or replace function api.build_response(
   p_status text,
   p_message text,
   p_data jsonb,
   p_http_status integer default 200
) returns jsonb language sql as $$
  select jsonb_build_object(
    'status', p_status,
    'message', p_message,
    'data', coalesce(p_data, 'null'::jsonb),
    'http_status', p_http_status
  );
$$;

create or replace function api.validate_sort_params(
   p_sort_by text,
   p_sort_order text,
   OUT o_sort_by text,
   OUT o_sort_order text
) returns record language plpgsql as $$
declare
   v_allowed text[] := array['pk','descript','salary','sts','email','position_pk','created_at','updated_at'];
   v_sb text := lower(coalesce(p_sort_by,'pk'));
   v_so text := upper(coalesce(p_sort_order,'ASC'));
begin
   if not v_sb = any(v_allowed) then
      o_sort_by := 'pk';
   else
      o_sort_by := v_sb;
   end if;

   if v_so not in ('ASC','DESC') then
      o_sort_order := 'ASC';
   else
      o_sort_order := v_so;
   end if;
end;
$$;

create or replace function api.build_where_clause(
   p_query text,
   p_search_type text,
   p_search_fields text
) returns record language plpgsql as $$
declare
   v_where text := '1=1';
   v_field text;
   v_clauses text := '';
begin
   if p_query is null or trim(p_query) = '' then
      return (v_where, null);
   end if;

   foreach v_field in array[string_to_array(p_search_fields,',')] loop
      v_field := trim(v_field);
      if p_search_type = 'exact' then
         v_clauses := v_clauses || format('%I = %L OR ', v_field, p_query);
      else
         v_clauses := v_clauses || format('%I ILIKE %L OR ', v_field, '%' || p_query || '%');
      end if;
   end loop;

   if v_clauses <> '' then
      v_clauses := left(v_clauses, -4);
      v_where := '(' || v_clauses || ')';
   end if;

   return (v_where, null);
end;
$$;

-- =====================================================================
--  CRUD functions
-- =====================================================================

create or replace function api.get_record_object(p_pk integer) returns jsonb language plpgsql as $$
declare
   r record;
begin
   select * into r from api.test_table where pk = p_pk;
   if not found then
      raise exception 'Record not found' using ERRCODE='P0001';
   end if;

   return jsonb_build_object(
      'pk', r.pk,
      'descript', r.descript,
      'salary', r.salary,
      'sts', r.sts,
      'email', r.email,
      'position_pk', r.position_pk,
      'created_at', to_char(r.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
      'updated_at', to_char(r.updated_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
   );
end;
$$;

create or replace function api.create_record(
   p_descript text,
   p_salary numeric,
   p_sts integer,
   p_email text,
   p_position_pk integer
) returns jsonb language plpgsql as $$
declare
   l_pk integer;
   l_data jsonb;
begin
   if p_descript is null then
      return api.build_response('error', 'descript is required', null, 400);
   end if;
   if p_salary is null or p_salary < 0 then
      return api.build_response('error', 'salary must be >= 0', null, 400);
   end if;
   if p_sts not in (0,1) then
      return api.build_response('error', 'sts must be 0 or 1', null, 400);
   end if;

   if exists(select 1 from api.test_table where email = p_email) then
      return api.build_response('error', 'Duplicate email', null, 409);
   end if;

   insert into api.test_table(descript, salary, sts, email, position_pk)
   values (p_descript, p_salary, p_sts, p_email, p_position_pk)
   returning pk into l_pk;

   l_data := api.get_record_object(l_pk);
   return api.build_response('success', 'Record created successfully', l_data, 201);

exception
   when foreign_key_violation then
      return api.build_response('error', 'Referenced record not found', null, 404);
   when unique_violation then
      return api.build_response('error', 'Unique constraint violated', null, 409);
   when others then
      return api.build_response('error', sqlstate || ': ' || sqlerrm, null, 500);
end;
$$;

create or replace function api.update_record(
   p_pk integer,
   p_descript text,
   p_salary numeric,
   p_sts integer,
   p_email text,
   p_position_pk integer
) returns jsonb language plpgsql as $$
declare
   l_data jsonb;
begin
   if not exists(select 1 from api.test_table where pk = p_pk) then
      return api.build_response('error', 'Record not found', null, 404);
   end if;

   update api.test_table set
       descript = p_descript,
       salary = p_salary,
       sts = p_sts,
       email = p_email,
       position_pk = p_position_pk,
       updated_at = now()
    where pk = p_pk;

   l_data := api.get_record_object(p_pk);
   return api.build_response('success', 'Record updated successfully', l_data, 200);
exception
   when others then
      return api.build_response('error', sqlstate || ': ' || sqlerrm, null, 500);
end;
$$;

create or replace function api.delete_record(p_pk integer) returns jsonb language plpgsql as $$
declare
   l_deleted jsonb;
begin
   if not exists(select 1 from api.test_table where pk = p_pk) then
      return api.build_response('error', 'Record not found for deletion', null, 404);
   end if;

   delete from api.test_table where pk = p_pk;
   l_deleted := jsonb_build_object('deleted_id', p_pk);

   return api.build_response('success', 'Record deleted successfully', l_deleted, 200);
exception
   when others then
      return api.build_response('error', sqlstate || ': ' || sqlerrm, null, 500);
end;
$$;

create or replace function api.get_record(p_pk integer) returns jsonb language plpgsql as $$
declare
   l_data jsonb;
begin
   l_data := api.get_record_object(p_pk);
   return jsonb_build_object('status','success','data',l_data);
exception
   when others then
      return api.build_response('error', sqlstate || ': ' || sqlerrm, null, 500);
end;
$$;

create or replace function api.get_records(
   p_page integer default 1,
   p_page_size integer default 20,
   p_sort_by text default 'pk',
   p_sort_order text default 'ASC',
   p_query text default null,
   p_search_type text default 'partial'
) returns jsonb language plpgsql as $$
declare
   v_total_count bigint;
   v_offset bigint;
   v_limit int := greatest(1, p_page_size);
   v_page int := greatest(1, p_page);
   v_total_pages int;
   v_valid_sort_by text;
   v_valid_sort_order text;
   v_where text;
   v_sql text;
   rec record;
   v_data jsonb := '[]'::jsonb;
   v_obj jsonb;
begin
   v_offset := (v_page - 1) * v_limit;

   select (api.validate_sort_params(p_sort_by, p_sort_order)).*
     into v_valid_sort_by, v_valid_sort_order;

   select (api.build_where_clause(p_query, p_search_type, 'descript,email')).*
     into v_where;

   if v_where is null then v_where := '1=1'; end if;

   v_sql := format('select count(*) from api.test_table where %s', v_where);
   execute v_sql into v_total_count;

   if v_total_count = 0 then
      return api.build_response('error', 'No records found', null, 404);
   end if;

   v_total_pages := ceil(v_total_count::numeric / v_limit)::int;

   v_sql := format(
      'select pk from api.test_table where %s order by %I %s offset %s limit %s',
      v_where, v_valid_sort_by, v_valid_sort_order, v_offset, v_limit
   );

   for rec in execute v_sql loop
      v_obj := api.get_record_object(rec.pk);
      v_data := v_data || jsonb_build_array(v_obj);
   end loop;

   return jsonb_build_object(
      'status','success',
      'http_status',200,
      'page',v_page,
      'page_size',v_limit,
      'sort_by',v_valid_sort_by,
      'sort_order',v_valid_sort_order,
      'total_records',v_total_count,
      'total_pages',v_total_pages,
      'data',v_data
   );
exception
   when others then
      return api.build_response('error', sqlstate || ': ' || sqlerrm, null, 500);
end;
$$;

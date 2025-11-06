drop table test_table purge;
drop package pkg_test_table;
-- Table creation script
create table test_table (
   pk          number,
   descript    varchar2(100),
   salary      number,
   sts         number default 0,
   email       varchar2(300),
   position_pk number,
   created_at  timestamp default current_timestamp,
   updated_at  timestamp default current_timestamp
);
-- Constraint creation script
alter table test_table
   add constraint test_table_pk primary key ( pk )
      using index enable;

alter table test_table modify (
   descript
      constraint test_table_descript_nn not null
);

alter table test_table modify (
   position_pk
      constraint test_table_position_nn not null
);

alter table test_table modify (
   salary
      constraint test_table_salary_nn not null
);

alter table test_table modify (
   sts
      constraint test_table_sts_nn not null
);

alter table test_table
   add constraint test_table_sts_chk check ( sts in ( 0,
                                                      1 ) );

alter table test_table add constraint test_table_salary_chk check ( salary >= 0 );

alter table test_table add constraint test_table_email_un unique ( email );

alter table test_table
   add constraint test_table_position_fk foreign key ( position_pk )
      references positions ( pk );

create index test_table_salary_idx on
   test_table (
      salary
   );

-- Trigger to automatically update "updated_at" on row update
create or replace trigger trg_test_table_updated_at before
   update on test_table
   for each row
begin
   :new.updated_at := current_timestamp;
end;
/

-- Package for CRUD operations
create or replace package pkg_test_table as
   function create_record (
      p_descript    in test_table.descript%type,
      p_salary      in test_table.salary%type,
      p_sts         in test_table.sts%type,
      p_email       in test_table.email%type,
      p_position_pk in test_table.position_pk%type
   ) return clob;

   function update_record (
      p_pk          in test_table.pk%type,
      p_descript    in test_table.descript%type,
      p_salary      in test_table.salary%type,
      p_sts         in test_table.sts%type,
      p_email       in test_table.email%type,
      p_position_pk in test_table.position_pk%type
   ) return clob;

   function delete_record (
      p_pk in test_table.pk%type
   ) return clob;

   function get_record (
      p_pk in test_table.pk%type
   ) return clob;

   function get_records (
      p_page        in number default 1,
      p_page_size   in number default 20,
      p_sort_by     in varchar2 default 'pk',
      p_sort_order  in varchar2 default 'ASC',
      p_query       in varchar2 default null,
      p_search_type in varchar2 default 'partial'
   ) return clob;
end pkg_test_table;
/
create or replace package body pkg_test_table as

    -- Valid sortable columns for records
   c_valid_sort_columns constant varchar2(500) := 'pk,descript,salary,sts,email,position_pk,created_at,updated_at';
    -- Searchable fields for records
   c_searchable_fields  constant varchar2(500) := 'descript,email';


    /**
    * Validates data before create or update operations
    */
   procedure validate_data (
      p_pk          in test_table.pk%type default null,
      p_descript    in test_table.descript%type,
      p_salary      in test_table.salary%type,
      p_sts         in test_table.sts%type,
      p_email       in test_table.email%type,
      p_position_pk in test_table.position_pk%type
   ) is
      l_existing_count number;
   begin
        -- Add validation logic here
      if p_pk is not null then
         select count(*)
           into l_existing_count
           from test_table
          where pk = p_pk;
         if l_existing_count = 0 then
            raise_application_error(
               -20003,
               'Record with the specified primary key does not exist'
            );
         end if;
      end if;
        -- e.g. raise_application_error(-20001, 'Validation error message');
      null;
   end validate_data;

    /**
    * Handles all exceptions and returns standardized error response
    */
   function handle_all_exceptions return clob is
   begin
      case sqlcode
         when -1 then
            return p_utilities.build_response(
               'error',
               'Record already exists',
               null,
               409
            );
         when -20002 then
            return p_utilities.build_response(
               'error',
               'Referenced record not found',
               null,
               404
            );
         else
            return p_utilities.build_response(
               'error',
               'Record operation failed: ' || sqlerrm,
               null,
               500
            );
      end case;
   end handle_all_exceptions;

    /**
    * Creates a JSON object for a single record
    */
   function get_record_object (
      p_pk in number
   ) return json_object_t is
      l_count       number;
      l_record      test_table%rowtype;
      l_json_record json_object_t := json_object_t();
   begin
      select count(*)
        into l_count
        from test_table
       where pk = p_pk;
      if l_count = 0 then
         raise_application_error(
            -20002,
            'Record not found'
         );
      end if;
      select pk,
             descript,
             salary,
             sts,
             email,
             position_pk,
             created_at,
             updated_at
        into l_record
        from test_table
       where pk = p_pk;
      l_json_record.put(
         'pk',
         l_record.pk
      );
      l_json_record.put(
         'descript',
         l_record.descript
      );
      l_json_record.put(
         'salary',
         l_record.salary
      );
      l_json_record.put(
         'sts',
         l_record.sts
      );
      l_json_record.put(
         'email',
         l_record.email
      );
      l_json_record.put(
         'position_pk',
         l_record.position_pk
      );
      l_json_record.put(
         'created_at',
         to_char(
            l_record.created_at,
            'YYYY-MM-DD"T"HH24:MI:SS"Z"'
         )
      );
      l_json_record.put(
         'updated_at',
         to_char(
            l_record.updated_at,
            'YYYY-MM-DD"T"HH24:MI:SS"Z"'
         )
      );
      return l_json_record;
   end get_record_object;

    /**
    *  Creates a new record
    */
   function create_record (
      p_descript    in test_table.descript%type,
      p_salary      in test_table.salary%type,
      p_sts         in test_table.sts%type,
      p_email       in test_table.email%type,
      p_position_pk in test_table.position_pk%type
   ) return clob is
      l_pk   test_table.pk%type;
      l_data json_object_t;
   begin
      validate_data(
         p_descript    => p_descript,
         p_salary      => p_salary,
         p_sts         => p_sts,
         p_email       => p_email,
         p_position_pk => p_position_pk
      );
      select nvl(
         max(pk),
         0
      ) + 1
        into l_pk
        from test_table;

      insert into test_table (
         pk,
         descript,
         salary,
         sts,
         email,
         position_pk
      ) values ( l_pk,
                 p_descript,
                 p_salary,
                 p_sts,
                 p_email,
                 p_position_pk );
      l_data := get_record_object(l_pk);
      return p_utilities.build_response(
         p_status      => 'success',
         p_http_status => 201,
         p_message     => 'Record created successfully',
         p_data        => l_data
      );

   exception
      when others then
         return handle_all_exceptions;
   end create_record;

    /**
    *  Updates a new record
    */

   function update_record (
      p_pk          in test_table.pk%type,
      p_descript    in test_table.descript%type,
      p_salary      in test_table.salary%type,
      p_sts         in test_table.sts%type,
      p_email       in test_table.email%type,
      p_position_pk in test_table.position_pk%type
   ) return clob is
      l_data json_object_t;
   begin
      validate_data(
         p_pk          => p_pk,
         p_descript    => p_descript,
         p_salary      => p_salary,
         p_sts         => p_sts,
         p_email       => p_email,
         p_position_pk => p_position_pk
      );
      update test_table
         set descript = p_descript,
             salary = p_salary,
             sts = p_sts,
             email = p_email,
             position_pk = p_position_pk,
             updated_at = current_timestamp
       where pk = p_pk;

      l_data := get_record_object(p_pk);
      return p_utilities.build_response(
         p_status      => 'success',
         p_http_status => 201,
         p_message     => 'Record updated successfully',
         p_data        => l_data
      );
   end update_record;

   /**
    *  Deletes a record
    */
   function delete_record (
      p_pk in test_table.pk%type
   ) return clob is
      l_count    number;
      l_response json_object_t;
   begin
      select count(*)
        into l_count
        from test_table
       where pk = p_pk;
      if l_count = 0 then
         raise_application_error(
            -20002,
            'Record not found for deletion'
         );
      end if;
      delete from test_table
       where pk = p_pk;
     -- Build deleted record response
      l_response := json_object_t();
      l_response.put(
         'deleted_id',
         p_pk
      );
      return p_utilities.build_response(
         'success',
         'Record deleted successfully',
         l_response,
         200
      );
   exception
      when others then
         return handle_all_exceptions;
   end delete_record;

   /**
    *  Retrieves a single record
    */
   function get_record (
      p_pk in test_table.pk%type
   ) return clob is
      l_data json_object_t;
   begin
      l_data := get_record_object(p_pk);
      return '{"status":"success","data":'
             || l_data.to_clob()
             || '}';
   end get_record;

   /**
    *  Retrieves multiple records with pagination, sorting, and filtering
    */
   function get_records (
      p_page        in number default 1,
      p_page_size   in number default 20,
      p_sort_by     in varchar2 default 'pk',
      p_sort_order  in varchar2 default 'ASC',
      p_query       in varchar2 default null,
      p_search_type in varchar2 default 'partial'
   ) return clob is
      v_total_count      number;
      v_offset           number;
      v_valid_page       number;
      v_valid_size       number;
      v_limit            number;
      v_total_pages      number;
      v_data             json_array_t := json_array_t();
      v_record_data      json_object_t;
      v_valid_sort_by    varchar2(50);
      v_valid_sort_order varchar2(10);
      v_sort_clause      varchar2(100);
      v_where_clause     varchar2(1000);
      v_sql              varchar2(4000);
      
      -- Optimized cursor with ref cursor for dynamic SQL
      type t_cursor is ref cursor;
      c_records          t_cursor;

      -- Variables for fetching minimal data
      -- Only need pk for get_record_object() call
      v_pk               number;
   begin
      -- Validate pagination parameters using centralized utility
      p_utilities.validate_pagination_parameters(
         p_page       => p_page,
         p_page_size  => p_page_size,
         p_valid_page => v_valid_page,
         p_valid_size => v_valid_size,
         p_offset     => v_offset,
         p_limit      => v_limit
      );

      -- Validate and normalize sorting parameters using centralized utility
      p_utilities.validate_sorting_parameters(
         p_sort_by          => p_sort_by,
         p_sort_order       => p_sort_order,
         p_valid_columns    => c_valid_sort_columns,
         p_valid_sort_by    => v_valid_sort_by,
         p_valid_sort_order => v_valid_sort_order,
         p_sort_clause      => v_sort_clause
      );
      -- Build WHERE clause with embedded search values (no bind variables needed)
      v_where_clause := p_utilities.build_where_clause(
         p_query,
         p_search_type,
         c_searchable_fields
      );

      -- Get total count with complete WHERE clause
      v_sql := 'select count(*) from test_table ' || v_where_clause;
      execute immediate v_sql
        into v_total_count;
      
      -- Calculate total pages
      v_total_pages := ceil(v_total_count / p_page_size);
      
      -- Check if no records found and raise error
      if v_total_count = 0 then
         raise_application_error(
            -20003,
            'No records found'
         );
      end if;

      -- Build optimized SQL with only pk (minimal data transfer)
      v_sql := 'select pk from test_table '
               || 'WHERE '
               || v_where_clause
               || ' '
               || 'ORDER BY '
               || v_sort_clause
               || ' '
               || 'OFFSET :offset ROWS FETCH NEXT :page_size ROWS ONLY';
      open c_records for v_sql
         using v_offset,p_page_size;

      -- Build data array efficiently (minimal data transfer, then full record via get_record_object)
      loop
         fetch c_records into v_pk;
         exit when c_records%notfound;
         
         -- Create JSON object using existing get_record_object function
         v_record_data := get_record_object(v_pk);
         v_data.append(v_record_data);
      end loop;

      close c_records;

      -- Return paginated response using centralized function
      return p_utilities.build_paginated_response(
         p_entity_name        => 'test_table',
         p_status             => 'success',
         p_http_status        => 200,
         p_page               => p_page,
         p_page_size          => p_page_size,
         p_sort_by            => v_valid_sort_by,
         p_sort_order         => v_valid_sort_order,
         p_query              => p_query,
         p_search_type        => p_search_type,
         p_search_columns     => json_array_t('["'
                                          || replace(
            c_searchable_fields,
            ',',
            '", "'
         ) || '"]'),
         p_data_array         => v_data,
         p_total_records      => v_total_count,
         p_total_pages        => v_total_pages,
         p_additional_filters => null
      );
   exception
      when others then
         -- Ensure cursor is properly closed in case of exceptions
         if c_records%isopen then
            close c_records;
         end if;
         return handle_all_exceptions;
   end get_records;

end pkg_test_table;
/
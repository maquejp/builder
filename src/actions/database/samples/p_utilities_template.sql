-- Utility Package Template for StackCraft Generated CRUD Packages
-- This package provides common utilities required by generated CRUD packages
-- Author: StackCraft Generator
-- License: EUPL-1.2

-- Package Specification
create or replace package p_utilities as

   /**
   * Build standardized JSON response
   */
   function build_response (
      p_status      in varchar2,
      p_message     in varchar2,
      p_data        in json_object_t default null,
      p_http_status in number default 200
   ) return clob;

   /**
   * Build standardized paginated JSON response
   */
   function build_paginated_response (
      p_entity_name        in varchar2,
      p_status             in varchar2,
      p_http_status        in number,
      p_page               in number,
      p_page_size          in number,
      p_sort_by            in varchar2,
      p_sort_order         in varchar2,
      p_query              in varchar2,
      p_search_type        in varchar2,
      p_search_columns     in json_array_t,
      p_data_array         in json_array_t,
      p_total_records      in number,
      p_total_pages        in number,
      p_additional_filters in json_object_t default null
   ) return clob;

   /**
   * Validate and normalize pagination parameters
   */
   procedure validate_pagination_parameters (
      p_page       in number,
      p_page_size  in number,
      p_valid_page out number,
      p_valid_size out number,
      p_offset     out number,
      p_limit      out number
   );

   /**
   * Validate and normalize sorting parameters
   */
   procedure validate_sorting_parameters (
      p_sort_by          in varchar2,
      p_sort_order       in varchar2,
      p_valid_columns    in varchar2,
      p_valid_sort_by    out varchar2,
      p_valid_sort_order out varchar2,
      p_sort_clause      out varchar2
   );

   /**
   * Build WHERE clause for search functionality
   */
   function build_where_clause (
      p_query             in varchar2,
      p_search_type       in varchar2,
      p_searchable_fields in varchar2
   ) return varchar2;

end p_utilities;
/

-- Package Body
create or replace package body p_utilities as

   -- Constants
   c_max_page_size     constant number := 1000;
   c_default_page_size constant number := 20;

   /**
   * Build standardized JSON response
   */
   function build_response (
      p_status      in varchar2,
      p_message     in varchar2,
      p_data        in json_object_t default null,
      p_http_status in number default 200
   ) return clob is
      l_response json_object_t := json_object_t();
   begin
      l_response.put(
         'status',
         p_status
      );
      l_response.put(
         'message',
         p_message
      );
      l_response.put(
         'http_status',
         p_http_status
      );
      l_response.put(
         'timestamp',
         to_char(
            systimestamp,
            'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'
         )
      );
      if p_data is not null then
         l_response.put(
            'data',
            p_data
         );
      end if;
      return l_response.to_clob();
   end build_response;

   /**
   * Build standardized paginated JSON response
   */
   function build_paginated_response (
      p_entity_name        in varchar2,
      p_status             in varchar2,
      p_http_status        in number,
      p_page               in number,
      p_page_size          in number,
      p_sort_by            in varchar2,
      p_sort_order         in varchar2,
      p_query              in varchar2,
      p_search_type        in varchar2,
      p_search_columns     in json_array_t,
      p_data_array         in json_array_t,
      p_total_records      in number,
      p_total_pages        in number,
      p_additional_filters in json_object_t default null
   ) return clob is
      l_response   json_object_t := json_object_t();
      l_pagination json_object_t := json_object_t();
      l_search     json_object_t := json_object_t();
   begin
      -- Build pagination info
      l_pagination.put(
         'page',
         p_page
      );
      l_pagination.put(
         'page_size',
         p_page_size
      );
      l_pagination.put(
         'total_records',
         p_total_records
      );
      l_pagination.put(
         'total_pages',
         p_total_pages
      );
      l_pagination.put(
         'has_next',
         case
            when p_page < p_total_pages then
                  'true'
            else
               'false'
         end
      );
      l_pagination.put(
         'has_previous',
         case
            when p_page > 1 then
                  'true'
            else
               'false'
         end
      );

      -- Build search info
      l_search.put(
         'query',
         p_query
      );
      l_search.put(
         'search_type',
         p_search_type
      );
      l_search.put(
         'searchable_columns',
         p_search_columns
      );
      l_search.put(
         'sort_by',
         p_sort_by
      );
      l_search.put(
         'sort_order',
         p_sort_order
      );

      -- Build main response
      l_response.put(
         'status',
         p_status
      );
      l_response.put(
         'http_status',
         p_http_status
      );
      l_response.put(
         'timestamp',
         to_char(
            systimestamp,
            'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'
         )
      );
      l_response.put(
         'entity',
         p_entity_name
      );
      l_response.put(
         'pagination',
         l_pagination
      );
      l_response.put(
         'search',
         l_search
      );
      l_response.put(
         'data',
         p_data_array
      );
      if p_additional_filters is not null then
         l_response.put(
            'filters',
            p_additional_filters
         );
      end if;
      return l_response.to_clob();
   end build_paginated_response;

   /**
   * Validate and normalize pagination parameters
   */
   procedure validate_pagination_parameters (
      p_page       in number,
      p_page_size  in number,
      p_valid_page out number,
      p_valid_size out number,
      p_offset     out number,
      p_limit      out number
   ) is
   begin
      -- Validate and normalize page
      p_valid_page := greatest(
         nvl(
            p_page,
            1
         ),
         1
      );
      
      -- Validate and normalize page size
      p_valid_size := least(
         greatest(
            nvl(
               p_page_size,
               c_default_page_size
            ),
            1
         ),
         c_max_page_size
      );
      
      -- Calculate offset and limit
      p_offset := ( p_valid_page - 1 ) * p_valid_size;
      p_limit := p_valid_size;
   end validate_pagination_parameters;

   /**
   * Validate and normalize sorting parameters
   */
   procedure validate_sorting_parameters (
      p_sort_by          in varchar2,
      p_sort_order       in varchar2,
      p_valid_columns    in varchar2,
      p_valid_sort_by    out varchar2,
      p_valid_sort_order out varchar2,
      p_sort_clause      out varchar2
   ) is
      l_columns_array apex_t_varchar2;
      l_column_found  boolean := false;
   begin
      -- Default sort order
      p_valid_sort_order :=
         case
            when upper(nvl(
               p_sort_order,
               'ASC'
            )) in ( 'DESC',
                    'DESCENDING' ) then
               'DESC'
            else
               'ASC'
         end;

      -- Validate sort column
      if
         p_valid_columns is not null
         and p_sort_by is not null
      then
         l_columns_array := apex_string.split(
            lower(p_valid_columns),
            ','
         );
         for i in 1..l_columns_array.count loop
            if trim(l_columns_array(i)) = lower(trim(p_sort_by)) then
               l_column_found := true;
               p_valid_sort_by := trim(l_columns_array(i));
               exit;
            end if;
         end loop;
      end if;

      -- Use first column as default if sort column not found
      if
         not l_column_found
         and p_valid_columns is not null
      then
         l_columns_array := apex_string.split(
            lower(p_valid_columns),
            ','
         );
         if l_columns_array.count > 0 then
            p_valid_sort_by := trim(l_columns_array(1));
         else
            p_valid_sort_by := 'pk';
         end if;
      elsif not l_column_found then
         p_valid_sort_by := 'pk';
      end if;

      -- Build sort clause
      p_sort_clause := p_valid_sort_by
                       || ' '
                       || p_valid_sort_order;
   end validate_sorting_parameters;

   /**
   * Build WHERE clause for search functionality
   */
   function build_where_clause (
      p_query             in varchar2,
      p_search_type       in varchar2,
      p_searchable_fields in varchar2
   ) return varchar2 is
      l_where_clause     varchar2(4000) := '1=1';
      l_search_condition varchar2(1000);
      l_fields_array     apex_t_varchar2;
      l_conditions       apex_t_varchar2 := apex_t_varchar2();
   begin
      -- Return default if no query provided
      if p_query is null
      or trim(p_query) = '' then
         return l_where_clause;
      end if;

      -- Return default if no searchable fields
      if p_searchable_fields is null
      or trim(p_searchable_fields) = '' then
         return l_where_clause;
      end if;

      -- Split searchable fields
      l_fields_array := apex_string.split(
         lower(p_searchable_fields),
         ','
      );

      -- Build search conditions for each field
      for i in 1..l_fields_array.count loop
         case upper(nvl(
            p_search_type,
            'PARTIAL'
         ))
            when 'EXACT' then
               l_search_condition := 'UPPER('
                                     || trim(l_fields_array(i))
                                     || ') = UPPER('''
                                     || replace(
                  p_query,
                  '''',
                  ''''''
               )
                                     || ''')';
            when 'STARTS_WITH' then
               l_search_condition := 'UPPER('
                                     || trim(l_fields_array(i))
                                     || ') LIKE UPPER('''
                                     || replace(
                  p_query,
                  '''',
                  ''''''
               )
                                     || '%'')';
            when 'ENDS_WITH' then
               l_search_condition := 'UPPER('
                                     || trim(l_fields_array(i))
                                     || ') LIKE UPPER(''%'
                                     || replace(
                  p_query,
                  '''',
                  ''''''
               )
                                     || ''')';
            else -- PARTIAL (default)
               l_search_condition := 'UPPER('
                                     || trim(l_fields_array(i))
                                     || ') LIKE UPPER(''%'
                                     || replace(
                  p_query,
                  '''',
                  ''''''
               )
                                     || '%'')';
         end case;

         l_conditions.extend;
         l_conditions(l_conditions.count) := l_search_condition;
      end loop;

      -- Combine conditions with OR
      if l_conditions.count > 0 then
         l_where_clause := l_where_clause
                           || ' AND ('
                           || apex_string.join(
            l_conditions,
            ' OR '
         )
                           || ')';
      end if;

      return l_where_clause;
   end build_where_clause;

end p_utilities;
/
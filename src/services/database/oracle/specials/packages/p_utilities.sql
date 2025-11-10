create or replace package p_utilities as
   procedure validate_pagination_parameters (
      p_page       in number,
      p_page_size  in number,
      p_valid_page out number,
      p_valid_size out number,
      p_offset     out number,
      p_limit      out number
   );

   function build_pagination_object (
      p_page          in number,
      p_page_size     in number,
      p_total_records in number,
      p_total_pages   in number
   ) return json_object_t;

   function build_sorting_object (
      p_sort_by    in varchar2,
      p_sort_order in varchar2
   ) return json_object_t;

   procedure validate_sorting_parameters (
      p_sort_by          in varchar2,
      p_sort_order       in varchar2,
      p_valid_columns    in varchar2,
      p_valid_sort_by    out varchar2,
      p_valid_sort_order out varchar2,
      p_sort_clause      out varchar2
   );

   function build_where_clause (
      p_query         in varchar2,
      p_search_type   in varchar2,
      p_search_fields in varchar2 default 'name'
   ) return varchar2;

   function build_response (
      p_status      in varchar2,
      p_message     in varchar2,
      p_data        in json_object_t default null,
      p_http_status in number default 200
   ) return clob;

   function build_array_response (
      p_status      in varchar2,
      p_message     in varchar2,
      p_data        in json_array_t,
      p_http_status in number default 200
   ) return clob;

   function build_paginated_response (
      p_status             in varchar2,
      p_http_status        in number,
      p_page               in number,
      p_page_size          in number,
      p_sort_by            in varchar2,
      p_sort_order         in varchar2,
      p_query              in varchar2,
      p_search_type        in varchar2,
      p_data_array         in json_array_t,
      p_total_records      in number,
      p_total_pages        in number,
      p_entity_name        in varchar2,
      p_search_columns     in json_array_t,
      p_search_description in varchar2 default null,
      p_additional_filters in json_object_t default null
   ) return clob;

end p_utilities;
/

create or replace package body p_utilities as

   procedure validate_pagination_parameters (
      p_page       in number,
      p_page_size  in number,
      p_valid_page out number,
      p_valid_size out number,
      p_offset     out number,
      p_limit      out number
   ) is
   begin
         -- Validate page parameter
      if p_page is null
      or p_page < 1 then
         raise_application_error(
            -20001,
            'Page number must be a positive integer (minimum: 1)'
         );
      end if;

      p_valid_page := p_page;

         -- Validate page_size parameter
      if p_page_size is null
      or p_page_size < 1
      or p_page_size > 100 then
         raise_application_error(
            -20001,
            'Page size must be between 1 and 100'
         );
      end if;

      p_valid_size := p_page_size;
         
         -- Calculate offset and limit for pagination
      p_offset := ( p_valid_page - 1 ) * p_valid_size;
      p_limit := p_valid_size;
   end validate_pagination_parameters;
      
      -- Build pagination object using json_object_t approach
   function build_pagination_object (
      p_page          in number,
      p_page_size     in number,
      p_total_records in number,
      p_total_pages   in number
   ) return json_object_t is
      l_pagination_obj json_object_t;
   begin
      l_pagination_obj := json_object_t();
      l_pagination_obj.put(
         'current_page',
         p_page
      );
      l_pagination_obj.put(
         'page_size',
         p_page_size
      );
      l_pagination_obj.put(
         'total_records',
         p_total_records
      );
      l_pagination_obj.put(
         'total_pages',
         p_total_pages
      );
      l_pagination_obj.put(
         'has_next_page',
         case
            when p_page < p_total_pages then
                  'true'
            else
               'false'
         end
      );
      l_pagination_obj.put(
         'has_previous_page',
         case
            when p_page > 1 then
                  'true'
            else
               'false'
         end
      );
      return l_pagination_obj;
   end build_pagination_object;

   function build_sorting_object (
      p_sort_by    in varchar2,
      p_sort_order in varchar2
   ) return json_object_t is
      l_sorting_obj json_object_t;
   begin
      l_sorting_obj := json_object_t();
      l_sorting_obj.put(
         'sort_by',
         p_sort_by
      );
      l_sorting_obj.put(
         'sort_order',
         p_sort_order
      );
      return l_sorting_obj;
   end build_sorting_object;

   procedure validate_sorting_parameters (
      p_sort_by          in varchar2,
      p_sort_order       in varchar2,
      p_valid_columns    in varchar2,
      p_valid_sort_by    out varchar2,
      p_valid_sort_order out varchar2,
      p_sort_clause      out varchar2
   ) is
      l_columns_list varchar2(1000);
   begin
      -- Validate sort_by parameter (case insensitive, simple list check)
      p_valid_sort_by := lower(trim(p_sort_by));
      
      -- Prepare columns list with comma delimiters for exact matching
      l_columns_list := ','
                        || p_valid_columns
                        || ',';
      if instr(
         l_columns_list,
         ','
         || p_valid_sort_by
         || ','
      ) = 0 then
         raise_application_error(
            -20001,
            'Invalid sort_by parameter. Valid values are: '
            || replace(
               p_valid_columns,
               ',',
               ', '
            )
         );
      end if;
      
      -- Validate sort_order parameter (simple check)
      p_valid_sort_order := upper(trim(p_sort_order));
      if p_valid_sort_order not in ( 'ASC',
                                     'DESC' ) then
         raise_application_error(
            -20001,
            'Invalid sort_order parameter. Valid values are: ASC, DESC'
         );
      end if;
      
      -- Build sort clause
      p_sort_clause := p_valid_sort_by
                       || ' '
                       || p_valid_sort_order;
   end validate_sorting_parameters;

   function build_where_clause (
      p_query         in varchar2,
      p_search_type   in varchar2,
      p_search_fields in varchar2 default 'name'
   ) return varchar2 is

      l_where_clause  varchar2(4000);
      l_field_clauses varchar2(4000);
      l_field         varchar2(100);
      l_start_pos     number := 1;
      l_comma_pos     number;
      l_field_count   number := 0;
   begin
      if p_query is null then
         return '1=1';
      end if;
      
      -- Validate search type parameter
      if p_search_type not in ( 'exact',
                                'starts_with',
                                'partial' ) then
         raise_application_error(
            -20001,
            'Invalid search type. Valid values are: exact, starts_with, partial'
         );
      end if;
      
      -- Build individual field conditions
      l_field_clauses := '';
      
      -- Parse comma-separated field list
      loop
         l_comma_pos := instr(
            p_search_fields,
            ',',
            l_start_pos
         );
         if l_comma_pos = 0 then
            -- Last field
            l_field := trim(substr(
               p_search_fields,
               l_start_pos
            ));
         else
            -- Field with comma
            l_field := trim(substr(
               p_search_fields,
               l_start_pos,
               l_comma_pos - l_start_pos
            ));
         end if;
         
         -- Skip empty fields
         if l_field is not null then
            l_field_count := l_field_count + 1;
            
            -- Add OR separator if not first field
            if l_field_count > 1 then
               l_field_clauses := l_field_clauses || ' OR ';
            end if;
            
            -- Build field condition based on search type with embedded p_query value
            case p_search_type
               when 'exact' then
                  l_field_clauses := l_field_clauses
                                     || 'lower('
                                     || l_field
                                     || ') = lower('''
                                     || replace(
                     p_query,
                     '''',
                     ''''''
                  )
                                     || ''')';
               when 'starts_with' then
                  l_field_clauses := l_field_clauses
                                     || 'lower('
                                     || l_field
                                     || ') like lower('''
                                     || replace(
                     p_query,
                     '''',
                     ''''''
                  )
                                     || ''') || ''%''';
               when 'partial' then
                  l_field_clauses := l_field_clauses
                                     || 'lower('
                                     || l_field
                                     || ') like ''%'' || lower('''
                                     || replace(
                     p_query,
                     '''',
                     ''''''
                  )
                                     || ''') || ''%''';
               else
                  l_field_clauses := l_field_clauses
                                     || 'lower('
                                     || l_field
                                     || ') like ''%'' || lower('''
                                     || replace(
                     p_query,
                     '''',
                     ''''''
                  )
                                     || ''') || ''%''';
            end case;

         end if;
         
         -- Exit if no more commas
         exit when l_comma_pos = 0;
         
         -- Move to next field
         l_start_pos := l_comma_pos + 1;
      end loop;
      
      -- Wrap in parentheses if multiple fields
      if l_field_count > 1 then
         l_where_clause := '('
                           || l_field_clauses
                           || ')';
      else
         l_where_clause := l_field_clauses;
      end if;

      return l_where_clause;
   end build_where_clause;

   function build_response (
      p_status      in varchar2,
      p_message     in varchar2,
      p_data        in json_object_t default null,
      p_http_status in number default 200
   ) return clob is
      l_response json_object_t;
   begin
      l_response := json_object_t();
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
      
      -- Handle data parameter - be explicit about the type
      if p_data is not null then
         l_response.put(
            'data',
            treat(p_data as json_element_t)
         );
      else
         l_response.put(
            'data',
            cast(null as json_element_t)
         );
      end if;

      l_response.put(
         'timestamp',
         to_char(
            systimestamp,
            'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'
         )
      );
      return l_response.to_clob();
   end build_response;
   
   -- Build standardized JSON response (array data variant)
   function build_array_response (
      p_status      in varchar2,
      p_message     in varchar2,
      p_data        in json_array_t,
      p_http_status in number default 200
   ) return clob is
      l_response     json_object_t;
      l_data_wrapper json_object_t;
   begin
      l_response := json_object_t();
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
      
      -- Put the array directly in data field for clean structure
      if p_data is not null then
         l_response.put(
            'data',
            treat(p_data as json_element_t)
         );
      else
         l_response.put(
            'data',
            cast(null as json_element_t)
         );
      end if;

      l_response.put(
         'timestamp',
         to_char(
            systimestamp,
            'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'
         )
      );
      return l_response.to_clob();
   end build_array_response;

   function build_paginated_response (
      p_status             in varchar2,
      p_http_status        in number,
      p_page               in number,
      p_page_size          in number,
      p_sort_by            in varchar2,
      p_sort_order         in varchar2,
      p_query              in varchar2,
      p_search_type        in varchar2,
      p_data_array         in json_array_t,
      p_total_records      in number,
      p_total_pages        in number,
      p_entity_name        in varchar2,
      p_search_columns     in json_array_t,
      p_search_description in varchar2 default null,
      p_additional_filters in json_object_t default null
   ) return clob is

      l_response          json_object_t;
      l_message           varchar2(500);
      l_pagination_obj    json_object_t;
      l_sorting_obj       json_object_t;
      l_query_obj         json_object_t;
      l_final_search_desc varchar2(1000);
   begin
      -- Build dynamic message with entity name
      l_message := p_entity_name
                   || ' retrieved successfully (page '
                   || p_page
                   || ', size '
                   || p_page_size
                   || ', sorted by '
                   || p_sort_by
                   || ' '
                   || p_sort_order;
      
      -- Add query information if provided
      if
         p_query is not null
         and length(trim(p_query)) > 0
      then
         l_message := l_message
                      || ', filtered by: '
                      || p_query;
         
         -- Add search type if provided
         if p_search_type is not null then
            l_message := l_message
                         || ' ('
                         || p_search_type
                         || ')';
         end if;

      end if;
      
      -- Add additional filters information if provided
      if
         p_additional_filters is not null
         and p_additional_filters.get_size() > 0
      then
         -- Extract common filter information for message
         if
            p_additional_filters.has('status_filter')
            and p_additional_filters.get('status_filter').is_number()
         then
            l_message := l_message
                         || ', status = '
                         || p_additional_filters.get_number('status_filter');
         end if;
      end if;

      l_message := l_message || ')';
      
      -- Build pagination and sorting objects using existing utility functions
      l_pagination_obj := build_pagination_object(
         p_page,
         p_page_size,
         p_total_records,
         p_total_pages
      );
      l_sorting_obj := build_sorting_object(
         p_sort_by,
         p_sort_order
      );
      
      -- Build search description if not provided
      if p_search_description is null then
         l_final_search_desc :=
            case nvl(
               p_search_type,
               'partial'
            )
               when 'exact'       then
                  'Case-insensitive exact match on searchable fields'
               when 'starts_with' then
                  'Case-insensitive prefix match on searchable fields'
               else
                  'Case-insensitive partial match on searchable fields'
            end;
      else
         l_final_search_desc := p_search_description;
      end if;
      
      -- Build query object
      l_query_obj := json_object_t();
      l_query_obj.put(
         'search_term',
         case
            when p_query is not null
                  and length(trim(p_query)) > 0 then
                  p_query
            else
               null
         end
      );

      l_query_obj.put(
         'search_type',
         p_search_type
      );
      l_query_obj.put(
         'search_columns',
         p_search_columns
      );
      l_query_obj.put(
         'search_description',
         l_final_search_desc
      );
      
      -- Add additional filters to query object if provided
      if
         p_additional_filters is not null
         and p_additional_filters.get_size() > 0
      then
         declare
            l_keys json_key_list;
         begin
            l_keys := p_additional_filters.get_keys();
            for i in 1..l_keys.count loop
               l_query_obj.put(
                  l_keys(i),
                  p_additional_filters.get(l_keys(i))
               );
            end loop;

         end;
      end if;
      
      -- Build the complete response object with standardized structure
      l_response := json_object_t();
      l_response.put(
         'status',
         p_status
      );
      l_response.put(
         'message',
         l_message
      );
      l_response.put(
         'http_status',
         p_http_status
      );
      l_response.put(
         'data',
         treat(p_data_array as json_element_t)
      );
      l_response.put(
         'pagination',
         l_pagination_obj
      );
      l_response.put(
         'sorting',
         l_sorting_obj
      );
      l_response.put(
         'query',
         l_query_obj
      );
      l_response.put(
         'timestamp',
         to_char(
            systimestamp,
            'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'
         )
      );
      return l_response.to_clob();
   end build_paginated_response;

end p_utilities;
/
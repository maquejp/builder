-- ============================================================
-- Oracle Schema Cleanup Script
-- Deletes all tables, views, packages, and related objects
-- from the current user schema
-- ============================================================

-- WARNING: This script will permanently delete ALL objects
-- in your schema. Make sure you have backups if needed.

   SET SERVEROUTPUT ON;

begin
   dbms_output.put_line('Starting Oracle schema cleanup...');
   dbms_output.put_line('===========================================');
end;
/

-- ============================================================
-- 1. DROP ALL PACKAGES (Package Bodies first, then Specs)
-- ============================================================

begin
   dbms_output.put_line('');
   dbms_output.put_line('1. Dropping Package Bodies...');
   for pkg in (
      select object_name
        from user_objects
       where object_type = 'PACKAGE BODY'
       order by object_name
   ) loop
      begin
         execute immediate 'DROP PACKAGE BODY ' || pkg.object_name;
         dbms_output.put_line('   Dropped package body: ' || pkg.object_name);
      exception
         when others then
            dbms_output.put_line('   ERROR dropping package body '
                                 || pkg.object_name
                                 || ': ' || sqlerrm);
      end;
   end loop;
end;
/

begin
   dbms_output.put_line('');
   dbms_output.put_line('2. Dropping Package Specifications...');
   for pkg in (
      select object_name
        from user_objects
       where object_type = 'PACKAGE'
       order by object_name
   ) loop
      begin
         execute immediate 'DROP PACKAGE ' || pkg.object_name;
         dbms_output.put_line('   Dropped package: ' || pkg.object_name);
      exception
         when others then
            dbms_output.put_line('   ERROR dropping package '
                                 || pkg.object_name
                                 || ': ' || sqlerrm);
      end;
   end loop;
end;
/

-- ============================================================
-- 2. DROP ALL VIEWS
-- ============================================================

begin
   dbms_output.put_line('');
   dbms_output.put_line('3. Dropping Views...');
   for vw in (
      select view_name
        from user_views
       order by view_name
   ) loop
      begin
         execute immediate 'DROP VIEW ' || vw.view_name;
         dbms_output.put_line('   Dropped view: ' || vw.view_name);
      exception
         when others then
            dbms_output.put_line('   ERROR dropping view '
                                 || vw.view_name
                                 || ': ' || sqlerrm);
      end;
   end loop;
end;
/

-- ============================================================
-- 3. DROP ALL MATERIALIZED VIEWS
-- ============================================================

begin
   dbms_output.put_line('');
   dbms_output.put_line('4. Dropping Materialized Views...');
   for mv in (
      select mview_name
        from user_mviews
       order by mview_name
   ) loop
      begin
         execute immediate 'DROP MATERIALIZED VIEW ' || mv.mview_name;
         dbms_output.put_line('   Dropped materialized view: ' || mv.mview_name);
      exception
         when others then
            dbms_output.put_line('   ERROR dropping materialized view '
                                 || mv.mview_name
                                 || ': ' || sqlerrm);
      end;
   end loop;
end;
/

-- ============================================================
-- 4. DROP ALL FUNCTIONS
-- ============================================================

begin
   dbms_output.put_line('');
   dbms_output.put_line('5. Dropping Functions...');
   for func in (
      select object_name
        from user_objects
       where object_type = 'FUNCTION'
       order by object_name
   ) loop
      begin
         execute immediate 'DROP FUNCTION ' || func.object_name;
         dbms_output.put_line('   Dropped function: ' || func.object_name);
      exception
         when others then
            dbms_output.put_line('   ERROR dropping function '
                                 || func.object_name
                                 || ': ' || sqlerrm);
      end;
   end loop;
end;
/

-- ============================================================
-- 5. DROP ALL PROCEDURES
-- ============================================================

begin
   dbms_output.put_line('');
   dbms_output.put_line('6. Dropping Procedures...');
   for proc in (
      select object_name
        from user_objects
       where object_type = 'PROCEDURE'
       order by object_name
   ) loop
      begin
         execute immediate 'DROP PROCEDURE ' || proc.object_name;
         dbms_output.put_line('   Dropped procedure: ' || proc.object_name);
      exception
         when others then
            dbms_output.put_line('   ERROR dropping procedure '
                                 || proc.object_name
                                 || ': ' || sqlerrm);
      end;
   end loop;
end;
/

-- ============================================================
-- 6. DROP ALL SEQUENCES
-- ============================================================

begin
   dbms_output.put_line('');
   dbms_output.put_line('7. Dropping Sequences...');
   for seq in (
      select sequence_name
        from user_sequences
       order by sequence_name
   ) loop
      begin
         execute immediate 'DROP SEQUENCE ' || seq.sequence_name;
         dbms_output.put_line('   Dropped sequence: ' || seq.sequence_name);
      exception
         when others then
            dbms_output.put_line('   ERROR dropping sequence '
                                 || seq.sequence_name
                                 || ': ' || sqlerrm);
      end;
   end loop;
end;
/

-- ============================================================
-- 7. DROP ALL TRIGGERS (before dropping tables)
-- ============================================================

begin
   dbms_output.put_line('');
   dbms_output.put_line('8. Dropping Triggers...');
   for trg in (
      select trigger_name
        from user_triggers
       order by trigger_name
   ) loop
      begin
         execute immediate 'DROP TRIGGER ' || trg.trigger_name;
         dbms_output.put_line('   Dropped trigger: ' || trg.trigger_name);
      exception
         when others then
            dbms_output.put_line('   ERROR dropping trigger '
                                 || trg.trigger_name
                                 || ': ' || sqlerrm);
      end;
   end loop;
end;
/

-- ============================================================
-- 8. DROP ALL TABLES (CASCADE CONSTRAINTS to handle FKs)
-- ============================================================

begin
   dbms_output.put_line('');
   dbms_output.put_line('9. Dropping Tables...');
   for tbl in (
      select table_name
        from user_tables
       order by table_name
   ) loop
      begin
         execute immediate 'DROP TABLE '
                           || tbl.table_name
                           || ' CASCADE CONSTRAINTS';
         dbms_output.put_line('   Dropped table: ' || tbl.table_name);
      exception
         when others then
            dbms_output.put_line('   ERROR dropping table '
                                 || tbl.table_name
                                 || ': ' || sqlerrm);
      end;
   end loop;
end;
/

-- ============================================================
-- 9. DROP ALL TYPES
-- ============================================================

begin
   dbms_output.put_line('');
   dbms_output.put_line('10. Dropping Types...');
   for typ in (
      select type_name
        from user_types
       order by type_name
   ) loop
      begin
         execute immediate 'DROP TYPE '
                           || typ.type_name
                           || ' FORCE';
         dbms_output.put_line('   Dropped type: ' || typ.type_name);
      exception
         when others then
            dbms_output.put_line('   ERROR dropping type '
                                 || typ.type_name
                                 || ': ' || sqlerrm);
      end;
   end loop;
end;
/

-- ============================================================
-- 10. PURGE RECYCLEBIN (Optional - cleans up dropped objects)
-- ============================================================

begin
   dbms_output.put_line('');
   dbms_output.put_line('11. Purging Recyclebin...');
   begin
      execute immediate 'PURGE RECYCLEBIN';
      dbms_output.put_line('   Recyclebin purged successfully');
   exception
      when others then
         dbms_output.put_line('   ERROR purging recyclebin: ' || sqlerrm);
   end;
end;
/

-- ============================================================
-- FINAL STATUS CHECK
-- ============================================================

declare
   v_obj_count number;
begin
   dbms_output.put_line('');
   dbms_output.put_line('===========================================');
   dbms_output.put_line('Schema cleanup completed!');
   dbms_output.put_line('');
   dbms_output.put_line('Remaining objects in schema:');
   for obj in (
      select object_type,
             count(*) as obj_count
        from user_objects
       group by object_type
       order by object_type
   ) loop
      dbms_output.put_line('   '
                           || obj.object_type
                           || ': ' || obj.obj_count);
   end loop;
    
    -- Check if schema is completely clean
   select count(*)
     into v_obj_count
     from user_objects;

   if v_obj_count = 0 then
      dbms_output.put_line('');
      dbms_output.put_line('✓ Schema is completely clean!');
   else
      dbms_output.put_line('');
      dbms_output.put_line('⚠ Some objects may still remain - check above list');
   end if;

   dbms_output.put_line('===========================================');
end;
/
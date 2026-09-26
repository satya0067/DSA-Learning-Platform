-- ============================================================================
-- RUN THIS SCRIPT IN SUPABASE SQL EDITOR TO ALLOW BACKEND API ACCESS
-- ============================================================================

-- Disable Row Level Security (RLS) on all tables for the backend:
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS problems DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS test_cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookmarks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS discussions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;

-- Alternatively, grant full access to anon and authenticated roles:
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

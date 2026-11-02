-- scripts/staging/provision-staging-storage-buckets.sql
-- Ensure all 5 private buckets required by Phase 6 exist and are private with RLS

INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('documents', 'documents', false),
    ('resumes', 'resumes', false),
    ('cv-files', 'cv-files', false),
    ('cover-letters', 'cover-letters', false),
    ('user-uploads', 'user-uploads', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Verify all 5 are private
SELECT id, name, public FROM storage.buckets WHERE id IN ('documents', 'resumes', 'cv-files', 'cover-letters', 'user-uploads');

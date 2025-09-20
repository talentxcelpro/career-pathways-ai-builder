-- Remove DataSystems company and all related data
DELETE FROM company_follows WHERE company_id = '09f2b1dd-607d-4036-a664-746c9c77bebe';
DELETE FROM companies WHERE id = '09f2b1dd-607d-4036-a664-746c9c77bebe';

-- Also remove any orphaned company_follows that might reference non-existent companies
DELETE FROM company_follows 
WHERE company_id NOT IN (SELECT id FROM companies);
const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const p_object_name = '0b28a473-bcbb-4c49-b291-f9ea0daf4add/audit_resume_doc1.pdf';
  const p_object_owner = '0b28a473-bcbb-4c49-b291-f9ea0daf4add';
  const p_auth_uid = 'd5336939-770b-442b-88d0-a6edd6850657'; // recruiter

  const res = await runSql(`
    SELECT 
      ja.id AS app_id,
      ja.resume_url,
      ja.status AS app_status,
      j.id AS job_id,
      j.is_active AS job_active,
      j.expires_at,
      j.company_id,
      public.can_manage_company_job(j.company_id, '${p_auth_uid}') AS can_manage,
      ja.user_id = '${p_object_owner}'::uuid AS owner_match,
      (ja.user_id)::text = (storage.foldername('${p_object_name}'))[1] AS folder_match,
      (
        CASE 
          WHEN ja.resume_url LIKE '%/documents/%' THEN pg_catalog.regexp_replace(ja.resume_url, '^.*/documents/', '')
          WHEN ja.resume_url LIKE 'documents/%' THEN pg_catalog.substring(ja.resume_url, 11)
          ELSE pg_catalog.ltrim(ja.resume_url, '/')
        END
      ) AS normalized_resume_url,
      '${p_object_name}' = (
        CASE 
          WHEN ja.resume_url LIKE '%/documents/%' THEN pg_catalog.regexp_replace(ja.resume_url, '^.*/documents/', '')
          WHEN ja.resume_url LIKE 'documents/%' THEN pg_catalog.substring(ja.resume_url, 11)
          ELSE pg_catalog.ltrim(ja.resume_url, '/')
        END
      ) AS path_match
    FROM public.job_applications ja
    JOIN public.jobs j ON ja.job_id = j.id
    WHERE ja.user_id = '${p_object_owner}';
  `, 'staging');

  console.log('Query diagnostics:');
  console.log(res);
}

main().catch(console.error);

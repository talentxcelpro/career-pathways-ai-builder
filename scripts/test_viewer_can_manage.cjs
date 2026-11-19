const { runSql } = require('./db-audit-helper.cjs');

async function testViewerCanManage() {
  const rec_id = 'd5336939-770b-442b-88d0-a6edd6850657';
  const TEAM_MEMBER_ID = '11111111-cccc-cccc-cccc-111111111111';
  const REAL_COMPANY_ID = '11111111-aaaa-aaaa-aaaa-111111111111';

  runSql(`
    UPDATE public.company_team_members 
    SET role = 'viewer', is_active = true, permissions = '{"manage_jobs": false}'::jsonb, company_id = '${REAL_COMPANY_ID}'
    WHERE id = '${TEAM_MEMBER_ID}';
  `, 'staging');

  const res = runSql(`
    CREATE OR REPLACE FUNCTION public.test_check_viewer(p_user_id uuid)
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = ''
    AS $$
    BEGIN
      PERFORM set_config('request.jwt.claim.sub', p_user_id::text, true);
      PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
      RETURN public.can_manage_company_job('${REAL_COMPANY_ID}', auth.uid());
    END;
    $$;

    SELECT public.test_check_viewer('${rec_id}');
    DROP FUNCTION public.test_check_viewer(uuid);
  `, 'staging');
  console.log('Viewer can_manage:', res);
}

testViewerCanManage();

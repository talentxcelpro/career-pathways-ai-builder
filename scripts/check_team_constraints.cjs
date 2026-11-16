const { runSql } = require('./db-audit-helper.cjs');

async function checkTeamRole() {
  const enumVals = await runSql(`
    SELECT t.typname, e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname LIKE '%role%' OR t.typname LIKE '%team%';
  `, 'staging');
  console.log('Enums:', enumVals);

  const constraints = await runSql(`
    SELECT conname, pg_get_constraintdef(oid) 
    FROM pg_constraint 
    WHERE conrelid = 'public.company_team_members'::regclass;
  `, 'staging');
  console.log('Constraints:', constraints);
}

checkTeamRole();

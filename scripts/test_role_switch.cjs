const { runSql } = require('./db-audit-helper.cjs');

async function testRoleSwitch() {
  const res = runSql(`
    SELECT current_user, session_user;
  `, 'staging');
  console.log('Default connection users:', res);

  const res2 = runSql(`
    SET LOCAL ROLE service_role;
    SELECT current_user, session_user;
  `, 'staging');
  console.log('After SET LOCAL ROLE service_role:', res2);
}

testRoleSwitch();

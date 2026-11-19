const { runSql } = require('./db-audit-helper.cjs');

async function testFreeTextFieldsForPii() {
  console.log('Testing free-text fields (about, headline, title) for accidental contact-detail disclosure...');
  const sql = `
    SELECT 
      id,
      full_name,
      title,
      headline,
      about
    FROM public.profiles
    WHERE about ~* '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}'
       OR headline ~* '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}'
       OR title ~* '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}'
       OR about ~* '\\+?[0-9]{1,3}?[- .]?[0-9]{3}[- .]?[0-9]{3,4}[- .]?[0-9]{3,4}'
       OR headline ~* '\\+?[0-9]{1,3}?[- .]?[0-9]{3}[- .]?[0-9]{3,4}[- .]?[0-9]{3,4}';
  `;
  const res = runSql(sql, 'staging');
  console.log('Profiles with contact details in free-text fields on staging:', JSON.stringify(res, null, 2));
}

testFreeTextFieldsForPii().catch(console.error);

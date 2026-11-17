const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.pvwwtquuexhyydwihjbi:AcqLTPvK8W2TqE6c@aws-0-ap-south-1.pooler.supabase.com:6543/postgres'
});

async function run() {
  await client.connect();
  try {
    await client.query(`
      DO $$
      BEGIN
        PERFORM set_config('role', 'authenticated', true);
        PERFORM set_config('txc.in_consent_rpc', 'on', true);
      END $$;
    `);
    console.log('set_config allowed for authenticated');
  } catch(e) {
    console.log('set_config error:', e.message);
  }
  await client.end();
}

run();

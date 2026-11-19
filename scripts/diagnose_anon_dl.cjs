const { createClient } = require('@supabase/supabase-js');
const { STAGING_REF } = require('./db-audit-helper.cjs');

const SUPABASE_URL = `https://${STAGING_REF}.supabase.co`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";
const anonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

async function testAnon() {
  const doc1Path = '0b28a473-bcbb-4c49-b291-f9ea0daf4add/attached_application_resume.pdf';
  console.log('Testing anonClient download...');
  const res = await anonClient.storage.from('documents').download(doc1Path);
  console.log('Result:', {
    hasData: !!res.data,
    data: res.data,
    error: res.error
  });
  if (res.data) {
    console.log('Text:', await res.data.text());
  }
}

testAnon();

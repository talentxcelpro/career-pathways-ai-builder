// Test script to debug email sending
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dthlgsnakhoftinssokm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg1MzI4OSwiZXhwIjoyMDY2NDI5Mjg5fQ.2hbCdVvVaMwHDxK4e4d3o-xP__6fLPTxQfqoOKGGStw'
);

async function testEmailSending() {
  console.log('Testing email function...');
  
  try {
    const { data, error } = await supabase.functions.invoke('send-email-notification', {
      body: {
        event_name: 'test_email',
        recipient_email: 'test@example.com',
        recipient_name: 'Test User',
        platform_name: 'TalentXcel'
      }
    });
    
    console.log('Result:', data);
    console.log('Error:', error);
  } catch (err) {
    console.error('Catch error:', err);
  }
}

testEmailSending();
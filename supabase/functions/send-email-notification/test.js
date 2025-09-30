// Simple test script to test the Amazon SES function directly
const test = async () => {
  try {
    const response = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/send-email-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg1MzI4OSwiZXhwIjoyMDY2NDI5Mjg5fQ.2hbCdVvVaMwHDxK4e4d3o-xP__6fLPTxQfqoOKGGStw'
      },
      body: JSON.stringify({
        event_name: 'test_email',
        recipient_email: 'talentxcelpro@gmail.com',
        recipient_name: 'Test User',
        platform_name: 'TalentXcel'
      })
    });
    
    const result = await response.json();
    console.log('Test result:', result);
  } catch (error) {
    console.error('Test error:', error);
  }
};

test();
console.log('Function starting...');

Deno.serve(async (req) => {
  console.log('Request received:', req.method, req.url);
  
  if (req.method === 'OPTIONS') {
    return new Response('OK', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  return new Response('Function is working!', {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/plain',
    },
  });
});
// Simple test edge function for debugging

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('Simple test function called:', req.method, req.url);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    console.log('Processing POST request');
    const body = await req.text();
    console.log('Request body:', body);
    
    const responseData = { 
      success: true, 
      message: 'Simple test function working!',
      timestamp: new Date().toISOString(),
      method: req.method,
      receivedBody: body
    };
    
    console.log('Sending response:', responseData);
    
    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error in simple test function:', error);
    console.error('Error stack:', (error as Error).stack);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: (error as Error).message,
        stack: (error as Error).stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
})
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Only respond to root path
    if (pathname !== '/') {
      return new Response(
        JSON.stringify({ error: 'Not Found' }),
        { 
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Handle GET requests to root path
    if (req.method === 'GET') {
      const response = {
        status: "success",
        message: "Welcome to TalentXcel Auth Service",
        domain: "auth.talentxcel.in",
        docs: "https://talentxcel.in/docs/auth"
      };

      return new Response(
        JSON.stringify(response),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Method not allowed for non-GET requests
    return new Response(
      JSON.stringify({ error: 'Method Not Allowed' }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );

  } catch (error) {
    console.error('Error in auth-service-root:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  }
});
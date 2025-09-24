import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    
    // Extract the storage path (everything after the first /)
    const storagePath = path.substring(1);
    
    // Construct the Supabase storage URL
    const supabaseStorageUrl = `https://dthlgsnakhoftinssokm.supabase.co/storage/v1/object/public/${storagePath}`;
    
    console.log('Proxying request:', {
      originalPath: path,
      storagePath,
      supabaseUrl: supabaseStorageUrl
    });
    
    // Fetch from Supabase storage
    const response = await fetch(supabaseStorageUrl, {
      method: req.method,
      headers: {
        'User-Agent': req.headers.get('User-Agent') || 'Storage-Proxy/1.0',
      },
    });
    
    if (!response.ok) {
      console.error('Storage fetch failed:', response.status, response.statusText);
      return new Response('File not found', { 
        status: 404, 
        headers: corsHeaders 
      });
    }
    
    // Get the content type and other headers
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');
    const lastModified = response.headers.get('last-modified');
    const etag = response.headers.get('etag');
    
    // Create response headers
    const responseHeaders = {
      ...corsHeaders,
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    };
    
    if (contentLength) (responseHeaders as any)['Content-Length'] = contentLength;
    if (lastModified) (responseHeaders as any)['Last-Modified'] = lastModified;
    if (etag) (responseHeaders as any)['ETag'] = etag;
    
    // Return the proxied response
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
    
  } catch (error) {
    console.error('Storage proxy error:', error);
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
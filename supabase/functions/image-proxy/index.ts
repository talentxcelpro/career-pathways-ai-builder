import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    // Remove 'image-proxy' from path
    if (pathSegments[0] === 'image-proxy') {
      pathSegments.shift();
    }
    
    if (pathSegments.length === 0) {
      return new Response('Missing image path', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Parse query parameters for image optimization
    const searchParams = url.searchParams;
    const options: ImageOptions = {
      width: searchParams.get('w') ? parseInt(searchParams.get('w')!) : undefined,
      height: searchParams.get('h') ? parseInt(searchParams.get('h')!) : undefined,
      quality: searchParams.get('q') ? parseInt(searchParams.get('q')!) : 85,
      format: (searchParams.get('f') as 'webp' | 'jpeg' | 'png') || 'webp',
      fit: (searchParams.get('fit') as 'cover' | 'contain' | 'fill') || 'cover'
    };

    // Reconstruct the storage path
    const storagePath = pathSegments.join('/');
    console.log('Fetching image:', storagePath);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the original image from storage
    const { data, error } = await supabase.storage
      .from('post-media')
      .download(pathSegments.slice(1).join('/')); // Remove bucket name from path

    if (error) {
      console.error('Storage error:', error);
      return new Response('Image not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    if (!data) {
      return new Response('Image not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Convert blob to array buffer for processing
    const arrayBuffer = await data.arrayBuffer();
    const imageData = new Uint8Array(arrayBuffer);

    // Determine content type based on format
    let contentType = 'image/jpeg';
    if (options.format === 'webp') {
      contentType = 'image/webp';
    } else if (options.format === 'png') {
      contentType = 'image/png';
    }

    // For now, serve the original image
    // In production, you'd use an image processing library here
    // like Sharp.js via WASM or similar
    
    const responseHeaders = {
      ...corsHeaders,
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable', // 1 year cache
      'X-Image-Source': 'talentxcel-cdn',
      'X-Original-Path': storagePath,
      'Vary': 'Accept'
    };

    // Add SEO-friendly headers
    if (searchParams.get('alt')) {
      responseHeaders['X-Image-Alt'] = searchParams.get('alt')!;
    }

    return new Response(imageData, {
      status: 200,
      headers: responseHeaders
    });

  } catch (error) {
    console.error('Image proxy error:', error);
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
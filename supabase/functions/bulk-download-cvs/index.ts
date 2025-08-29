import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidateFiles } = await req.json();
    
    if (!candidateFiles || !Array.isArray(candidateFiles)) {
      return new Response(
        JSON.stringify({ error: 'candidateFiles array is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Processing bulk download for ${candidateFiles.length} files`);

    const downloadUrls = [];
    
    for (const file of candidateFiles) {
      try {
        if (file.resumeUrl?.includes('/storage/v1/object/public/')) {
          // Extract file path from public URL
          const urlParts = file.resumeUrl.split('/storage/v1/object/public/');
          if (urlParts[1]) {
            const [bucket, ...pathParts] = urlParts[1].split('/');
            const filePath = pathParts.join('/');
            
            const { data, error } = await supabase.storage
              .from(bucket)
              .createSignedUrl(filePath, 3600); // 1 hour expiry
            
            if (!error && data) {
              downloadUrls.push({
                name: file.name,
                url: data.signedUrl,
                filename: `${file.name.replace(/[^a-zA-Z0-9]/g, '_')}_CV.pdf`
              });
            }
          }
        } else if (file.resumeUrl) {
          // Direct URL
          downloadUrls.push({
            name: file.name,
            url: file.resumeUrl,
            filename: `${file.name.replace(/[^a-zA-Z0-9]/g, '_')}_CV.pdf`
          });
        }
      } catch (error) {
        console.error(`Error processing file for ${file.name}:`, error);
      }
    }

    console.log(`Generated ${downloadUrls.length} download URLs`);

    return new Response(
      JSON.stringify({ 
        success: true,
        files: downloadUrls,
        message: `Prepared ${downloadUrls.length} files for download`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Bulk download error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process bulk download',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
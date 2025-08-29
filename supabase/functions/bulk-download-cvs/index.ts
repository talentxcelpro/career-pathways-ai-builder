import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { candidateFiles } = await req.json();
    console.log('Bulk download request for:', candidateFiles.length, 'files');

    if (!candidateFiles || candidateFiles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No files provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Import JSZip for creating zip files
    const JSZip = (await import('https://esm.sh/jszip@3.10.1')).default;
    const zip = new JSZip();

    let addedFiles = 0;
    let errors: string[] = [];

    for (const candidateFile of candidateFiles) {
      try {
        const { name, resumeUrl } = candidateFile;
        
        if (!resumeUrl) {
          console.log(`Skipping ${name} - no resume URL`);
          continue;
        }

        let fileData: ArrayBuffer;
        let fileName = `${name.replace(/[^a-zA-Z0-9]/g, '_')}_CV`;

        if (resumeUrl.includes('supabase.co/storage')) {
          // Handle Supabase storage files
          const filePath = resumeUrl.split('/storage/v1/object/public/resumes/')[1];
          if (filePath) {
            const { data, error } = await supabase.storage
              .from('resumes')
              .download(filePath);
            
            if (error) {
              console.error(`Error downloading ${name}:`, error);
              errors.push(`Failed to download ${name}: ${error.message}`);
              continue;
            }
            
            fileData = await data.arrayBuffer();
            
            // Determine file extension from path or content type
            const ext = filePath.split('.').pop() || 'pdf';
            fileName += `.${ext}`;
          } else {
            errors.push(`Invalid file path for ${name}`);
            continue;
          }
        } else {
          // Handle external URLs
          try {
            const response = await fetch(resumeUrl);
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            fileData = await response.arrayBuffer();
            
            // Try to determine file type from headers
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('pdf')) {
              fileName += '.pdf';
            } else if (contentType?.includes('word')) {
              fileName += '.docx';
            } else {
              fileName += '.pdf'; // Default to PDF
            }
          } catch (fetchError) {
            console.error(`Error fetching ${name}:`, fetchError);
            errors.push(`Failed to fetch ${name}: ${fetchError.message}`);
            continue;
          }
        }

        // Add file to zip
        zip.file(fileName, fileData);
        addedFiles++;
        console.log(`Added ${fileName} to zip`);

      } catch (error) {
        console.error(`Error processing ${candidateFile.name}:`, error);
        errors.push(`Failed to process ${candidateFile.name}: ${error.message}`);
      }
    }

    if (addedFiles === 0) {
      return new Response(
        JSON.stringify({ error: 'No files could be processed', details: errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate zip file
    console.log(`Generating zip with ${addedFiles} files`);
    const zipBuffer = await zip.generateAsync({ type: 'uint8array' });

    console.log(`Generated zip file of size: ${zipBuffer.length} bytes`);

    return new Response(zipBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="candidates_cvs_${new Date().toISOString().split('T')[0]}.zip"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Bulk download error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
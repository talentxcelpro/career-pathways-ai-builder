import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Bucket mapping for organized file structure
const BUCKET_MAPPING: Record<string, string> = {
  'user-media': 'avatars',
  'post-media': 'post-media', 
  'documents': 'documents',
  'resumes': 'resumes',
  'company-assets': 'company-logos',
  'portfolio': 'portfolio',
  'tools-uploads': 'tool-uploads',
  'articles': 'article-images',
  'cover-letters': 'cover-letters',
  'preferences': 'preferences'
}

// MIME type detection
function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  
  const mimeTypes: Record<string, string> = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg', 
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',
    'ico': 'image/x-icon',
    
    // Videos
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogg': 'video/ogg',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
    'rtf': 'application/rtf',
    
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    
    // Archives
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    
    // Spreadsheets
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'csv': 'text/csv'
  }
  
  return mimeTypes[ext || ''] || 'application/octet-stream'
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    
    // Remove 'media-handler' from the path
    if (pathSegments[0] === 'media-handler') {
      pathSegments.shift()
    }
    
    // Extract bucket and file path
    if (pathSegments.length < 2) {
      return new Response('Invalid path format. Expected: /bucket/file-path', { 
        status: 400,
        headers: corsHeaders 
      })
    }
    
    const bucketKey = pathSegments[0]
    const filePath = pathSegments.slice(1).join('/')
    
    // Map to actual Supabase bucket
    const actualBucket = BUCKET_MAPPING[bucketKey] || bucketKey
    
    console.log(`Serving media: bucket=${actualBucket}, path=${filePath}`)
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Get file from storage
    const { data, error } = await supabase.storage
      .from(actualBucket)
      .download(filePath)
    
    if (error || !data) {
      console.error('File not found:', error)
      return new Response('File not found', { 
        status: 404,
        headers: corsHeaders 
      })
    }
    
    // Get file info for metadata
    const { data: fileInfo } = await supabase.storage
      .from(actualBucket)
      .list(filePath.split('/').slice(0, -1).join('/'), {
        search: filePath.split('/').pop()
      })
    
    const fileName = filePath.split('/').pop() || ''
    const mimeType = getMimeType(fileName)
    const fileSize = fileInfo?.[0]?.metadata?.size
    
    // Set appropriate headers
    const headers = {
      ...corsHeaders,
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${fileName}"`,
      'Cache-Control': 'public, max-age=31536000, immutable', // 1 year cache
      'Accept-Ranges': 'bytes'
    }
    
    if (fileSize) {
      headers['Content-Length'] = fileSize.toString()
    }
    
    // For images and PDFs, add additional headers for better preview support
    if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
      headers['X-Content-Type-Options'] = 'nosniff'
    }
    
    console.log(`Successfully serving ${fileName} (${mimeType})`)
    
    return new Response(data, { headers })
    
  } catch (error) {
    console.error('Media handler error:', error)
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    })
  }
})
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { courseId, userId, userName, courseName } = await req.json()

    if (!courseId || !userId || !userName || !courseName) {
      throw new Error('Missing required parameters')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify course completion
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('course_enrollments')
      .select('progress_percentage')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single()

    if (enrollmentError || !enrollment || enrollment.progress_percentage < 100) {
      throw new Error('Course not completed')
    }

    // Check if certificate already exists
    const { data: existingCert } = await supabase
      .from('course_certificates')
      .select('id')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single()

    if (existingCert) {
      throw new Error('Certificate already generated')
    }

    // Generate certificate ID
    const certificateId = crypto.randomUUID()
    const completionDate = new Date().toISOString()

    // Create certificate SVG
    const certificateSvg = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="800" height="600" fill="#f8fafc"/>
        
        <!-- Border -->
        <rect x="20" y="20" width="760" height="560" 
              fill="none" stroke="#1e40af" stroke-width="4" rx="10"/>
        
        <!-- Inner border -->
        <rect x="40" y="40" width="720" height="520" 
              fill="none" stroke="#3b82f6" stroke-width="2" rx="5"/>
        
        <!-- Header -->
        <text x="400" y="120" text-anchor="middle" 
              font-family="serif" font-size="48" font-weight="bold" fill="#1e40af">
          Certificate of Completion
        </text>
        
        <!-- Subtitle -->
        <text x="400" y="160" text-anchor="middle" 
              font-family="sans-serif" font-size="20" fill="#64748b">
          This certifies that
        </text>
        
        <!-- User name -->
        <text x="400" y="220" text-anchor="middle" 
              font-family="serif" font-size="36" font-weight="bold" fill="#0f172a">
          ${userName}
        </text>
        
        <!-- Course completion text -->
        <text x="400" y="280" text-anchor="middle" 
              font-family="sans-serif" font-size="20" fill="#64748b">
          has successfully completed the course
        </text>
        
        <!-- Course name -->
        <text x="400" y="340" text-anchor="middle" 
              font-family="serif" font-size="28" font-weight="bold" fill="#0f172a">
          ${courseName}
        </text>
        
        <!-- Date -->
        <text x="400" y="420" text-anchor="middle" 
              font-family="sans-serif" font-size="16" fill="#64748b">
          Completed on ${new Date(completionDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </text>
        
        <!-- Certificate ID -->
        <text x="400" y="500" text-anchor="middle" 
              font-family="monospace" font-size="12" fill="#94a3b8">
          Certificate ID: ${certificateId}
        </text>
        
        <!-- Decorative elements -->
        <circle cx="150" cy="150" r="30" fill="#fbbf24" opacity="0.3"/>
        <circle cx="650" cy="150" r="30" fill="#10b981" opacity="0.3"/>
        <circle cx="150" cy="450" r="25" fill="#ef4444" opacity="0.3"/>
        <circle cx="650" cy="450" r="25" fill="#8b5cf6" opacity="0.3"/>
        
        <!-- Seal -->
        <circle cx="400" cy="530" r="20" fill="none" stroke="#1e40af" stroke-width="2"/>
        <text x="400" y="535" text-anchor="middle" 
              font-family="serif" font-size="10" fill="#1e40af">CERTIFIED</text>
      </svg>
    `

    // Convert SVG to base64
    const svgBase64 = btoa(certificateSvg)

    // Store certificate in database
    const { data: certificate, error: certError } = await supabase
      .from('course_certificates')
      .insert({
        id: certificateId,
        course_id: courseId,
        user_id: userId,
        certificate_data: {
          userName,
          courseName,
          completionDate,
          certificateId,
          svgData: svgBase64
        },
        issued_at: completionDate
      })
      .select()
      .single()

    if (certError) {
      throw new Error('Failed to store certificate')
    }

    return new Response(
      JSON.stringify({
        success: true,
        certificate: {
          id: certificateId,
          svgData: svgBase64,
          downloadUrl: `data:image/svg+xml;base64,${svgBase64}`
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Certificate generation error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
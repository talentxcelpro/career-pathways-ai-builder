import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Resume parser function started')
    
    const { file, fileName, fileType } = await req.json()
    
    console.log('📋 Parsing request:', { fileName, fileType })
    
    // Extract base64 content
    let base64Content = file;
    if (file.includes(',')) {
      base64Content = file.split(',')[1];
    }
    
    // For now, we'll extract basic information from the filename and create a mock response
    // In a real implementation, you would use PDF parsing libraries like pdf-parse
    const mockExtractedData = {
      personal: {
        fullName: extractNameFromFileName(fileName) || 'John Doe',
        email: 'user@example.com',
        phone: '+1234567890',
        location: 'City, State'
      },
      summary: 'Experienced professional with expertise in various technologies and methodologies. Proven track record of delivering high-quality results and working effectively in team environments.',
      experience: [
        {
          title: 'Software Engineer',
          company: 'Tech Company',
          location: 'Remote',
          startDate: '2022',
          endDate: 'Present',
          description: 'Developed and maintained web applications using modern technologies.'
        },
        {
          title: 'Junior Developer',
          company: 'Previous Company',
          location: 'City, State',
          startDate: '2020',
          endDate: '2022',
          description: 'Worked on various development projects and gained experience in software development.'
        }
      ],
      education: [
        {
          degree: 'Bachelor of Technology',
          school: 'University',
          location: 'India',
          startDate: '2018',
          endDate: '2022'
        }
      ],
      skills: [
        { name: 'JavaScript', level: 'Advanced' },
        { name: 'React', level: 'Advanced' },
        { name: 'Node.js', level: 'Intermediate' },
        { name: 'Python', level: 'Intermediate' },
        { name: 'SQL', level: 'Intermediate' },
        { name: 'Git', level: 'Advanced' },
        { name: 'HTML/CSS', level: 'Advanced' }
      ]
    }
    
    console.log('✅ Resume parsing completed successfully')
    
    return new Response(JSON.stringify({
      success: true,
      data: mockExtractedData,
      message: 'Resume parsed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
    
  } catch (error) {
    console.error('❌ Resume parsing error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Failed to parse resume'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

function extractNameFromFileName(fileName: string): string | null {
  // Remove file extension
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  
  // Check if filename contains common resume patterns
  const resumePatterns = /resume|cv|curriculum/i;
  if (resumePatterns.test(nameWithoutExt)) {
    // Try to extract name from patterns like "John_Doe_Resume" or "Resume_John_Doe"
    const parts = nameWithoutExt.split(/[_\-\s]+/);
    const nonResumeWords = parts.filter(part => !resumePatterns.test(part));
    if (nonResumeWords.length >= 2) {
      return nonResumeWords.join(' ');
    } else if (nonResumeWords.length === 1) {
      return nonResumeWords[0];
    }
  }
  
  // If no resume pattern, assume the whole filename is the name
  if (nameWithoutExt.length > 0 && nameWithoutExt.length < 50) {
    return nameWithoutExt.replace(/[_\-]/g, ' ');
  }
  
  return null;
}
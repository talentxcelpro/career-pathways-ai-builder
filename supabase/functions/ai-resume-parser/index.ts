import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, fileName, fullExtraction } = await req.json();

    if (!text) {
      throw new Error('No resume text provided');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Parsing resume with AI:', fileName, 'Full extraction:', fullExtraction);

    const prompt = fullExtraction ? 
      `You are an expert resume parser. Extract ALL information from this resume text with maximum accuracy. 

      CRITICAL INSTRUCTIONS:
      - Extract EVERY piece of information exactly as written
      - Do NOT summarize, paraphrase, or modify any content
      - IGNORE system metadata like "Resume File:", "File Type:", etc.
      - Focus ONLY on actual resume content
      - If the person has a PhD, engineering background, or specialized skills, capture ALL details
      - Extract complete job descriptions, not just titles
      - Capture ALL skills, technologies, and achievements mentioned
      - Preserve technical terminology and specific domain knowledge

      SPECIAL ATTENTION TO:
      - Technical/Engineering backgrounds with specific domains (like microbial fuel cells, battery materials, etc.)
      - Research experience, publications, projects
      - Specialized skills and methodologies
      - Academic qualifications and certifications
      - Detailed work experience with specific technologies and achievements

      Structure:
      {
        "personalInfo": {
          "fullName": "exact name from resume (NOT filename)",
          "email": "exact email",
          "phone": "exact phone", 
          "location": "exact location/address",
          "summary": "complete professional summary word-for-word",
          "linkedin": "linkedin profile if mentioned",
          "website": "personal website if mentioned"
        },
        "experience": [
          {
            "title": "exact job title",
            "company": "exact company name",
            "location": "job location if mentioned",
            "startDate": "start date in MM/YYYY or YYYY format",
            "endDate": "end date or 'Present'",
            "description": "complete job description word-for-word",
            "achievements": ["list of bullet points exactly as written"],
            "technologies": ["technologies mentioned for this role"]
          }
        ],
        "education": [
          {
            "degree": "exact degree name",
            "school": "exact institution name",
            "location": "school location if mentioned",
            "startDate": "start date",
            "endDate": "graduation date",
            "gpa": "GPA if mentioned",
            "honors": "honors/distinctions if mentioned",
            "relevantCoursework": ["courses if listed"]
          }
        ],
        "skills": {
          "technical": ["exact technical skills listed"],
          "soft": ["soft skills mentioned"],
          "languages": ["languages spoken"],
          "tools": ["tools and software mentioned"]
        },
        "projects": [
          {
            "title": "exact project name",
            "description": "complete project description",
            "technologies": ["technologies used"],
            "startDate": "start date if mentioned",
            "endDate": "end date if mentioned",
            "url": "project URL if provided",
            "github": "GitHub link if provided"
          }
        ],
        "certifications": [
          {
            "name": "exact certification name",
            "issuer": "issuing organization",
            "date": "date obtained",
            "expiryDate": "expiry date if mentioned",
            "credentialId": "credential ID if provided",
            "url": "verification URL if provided"
          }
        ],
        "awards": [
          {
            "name": "exact award name",
            "issuer": "awarding organization",
            "date": "date received",
            "description": "award description if provided"
          }
        ],
        "volunteer": [
          {
            "organization": "organization name",
            "role": "volunteer role",
            "startDate": "start date",
            "endDate": "end date",
            "description": "description of volunteer work"
          }
        ]
      }

      Extract EXACTLY what is written. Do not invent or assume information.
      For missing information, use empty strings or arrays.
      Preserve original wording and phrasing.
      IGNORE file metadata lines that start with "Resume File:", "File Type:", "File Size:" etc.

      Resume text:
      ${text}

      Return only valid JSON, no additional text.`
      :
      `Extract structured information from this resume text and return it as JSON. Include:

      1. personalInfo: {fullName, email, phone, location, summary, linkedin, website}
      2. experience: [{title, company, location, startDate, endDate, description, achievements[], technologies[]}]
      3. education: [{degree, school, location, startDate, endDate, gpa, honors, relevantCoursework[]}]
      4. skills: {technical[], soft[], languages[], tools[]}
      5. projects: [{title, description, technologies[], startDate, endDate, url, github}]
      6. certifications: [{name, issuer, date, expiryDate, credentialId, url}]
      7. awards: [{name, issuer, date, description}]
      8. volunteer: [{organization, role, startDate, endDate, description}]

      Extract real data from the resume text. If information is missing, use empty strings or arrays.
      For dates, extract in YYYY or MM/YYYY format when possible.
      For skills, categorize appropriately into technical, soft skills, languages, and tools.

      Resume text:
      ${text}

      Return only valid JSON, no additional text or formatting.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert resume parser. Extract information accurately and return valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const extractedContent = data.choices[0].message.content;

    console.log('AI extracted content:', extractedContent);

    // Parse the JSON response
    let parsedData;
    try {
      parsedData = JSON.parse(extractedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Return default structure if parsing fails
      parsedData = {
        personalInfo: {
          fullName: '',
          email: '',
          phone: '',
          location: '',
          summary: 'Professional with experience in various technologies and methodologies.',
          linkedin: '',
          website: ''
        },
        experience: [],
        education: [],
        skills: {
          technical: [],
          soft: [],
          languages: [],
          tools: []
        },
        projects: [],
        certifications: [],
        awards: [],
        volunteer: []
      };
    }

    // Calculate ATS score based on completeness
    const atsScore = calculateATSScore(parsedData);

    return new Response(
      JSON.stringify({ 
        ...parsedData, 
        atsScore,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI resume parser:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function calculateATSScore(data: any): number {
  let score = 0;
  
  // Personal info completeness (20 points)
  if (data.personalInfo?.fullName) score += 5;
  if (data.personalInfo?.email) score += 5;
  if (data.personalInfo?.phone) score += 5;
  if (data.personalInfo?.summary) score += 5;
  
  // Experience (30 points)
  if (data.experience?.length > 0) {
    score += 15;
    if (data.experience.some((exp: any) => exp.achievements?.length > 0)) score += 8;
    if (data.experience.some((exp: any) => exp.technologies?.length > 0)) score += 7;
  }
  
  // Skills (20 points)
  if (data.skills?.technical?.length > 0) score += 10;
  if (data.skills?.soft?.length > 0) score += 5;
  if (data.skills?.tools?.length > 0) score += 5;
  
  // Education (15 points)
  if (data.education?.length > 0) score += 15;
  
  // Additional sections (15 points)
  if (data.projects?.length > 0) score += 5;
  if (data.certifications?.length > 0) score += 5;
  if (data.awards?.length > 0) score += 3;
  if (data.volunteer?.length > 0) score += 2;
  
  return Math.min(score, 100);
}
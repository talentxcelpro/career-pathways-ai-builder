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
    const { resumeData, jobTitle, companyName, jobDescription, tone = 'professional' } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build resume summary
    const resumeSummary = `
Name: ${resumeData.personalInfo?.fullName || 'N/A'}
Email: ${resumeData.personalInfo?.email || 'N/A'}
Phone: ${resumeData.personalInfo?.phone || 'N/A'}
Location: ${resumeData.personalInfo?.location || 'N/A'}

Summary: ${resumeData.summary || 'N/A'}

Experience:
${(resumeData.experience || []).map((exp: any) => `
- ${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})
  ${(exp.responsibilities || []).join('\n  ')}
`).join('\n')}

Education:
${(resumeData.education || []).map((edu: any) => `
- ${edu.degree} in ${edu.field} from ${edu.institution} (${edu.graduationDate})
`).join('\n')}

Skills: ${(resumeData.skills || []).join(', ')}
`;

    const systemPrompt = `You are a professional cover letter writer. Generate a compelling, personalized cover letter that:
1. Is written in a ${tone} tone
2. Highlights relevant experience and skills from the resume
3. Shows enthusiasm for the specific role and company
4. Is concise (300-400 words)
5. Includes proper formatting with paragraphs
6. Ends with a strong call to action

Format the cover letter with:
- Opening paragraph: Express interest in the role
- 2-3 body paragraphs: Match skills/experience to job requirements
- Closing paragraph: Express enthusiasm and request for interview

Do NOT include placeholder text like [Your Name], [Date], etc. Use the actual information from the resume.`;

    const userPrompt = `Generate a cover letter for:

Job Title: ${jobTitle}
Company: ${companyName}
${jobDescription ? `Job Description:\n${jobDescription}\n\n` : ''}
Resume Information:
${resumeSummary}`;

    console.log('Calling Lovable AI for cover letter generation...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_completion_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI credits exhausted. Please add credits to your workspace.');
      }
      throw new Error(`AI service error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const coverLetter = aiData.choices[0].message.content;

    console.log('Cover letter generated successfully');

    return new Response(
      JSON.stringify({ success: true, coverLetter }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Cover letter generation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate cover letter' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
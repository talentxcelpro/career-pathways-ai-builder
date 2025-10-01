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
    const { resumeData, jobTitle, companyName } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build resume summary
    const resumeSummary = `
Role: ${jobTitle}
${companyName ? `Company: ${companyName}` : ''}

Candidate Background:
- Name: ${resumeData.personalInfo?.fullName || 'N/A'}
- Summary: ${resumeData.summary || 'N/A'}

Experience:
${(resumeData.experience || []).slice(0, 3).map((exp: any) => `
- ${exp.title} at ${exp.company}
  Key responsibilities: ${(exp.responsibilities || []).slice(0, 3).join(', ')}
`).join('\n')}

Skills: ${(resumeData.skills || []).slice(0, 15).join(', ')}

Education: ${(resumeData.education || []).map((edu: any) => 
  `${edu.degree} in ${edu.field} from ${edu.institution}`
).join(', ')}
`;

    const systemPrompt = `You are an expert career coach and interview preparation specialist. Generate 8-10 common interview questions for this role along with detailed answers and tips.

For each question, provide:
1. The interview question
2. A suggested answer tailored to the candidate's background (2-3 paragraphs)
3. 3-4 practical tips for answering well

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Tell me about yourself",
      "suggestedAnswer": "Detailed 2-3 paragraph answer using their experience...",
      "tips": [
        "Keep it under 2 minutes",
        "Focus on relevant experience",
        "End with why you're interested in this role"
      ]
    }
  ]
}

Include a mix of:
- Behavioral questions (Tell me about a time...)
- Technical questions (based on skills)
- Situational questions (How would you handle...)
- Role-specific questions`;

    const userPrompt = `Generate interview questions and answers for:\n\n${resumeSummary}`;

    console.log('Calling Lovable AI for interview prep...');
    
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
        max_completion_tokens: 2000,
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
    const content = aiData.choices[0].message.content;
    
    // Parse JSON from response
    let parsedQuestions;
    try {
      // Try to extract JSON if wrapped in markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                       content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      parsedQuestions = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid response format from AI');
    }

    console.log('Interview questions generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        questions: parsedQuestions.questions 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Interview prep generation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate interview questions' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, jobTitle, companyName, interviewType, focusAreas, question, answer, category, session } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Interview Prep AI request:', { action, jobTitle, interviewType });

    switch (action) {
      case 'generate_questions':
        return await generateInterviewQuestions(jobTitle, companyName, interviewType, focusAreas);
      case 'evaluate_answer':
        return await evaluateAnswer(question, answer, jobTitle, category);
      case 'complete_session':
        return await completeSession(session);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in interview-prep-ai:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateInterviewQuestions(jobTitle: string, companyName: string, interviewType: string, focusAreas: string[]) {
  const prompt = `Generate 8-10 diverse interview questions for a ${jobTitle} position${companyName ? ` at ${companyName}` : ''}. 

Interview type: ${interviewType}
Focus areas: ${focusAreas.join(', ') || 'General'}

Include a mix of:
- 3 behavioral questions (STAR method)
- 3-4 technical/role-specific questions
- 2 situational questions
- 1-2 company/culture fit questions

For each question, provide:
- The question text
- Category (behavioral/technical/situational/company-specific)
- Difficulty level (easy/medium/hard)
- 2-3 helpful tips for answering
- A brief sample answer framework (not full answer)

Return as JSON array with this structure:
{
  "questions": [
    {
      "id": "q1",
      "question": "Tell me about a time when...",
      "category": "behavioral",
      "difficulty": "medium",
      "tips": ["Use STAR method", "Be specific", "Focus on your role"],
      "sampleAnswer": "Brief framework or key points to cover"
    }
  ]
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert interview coach and hiring manager. Generate diverse, relevant interview questions that reflect real-world interview scenarios.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);

  return new Response(JSON.stringify({ 
    success: true,
    questions: result.questions
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function evaluateAnswer(question: string, answer: string, jobTitle: string, category: string) {
  const prompt = `Evaluate this interview answer for a ${jobTitle} position:

Question: ${question}
Category: ${category}
Candidate's Answer: ${answer}

Provide:
1. A rating from 1-10 (10 being excellent)
2. Specific feedback on strengths and areas for improvement
3. Suggestions for enhancement

Consider:
- Relevance to the question
- Specific examples and details
- Communication clarity
- Professional tone
- For behavioral: STAR method usage
- For technical: accuracy and depth
- For situational: problem-solving approach

Return as JSON:
{
  "rating": 7,
  "feedback": "Detailed constructive feedback with specific suggestions",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Area 1", "Area 2"],
  "enhanced_answer_tips": "Suggestions for improving the answer"
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert interview coach providing constructive, actionable feedback to help candidates improve their interview performance.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);

  return new Response(JSON.stringify({ 
    success: true,
    rating: result.rating,
    feedback: result.feedback,
    strengths: result.strengths,
    improvements: result.improvements,
    enhancedAnswerTips: result.enhanced_answer_tips
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function completeSession(session: any) {
  const prompt = `Analyze this complete interview session and provide an overall assessment:

Job Title: ${session.jobTitle}
Company: ${session.companyName || 'N/A'}
Duration: ${session.duration} seconds
Questions: ${session.questions.length}
Answers: ${session.userAnswers.length}

Individual question ratings: ${session.userAnswers.map((a: any) => a.rating).join(', ')}

Provide:
1. Overall score (0-100)
2. Performance summary
3. Top 3 strengths
4. Top 3 areas for improvement
5. Specific next steps for preparation

Return as JSON:
{
  "overallScore": 75,
  "summary": "Overall performance assessment",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "improvements": ["Area 1", "Area 2", "Area 3"],
  "nextSteps": ["Action 1", "Action 2", "Action 3"],
  "readinessLevel": "Ready/Needs Practice/Needs Significant Work"
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert career coach providing comprehensive interview performance analysis and actionable improvement recommendations.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);

  return new Response(JSON.stringify({ 
    success: true,
    overallScore: result.overallScore,
    analysis: result
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
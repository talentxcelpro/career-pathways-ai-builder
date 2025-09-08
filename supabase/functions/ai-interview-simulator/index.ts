import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      userProfile, 
      jobDescription, 
      interviewType, 
      currentQuestion,
      conversationHistory,
      action 
    } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('🎯 AI Interview Simulator request:', { action, interviewType });

    let systemPrompt = '';
    let userPrompt = '';
    let model = 'gpt-4.1-2025-04-14';

    if (action === 'generate_questions') {
      systemPrompt = `You are an expert interview coach and hiring manager. Generate realistic, challenging interview questions based on the job description and interview type.

Guidelines:
- Create questions that are relevant to the specific role and industry
- Mix behavioral, technical, and situational questions appropriately
- Ensure questions test both hard and soft skills
- Include follow-up questions for deeper evaluation
- Make questions progressively challenging
- Consider the candidate's experience level

Return a JSON array of question objects with this structure:
{
  "questions": [
    {
      "id": "q1",
      "question": "Tell me about a time when...",
      "type": "behavioral|technical|situational",
      "difficulty": "easy|medium|hard",
      "focus_area": "leadership|problem-solving|technical|communication",
      "follow_ups": ["Follow up question 1", "Follow up question 2"]
    }
  ]
}`;

      userPrompt = `Job Description: ${jobDescription}
Interview Type: ${interviewType}
User Experience Level: ${userProfile.experienceLevel || 'mid-level'}
Target Role: ${userProfile.targetRole || 'Not specified'}

Generate 8-10 relevant interview questions.`;

    } else if (action === 'evaluate_answer') {
      systemPrompt = `You are an expert interview evaluator. Analyze the candidate's answer and provide detailed, constructive feedback.

Evaluation Criteria:
- Content quality and relevance
- Structure and clarity of response
- Use of specific examples and metrics
- Demonstration of required skills
- Communication effectiveness
- Areas for improvement

Scoring (1-10 scale):
- Technical accuracy (if applicable)
- Problem-solving approach
- Communication clarity
- Confidence and presence
- Overall impression

Provide actionable feedback that helps the candidate improve.

Return JSON with this structure:
{
  "overall_score": 7.5,
  "detailed_scores": {
    "content_quality": 8,
    "communication": 7,
    "technical_accuracy": 8,
    "confidence": 7
  },
  "strengths": ["Specific strength 1", "Specific strength 2"],
  "areas_for_improvement": ["Improvement area 1", "Improvement area 2"],
  "suggestions": ["Actionable suggestion 1", "Actionable suggestion 2"],
  "follow_up_question": "Based on your answer, let me ask you this...",
  "ideal_answer_elements": ["Element 1", "Element 2"]
}`;

      userPrompt = `Question: ${currentQuestion}
Candidate's Answer: ${conversationHistory[conversationHistory.length - 1]?.content || ''}
Job Context: ${jobDescription}
Interview Type: ${interviewType}

Evaluate this answer comprehensively.`;

    } else if (action === 'conduct_interview') {
      model = 'gpt-5-2025-08-07'; // Use latest model for dynamic interaction
      
      systemPrompt = `You are a professional interviewer conducting a ${interviewType} interview. You should:

- Ask one question at a time
- Listen carefully to answers
- Ask appropriate follow-up questions
- Maintain a professional but friendly tone
- Adapt questioning based on previous responses
- Provide brief acknowledgments before moving to next questions
- Keep the interview flowing naturally
- Challenge the candidate appropriately
- Show interest in their responses

Interview Context:
- Job: ${jobDescription}
- Interview Type: ${interviewType}
- Candidate Profile: ${JSON.stringify(userProfile)}

Conduct this as a realistic interview simulation. Be professional but conversational.`;

      userPrompt = conversationHistory.map((msg: any) => 
        `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`
      ).join('\n') + '\n\nContinue the interview naturally.';
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_completion_tokens: action === 'generate_questions' ? 1500 : 800,
        temperature: action === 'evaluate_answer' ? 0.3 : 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let result = data.choices[0].message.content;

    // Parse JSON responses for structured actions
    if (action === 'generate_questions' || action === 'evaluate_answer') {
      try {
        result = JSON.parse(result);
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        // Fallback for malformed JSON
        if (action === 'generate_questions') {
          result = {
            questions: [
              {
                id: 'q1',
                question: 'Tell me about yourself and why you\'re interested in this position.',
                type: 'behavioral',
                difficulty: 'easy',
                focus_area: 'communication',
                follow_ups: ['What specific skills make you a good fit?']
              }
            ]
          };
        } else {
          result = {
            overall_score: 6.0,
            detailed_scores: { content_quality: 6, communication: 6, confidence: 6 },
            strengths: ['Provided a response'],
            areas_for_improvement: ['Could be more specific'],
            suggestions: ['Try to include more concrete examples'],
            follow_up_question: 'Can you elaborate on that?'
          };
        }
      }
    }

    console.log('✅ AI Interview response generated successfully');

    return new Response(JSON.stringify({
      success: true,
      data: result,
      action,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in AI interview simulator:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      action: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
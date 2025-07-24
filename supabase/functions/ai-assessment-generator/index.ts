import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { skillArea, difficulty, industryFocus, questionCount = 10 } = await req.json();

    // Generate questions using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are an expert assessment creator. Generate ${questionCount} professional assessment questions for ${skillArea} at ${difficulty} level${industryFocus ? ` focused on ${industryFocus} industry` : ''}. Return valid JSON with this structure:
            {
              "title": "Assessment Title",
              "description": "Brief description",
              "questions": [
                {
                  "question_text": "Question text",
                  "question_type": "single_choice|multiple_choice|true_false",
                  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                  "correct_answer": "correct answer or array for multiple choice",
                  "explanation": "Why this is correct",
                  "difficulty_score": 0.5,
                  "points": 1
                }
              ]
            }`
          },
          {
            role: 'user',
            content: `Create a ${skillArea} assessment for ${difficulty} level${industryFocus ? ` in ${industryFocus}` : ''}.`
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      }),
    });

    const aiData = await response.json();
    const assessmentData = JSON.parse(aiData.choices[0].message.content);

    // Create assessment in database
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        title: assessmentData.title,
        description: assessmentData.description,
        assessment_type: 'technical',
        difficulty_level: difficulty,
        duration_minutes: questionCount * 2, // 2 minutes per question
        total_questions: questionCount,
        is_published: true,
        skills_tested: [skillArea],
        industry: industryFocus
      })
      .select()
      .single();

    if (assessmentError) throw assessmentError;

    // Insert questions
    const questions = assessmentData.questions.map((q: any, index: number) => ({
      assessment_id: assessment.id,
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      points: q.points || 1,
      difficulty_score: q.difficulty_score || 0.5,
      sort_order: index
    }));

    const { error: questionsError } = await supabase
      .from('assessment_questions')
      .insert(questions);

    if (questionsError) throw questionsError;

    return new Response(JSON.stringify({ 
      success: true, 
      assessment: { ...assessment, questions: assessmentData.questions }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
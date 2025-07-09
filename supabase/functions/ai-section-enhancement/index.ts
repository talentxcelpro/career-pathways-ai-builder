import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnhancementRequest {
  section: string;
  content: string;
  jobTitle?: string;
  industry?: string;
  experienceLevel?: string;
  targetRole?: string;
}

const sectionPrompts = {
  'personal_details': `
    Enhance this personal details/header section:
    - Ensure professional email address format
    - Include relevant social media profiles (LinkedIn, GitHub, portfolio)
    - Add professional title/headline that reflects target role
    - Include location (city, state) without full address for privacy
    - Format phone number consistently
    - Add portfolio or personal website if relevant
  `,
  'professional_summary': `
    Enhance this professional summary to make it more compelling and ATS-friendly. 
    Focus on:
    - Clear value proposition in the first sentence
    - Quantifiable achievements where possible
    - Industry-relevant keywords
    - Strong action verbs (Led, Managed, Developed, etc.)
    - 3-4 sentences maximum
    - Professional tone that matches target role
    - Unique selling points that differentiate the candidate
  `,
  'experience': `
    Enhance this work experience entry to make it more impactful:
    - Use strong action verbs (Led, Managed, Developed, Implemented, Achieved, etc.)
    - Include quantifiable results and metrics (percentages, dollar amounts, team sizes)
    - Focus on achievements rather than just responsibilities
    - Use bullet points for easy scanning
    - Include relevant keywords for ATS optimization
    - Show progression and growth
    - Demonstrate business impact and value created
  `,
  'skills': `
    Organize and enhance this skills section:
    - Categorize skills (Technical, Leadership, Communication, Industry-specific)
    - Prioritize most relevant skills for the target role
    - Use industry-standard terminology and current tech stack
    - Include proficiency levels where appropriate
    - Balance hard and soft skills strategically
    - Remove outdated or irrelevant skills
    - Group related skills logically
  `,
  'education': `
    Enhance this education section:
    - Include relevant coursework if recent graduate
    - Highlight academic achievements (GPA if 3.5+, honors, cum laude, etc.)
    - Add relevant academic projects or thesis topics
    - Include certifications and continuing education
    - Format consistently with dates and institutions
    - Add relevant extracurricular activities or leadership roles
  `,
  'projects': `
    Enhance this projects section:
    - Focus on projects most relevant to target role
    - Include technologies/tools used
    - Highlight your specific contributions and role
    - Quantify impact and results achieved
    - Provide brief but compelling descriptions
    - Include links to live projects, repositories, or demos
    - Show technical depth and problem-solving skills
  `,
  'certifications': `
    Organize and enhance this certifications section:
    - List most recent and relevant certifications first
    - Include certification dates and validity periods
    - Add certification numbers/IDs where applicable
    - Group by category if extensive (Technical, Professional, Industry-specific)
    - Include in-progress certifications with expected completion dates
    - Remove expired or outdated certifications
  `,
  'awards': `
    Enhance this awards and achievements section:
    - Highlight most prestigious and relevant awards
    - Include context and significance of each award
    - Quantify where possible (e.g., "top 5% of 1000 candidates")
    - Include year and awarding organization
    - Focus on professional, academic, and leadership achievements
    - Show progression and increasing recognition
  `,
  'languages': `
    Enhance this languages section:
    - Include proficiency levels (Native, Fluent, Conversational, Basic)
    - Use standardized frameworks (CEFR: A1-C2, ILR scale) where applicable
    - Prioritize languages relevant to target role/market
    - Include any language certifications (TOEFL, IELTS, etc.)
    - Mention professional or business proficiency where relevant
  `,
  'volunteer': `
    Enhance this volunteer work and leadership section:
    - Highlight leadership roles and responsibilities
    - Include quantifiable impact and achievements
    - Connect volunteer work to professional skills development
    - Show long-term commitment and dedication
    - Include relevant organizations, roles, and dates
    - Demonstrate transferable skills and values alignment
  `,
  'publications': `
    Enhance this publications and research section:
    - List in reverse chronological order
    - Include full citations in appropriate academic format
    - Highlight impact factor, citation counts, or h-index if impressive
    - Include conference presentations and speaking engagements
    - Add DOI links or URLs to publications where available
    - Categorize by type (journal articles, conference papers, etc.)
  `,
  'patents': `
    Enhance this patents section:
    - List patents with full titles and patent numbers
    - Include filing and grant dates
    - Specify patent type (utility, design, provisional)
    - Add brief description of innovation/invention
    - Include co-inventors if applicable
    - Mention commercial applications or licensing
  `,
  'speaking': `
    Enhance this speaking engagements section:
    - List prominent speaking engagements and conferences
    - Include event names, dates, and locations
    - Specify audience size and type where impressive
    - Add topics/titles of presentations
    - Include keynote speeches and panel discussions
    - Mention any recorded or published presentations
  `,
  'portfolio': `
    Enhance this portfolio links section:
    - Include professional portfolio website
    - Add relevant project repositories (GitHub, GitLab)
    - Include design portfolios (Behance, Dribbble) if applicable
    - Add professional social media profiles (LinkedIn)
    - Include personal blog or publications
    - Ensure all links are current and professional
  `,
  'career_objectives': `
    Enhance this career objectives section:
    - Define clear short-term and long-term goals
    - Align objectives with target role and industry
    - Show progression and ambition
    - Connect past experience to future goals
    - Demonstrate understanding of industry trends
    - Keep focused and realistic
  `,
  'references': `
    Enhance this references section:
    - Use "References available upon request" if space is limited
    - If including references, provide complete contact information
    - Include professional title and relationship to candidate
    - Ensure you have permission to list references
    - Include 3-5 professional references
    - Mix of supervisors, colleagues, and clients if possible
  `
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { section, content, jobTitle, industry, experienceLevel, targetRole }: EnhancementRequest = await req.json();

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const basePrompt = sectionPrompts[section as keyof typeof sectionPrompts] || `
      Enhance this resume section to make it more professional and impactful:
      - Use clear, concise language
      - Include relevant keywords for ATS optimization
      - Focus on achievements and measurable value
      - Ensure professional formatting and consistency
      - Remove weak language and filler words
    `;

    const contextualInfo = [
      jobTitle && `Target role: ${jobTitle}`,
      industry && `Industry: ${industry}`,
      experienceLevel && `Experience level: ${experienceLevel}`,
      targetRole && `Career goal: ${targetRole}`
    ].filter(Boolean).join('\n');

    const fullPrompt = `
${basePrompt}

${contextualInfo ? `Context:\n${contextualInfo}\n` : ''}

Original content:
${content}

Please provide enhanced content that is professional, ATS-friendly, and impactful. Focus on specific improvements while maintaining the authentic voice of the candidate.`;

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
            content: 'You are an expert resume writer and career coach with 15+ years of experience. You specialize in creating ATS-friendly, impactful resumes that get interviews. Provide enhanced content that is professional, keyword-optimized, and achievement-focused. Return only the enhanced content without additional commentary or explanations.'
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const enhancedContent = data.choices[0].message.content.trim();

    // Generate specific improvement suggestions
    const suggestionsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a resume expert. Provide 3-5 specific, actionable suggestions for further improving this resume section. Be concise, practical, and focus on measurable improvements.'
          },
          {
            role: 'user',
            content: `Review this enhanced resume section and provide specific suggestions for further improvement:\n\n${enhancedContent}`
          }
        ],
        temperature: 0.5,
        max_tokens: 300,
      }),
    });

    const suggestionsData = await suggestionsResponse.json();
    const suggestionsText = suggestionsData.choices[0].message.content.trim();
    
    // Parse suggestions into an array
    const suggestions = suggestionsText
      .split('\n')
      .filter(s => s.trim())
      .map(s => s.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '').trim())
      .filter(s => s.length > 10);

    return new Response(
      JSON.stringify({
        enhancedContent,
        suggestions,
        originalLength: content.length,
        enhancedLength: enhancedContent.length,
        improvementRatio: enhancedContent.length / content.length,
        section
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-section-enhancement function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
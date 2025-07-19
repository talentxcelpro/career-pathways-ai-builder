
-- First, let's populate the ai_admin_inputs table with standardized configurations for all AI features
INSERT INTO public.ai_admin_inputs (title, input_type, content, category, tool_slug, priority, is_active) VALUES

-- Resume Enhancement Tools
('Professional Resume Enhancement', 'system_prompt', '{"system_message": "You are an expert resume writer with 10+ years of experience. Transform resumes to be ATS-friendly, professional, and compelling while maintaining accuracy.", "temperature": 0.3, "max_tokens": 2000}', 'resume', 'resume-enhancer', 10, true),

('ATS Optimization Prompt', 'optimization_template', '{"template": "Optimize this resume for ATS systems by: 1) Using standard section headers, 2) Including relevant keywords from the job description, 3) Using bullet points for achievements, 4) Quantifying results with metrics", "focus_areas": ["keywords", "formatting", "metrics"]}', 'resume', 'ats-optimizer', 9, true),

('Resume Section Enhancement', 'section_template', '{"experience": "Transform each job description into 3-4 compelling bullet points that highlight achievements with quantified results", "skills": "Categorize skills by relevance and add proficiency levels", "summary": "Create a powerful 2-3 sentence professional summary"}', 'resume', 'section-enhancer', 8, true),

-- Job Matching System
('Job Matching Algorithm', 'matching_criteria', '{"skill_weight": 0.4, "experience_weight": 0.3, "education_weight": 0.2, "location_weight": 0.1, "minimum_match_threshold": 60}', 'jobs', 'job-matcher', 10, true),

('Job Recommendation Prompt', 'recommendation_template', '{"system_message": "Analyze user profile and suggest relevant job opportunities based on skills, experience, and career goals. Provide match percentage and reasoning.", "criteria": ["skills_alignment", "experience_level", "growth_potential", "company_culture"]}', 'jobs', 'job-recommender', 9, true),

-- Career Guidance
('Career Path Analysis', 'analysis_template', '{"template": "Analyze the user''s current position and suggest 3 potential career paths with required skills, timeline, and actionable steps", "focus_areas": ["skill_gaps", "market_trends", "growth_opportunities"]}', 'career', 'career-advisor', 10, true),

('Skill Gap Analysis', 'gap_analysis', '{"methodology": "Compare user skills with job requirements and industry standards to identify critical gaps", "output_format": "prioritized_list_with_learning_resources"}', 'career', 'skill-analyzer', 9, true),

-- Interview Preparation
('Interview Question Generator', 'question_template', '{"behavioral_questions": 15, "technical_questions": 10, "company_specific": 5, "difficulty_levels": ["entry", "mid", "senior"]}', 'interview', 'interview-prep', 8, true),

('Interview Answer Framework', 'answer_template', '{"framework": "STAR method (Situation, Task, Action, Result)", "guidelines": "Provide specific examples, quantify achievements, relate to job requirements"}', 'interview', 'answer-coach', 8, true),

-- Cover Letter Generation
('Cover Letter Template', 'letter_template', '{"structure": ["compelling_opening", "relevant_experience", "company_connection", "strong_closing"], "tone": "professional", "length": "3-4_paragraphs"}', 'cover_letter', 'cover-letter-generator', 7, true),

('Cover Letter Personalization', 'personalization_rules', '{"job_title_integration": true, "company_research": true, "skill_matching": true, "call_to_action": "interview_request"}', 'cover_letter', 'letter-personalizer', 7, true),

-- Content Generation
('LinkedIn Post Generator', 'content_template', '{"post_types": ["career_tips", "industry_insights", "personal_achievements", "thought_leadership"], "engagement_elements": ["questions", "hashtags", "call_to_action"]}', 'content', 'linkedin-generator', 6, true),

('Professional Bio Generator', 'bio_template', '{"lengths": ["short_50_words", "medium_100_words", "long_200_words"], "focus": ["expertise", "achievements", "personality", "call_to_action"]}', 'content', 'bio-generator', 6, true),

-- Salary Intelligence
('Salary Analysis Prompt', 'salary_analysis', '{"data_sources": ["market_data", "location_adjustment", "experience_multiplier", "skill_premium"], "output_format": "range_with_percentiles"}', 'salary', 'salary-analyzer', 8, true),

('Negotiation Guidance', 'negotiation_template', '{"preparation_steps": ["research", "value_proposition", "alternative_options"], "negotiation_tactics": ["anchoring", "value_stacking", "win_win_framing"]}', 'salary', 'negotiation-coach', 7, true);

-- Add some missing AI tools configurations
INSERT INTO public.ai_tools_config (tool_slug, tool_name, category, description, is_enabled, prompt_template, system_message, rate_limit_per_hour, rate_limit_per_day) VALUES
('ats-optimizer', 'ATS Resume Optimizer', 'resume', 'Optimize resumes for ATS compatibility and keyword matching', true, 'Optimize this resume for ATS systems focusing on keywords, formatting, and structure', 'You are an ATS optimization expert. Help users improve their resume compatibility with applicant tracking systems.', 15, 75),
('section-enhancer', 'Resume Section Enhancer', 'resume', 'Enhance specific resume sections with professional formatting', true, 'Enhance this resume section with professional language and quantified achievements', 'You are a resume writing expert specializing in section-specific improvements.', 20, 100),
('job-matcher', 'AI Job Matcher', 'jobs', 'Match users with relevant job opportunities using AI analysis', true, 'Analyze user profile and match with relevant job opportunities', 'You are a career matching specialist. Analyze user profiles and suggest best-fit job opportunities.', 10, 50),
('career-advisor', 'AI Career Advisor', 'career', 'Provide personalized career guidance and path recommendations', true, 'Provide career guidance based on user background and goals', 'You are a senior career counselor with expertise in multiple industries.', 8, 40),
('interview-prep', 'Interview Preparation Assistant', 'interview', 'Generate interview questions and provide preparation guidance', true, 'Generate relevant interview questions and provide preparation tips', 'You are an interview coach helping candidates prepare for job interviews.', 12, 60),
('salary-analyzer', 'Salary Intelligence Tool', 'salary', 'Analyze salary data and provide compensation insights', true, 'Analyze salary data and provide market insights', 'You are a compensation analyst providing salary market intelligence.', 10, 30)
ON CONFLICT (tool_slug) DO UPDATE SET
  tool_name = EXCLUDED.tool_name,
  description = EXCLUDED.description,
  updated_at = now();

-- Update ai_tools_config to match the new admin inputs
UPDATE public.ai_tools_config SET 
  prompt_template = ai_admin_inputs.content->>'template',
  system_message = ai_admin_inputs.content->>'system_message',
  updated_at = now()
FROM public.ai_admin_inputs 
WHERE ai_tools_config.tool_slug = ai_admin_inputs.tool_slug 
AND ai_admin_inputs.is_active = true;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_admin_inputs_tool_slug ON public.ai_admin_inputs(tool_slug);
CREATE INDEX IF NOT EXISTS idx_ai_admin_inputs_category ON public.ai_admin_inputs(category);
CREATE INDEX IF NOT EXISTS idx_ai_admin_inputs_active ON public.ai_admin_inputs(is_active) WHERE is_active = true;

-- Insert the missing AI tools that are expected by the testing system
INSERT INTO public.ai_tools_config (tool_slug, tool_name, category, description, is_enabled, prompt_template, system_message, rate_limit_per_hour, rate_limit_per_day, model_name) VALUES
('resume-enhancer', 'Resume Enhancement Tool', 'resume', 'Enhance resumes with professional formatting and content optimization', true, 'Enhance this resume to be more professional and ATS-friendly. Focus on quantifying achievements, using strong action verbs, and improving formatting for maximum impact.', 'You are an expert resume writer with 10+ years of experience. Transform resumes to be ATS-friendly, professional, and compelling while maintaining accuracy.', 15, 75, 'gpt-4.1-2025-04-14'),
('ats-optimizer', 'ATS Resume Optimizer', 'resume', 'Optimize resumes for ATS compatibility and keyword matching', true, 'Optimize this resume for ATS systems by: 1) Using standard section headers, 2) Including relevant keywords, 3) Using bullet points for achievements, 4) Quantifying results with metrics', 'You are an ATS optimization expert. Help users improve their resume compatibility with applicant tracking systems.', 15, 75, 'gpt-4.1-2025-04-14'),
('career-advisor', 'AI Career Advisor', 'career', 'Provide personalized career guidance and path recommendations', true, 'Analyze the user''s current position and suggest 3 potential career paths with required skills, timeline, and actionable steps', 'You are a senior career counselor with expertise in multiple industries. Provide thoughtful, actionable career guidance.', 8, 40, 'gpt-4.1-2025-04-14'),
('salary-analyzer', 'Salary Intelligence Tool', 'salary', 'Analyze salary data and provide compensation insights', true, 'Analyze salary data for this role and location, providing market insights including salary range, factors affecting compensation, and negotiation tips', 'You are a compensation analyst providing salary market intelligence. Use your knowledge to provide accurate, helpful salary insights.', 10, 30, 'gpt-4.1-2025-04-14')
ON CONFLICT (tool_slug) DO UPDATE SET
  tool_name = EXCLUDED.tool_name,
  description = EXCLUDED.description,
  prompt_template = EXCLUDED.prompt_template,
  system_message = EXCLUDED.system_message,
  model_name = EXCLUDED.model_name,
  is_enabled = EXCLUDED.is_enabled,
  updated_at = now();
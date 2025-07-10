-- Insert initial AI features based on your comprehensive mapping
INSERT INTO public.ai_features_status (module_name, feature_name, feature_key, enabled) VALUES
('Network', 'Smart Post Suggestions', 'smart_post_suggestions', true),
('Network', 'Comment Enhancer', 'comment_enhancer', true),
('Network', 'Intro Generator', 'intro_generator', true),
('Jobs', 'Job Description Summarizer', 'jd_summarizer', true),
('Jobs', 'Smart Apply', 'smart_apply', true),
('Jobs', 'MatchGPT', 'match_gpt', true),
('Jobs', 'Resume-JD Fit Scorer', 'resume_jd_scorer', true),
('Employer', 'JD Generator', 'jd_generator', true),
('Employer', 'Candidate Ranking', 'candidate_ranking', true),
('Employer', 'Interview Question Generator', 'interview_questions', true),
('Companies', 'Company Description Generator', 'company_description', true),
('Companies', 'AI Career Fit Checker', 'career_fit_checker', true),
('Resume Builder', 'Resume Enhancer', 'resume_enhancer', true),
('Resume Builder', 'Section Writer', 'section_writer', true),
('Resume Builder', 'ATS Scoring', 'ats_scoring', true),
('Tools', 'Cover Letter Generator', 'cover_letter_generator', true),
('Tools', 'Career Bio Generator', 'career_bio', true),
('Tools', 'Personality Insights', 'personality_insights', true),
('Learning', 'Learning Path Creator', 'learning_path_creator', true),
('Learning', 'Course Recommender', 'course_recommender', true),
('Career Map', '5-Year Roadmap Generator', 'career_roadmap', true),
('Career Map', 'Goal Breakdown', 'goal_breakdown', true)
ON CONFLICT (module_name, feature_key) DO NOTHING;

-- Insert comprehensive prompt templates for each AI feature
INSERT INTO public.ai_prompt_templates (module_name, feature_key, template_name, prompt_template, system_message, temperature, max_tokens) VALUES

-- Network Module Prompts
('Network', 'smart_post_suggestions', 'Professional Post Suggestions', 
'Based on the user profile and recent activity, suggest 3 engaging professional posts. Include variety: industry insights, career tips, and personal achievements. User profile: {profile_data}. Recent activity: {recent_activity}. Target audience: {target_audience}', 
'You are a professional networking AI that creates engaging LinkedIn-style posts. Focus on authenticity, value, and professional growth.', 0.7, 800),

('Network', 'comment_enhancer', 'Comment Enhancement', 
'Enhance this comment to be more professional, engaging, and valuable: "{original_comment}". Post context: {post_context}. Keep the user''s voice but make it more polished.', 
'You are a professional communication expert. Enhance comments while maintaining authenticity and the user''s personal voice.', 0.6, 300),

('Network', 'intro_generator', 'Professional Introduction Generator', 
'Create a compelling professional introduction for networking. User background: {user_background}. Target audience: {target_audience}. Purpose: {networking_purpose}', 
'You are a networking expert who creates memorable professional introductions that open doors and create meaningful connections.', 0.7, 400),

-- Jobs Module Prompts  
('Jobs', 'jd_summarizer', 'Job Description Summarizer', 
'Summarize this job description in bullet points. Highlight: key responsibilities, required skills, qualifications, and benefits. Job description: {job_description}', 
'You are an expert recruiter who creates clear, concise job summaries that help candidates quickly understand opportunities.', 0.3, 600),

('Jobs', 'smart_apply', 'Smart Application Assistant', 
'Generate a personalized application strategy for this job. Candidate profile: {candidate_profile}. Job description: {job_description}. Include: tailored cover letter points, skills to highlight, and application tips.', 
'You are a career coach specializing in job applications. Provide strategic, personalized advice that increases application success rates.', 0.7, 1000),

('Jobs', 'match_gpt', 'Advanced Job Matching', 
'Analyze compatibility between candidate and job. Provide match score (0-100), strengths, gaps, and improvement suggestions. Candidate: {candidate_data}. Job: {job_description}', 
'You are an expert talent acquisition specialist with deep knowledge of job-candidate fit analysis. Be thorough and actionable.', 0.4, 1200),

('Jobs', 'resume_jd_scorer', 'Resume-Job Fit Scorer', 
'Score how well this resume matches the job description (0-100). Provide detailed breakdown by category. Resume: {resume_text}. Job: {job_description}', 
'You are an ATS specialist and recruiter. Provide precise scoring with specific recommendations for improvement.', 0.3, 800),

-- Employer Module Prompts
('Employer', 'jd_generator', 'Job Description Generator', 
'Create a comprehensive job description. Role: {job_title}. Company: {company_info}. Requirements: {requirements}. Include: overview, responsibilities, qualifications, benefits.', 
'You are an expert HR professional who writes compelling job descriptions that attract top talent while being clear about expectations.', 0.6, 1000),

('Employer', 'candidate_ranking', 'AI Candidate Ranking', 
'Rank these candidates for the position. Job requirements: {job_requirements}. Candidates: {candidates_data}. Provide ranking with reasoning.', 
'You are a senior recruiter with expertise in candidate evaluation. Provide fair, unbiased assessments based on qualifications and fit.', 0.4, 1200),

('Employer', 'interview_questions', 'Interview Question Generator', 
'Generate interview questions for this role. Position: {job_title}. Level: {experience_level}. Key skills: {key_skills}. Include: technical, behavioral, and culture-fit questions.', 
'You are an expert interviewer who creates questions that reveal candidate potential, skills, and cultural fit.', 0.6, 800)

ON CONFLICT (module_name, feature_key, version) DO NOTHING;
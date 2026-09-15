// TalentXcel AI Payload Library
// Production-ready payload templates for all AI modules and tasks

export interface AIPayload {
  module: string;
  task: string;
  userId?: string;
  input: Record<string, any>;
  prompt: string;
}

export const talentXcelAIPayloads = {
  // Jobs Module
  jobs: {
    match_jobs: (userId: string, profile: any): AIPayload => ({
      module: 'jobs',
      task: 'match_jobs', 
      userId,
      input: { profile },
      prompt: 'Find and suggest jobs that match my profile and skills.'
    }),
    
    interview_prep: (userId: string, role: string): AIPayload => ({
      module: 'jobs',
      task: 'interview_prep',
      userId,
      input: { role },
      prompt: `Generate 5 common interview questions and detailed answers for ${role} position.`
    }),
    
    salary_analysis: (userId: string, role: string, location: string, experience: number): AIPayload => ({
      module: 'jobs',
      task: 'salary_analysis',
      userId,
      input: { role, location, experience },
      prompt: `Analyze salary expectations for ${role} in ${location} with ${experience} years experience.`
    })
  },

  // Resume Builder Module
  resume_builder: {
    optimize: (userId: string, resumeText: string): AIPayload => ({
      module: 'resume_builder',
      task: 'optimize',
      userId,
      input: { resumeText },
      prompt: 'Analyze my resume and suggest improvements for ATS optimization and better keywords.'
    }),
    
    generate_summary: (userId: string, role: string, experience: number, industry: string): AIPayload => ({
      module: 'resume_builder',
      task: 'generate_summary',
      userId,
      input: { role, experience, industry },
      prompt: `Create a professional resume summary for a ${role} with ${experience} years in ${industry}.`
    }),
    
    ats_scan: (userId: string, resumeText: string, jobDescription?: string): AIPayload => ({
      module: 'resume_builder',
      task: 'ats_scan',
      userId,
      input: { resumeText, jobDescription },
      prompt: 'Scan my resume for ATS compatibility and provide a detailed score with improvements.'
    }),
    
    tailor_resume: (userId: string, resumeText: string, jobDescription: string): AIPayload => ({
      module: 'resume_builder',
      task: 'tailor_resume',
      userId,
      input: { resumeText, jobDescription },
      prompt: 'Tailor my resume specifically for this job description to improve match score.'
    })
  },

  // Network Module
  network: {
    generate_post: (userId: string, topic: string, tone?: string): AIPayload => ({
      module: 'network',
      task: 'generate_post',
      userId,
      input: { topic, tone: tone || 'professional' },
      prompt: `Generate a professional LinkedIn post about: ${topic}.`
    }),
    
    suggest_connections: (userId: string, industry: string): AIPayload => ({
      module: 'network',
      task: 'suggest_connections',
      userId,
      input: { industry },
      prompt: `Suggest networking strategies and connection ideas for professionals in ${industry}.`
    }),
    
    message_templates: (userId: string, messageType: string, context: string): AIPayload => ({
      module: 'network',
      task: 'message_templates',
      userId,
      input: { messageType, context },
      prompt: `Create professional message templates for ${messageType} in context: ${context}.`
    })
  },

  // Career Map Module
  career_map: {
    generate_roadmap: (userId: string, currentRole: string, targetRole: string): AIPayload => ({
      module: 'career_map',
      task: 'generate_roadmap',
      userId,
      input: { currentRole, targetRole },
      prompt: `Create a detailed 5-year career roadmap from ${currentRole} to ${targetRole}.`
    }),
    
    skill_gap_analysis: (userId: string, currentSkills: string[], targetRole: string): AIPayload => ({
      module: 'career_map',
      task: 'skill_gap_analysis',
      userId,
      input: { currentSkills, targetRole },
      prompt: `Analyze skill gaps between my current skills and requirements for ${targetRole}.`
    }),
    
    growth_opportunities: (userId: string, currentRole: string, industry: string): AIPayload => ({
      module: 'career_map',
      task: 'growth_opportunities',
      userId,
      input: { currentRole, industry },
      prompt: `Identify growth opportunities and next steps for ${currentRole} in ${industry}.`
    })
  },

  // Learning Module
  learning: {
    recommend_courses: (userId: string, currentField: string, targetField: string): AIPayload => ({
      module: 'learning',
      task: 'recommend_courses',
      userId,
      input: { currentField, targetField },
      prompt: `Recommend learning paths and courses to transition from ${currentField} to ${targetField}.`
    }),
    
    skill_development: (userId: string, skills: string[], timeframe: string): AIPayload => ({
      module: 'learning',
      task: 'skill_development',
      userId,
      input: { skills, timeframe },
      prompt: `Create a learning plan to develop these skills: ${skills.join(', ')} within ${timeframe}.`
    }),
    
    certification_guide: (userId: string, field: string, level: string): AIPayload => ({
      module: 'learning',
      task: 'certification_guide',
      userId,
      input: { field, level },
      prompt: `Recommend certifications for ${field} at ${level} level with study guidance.`
    })
  },

  // Colleges Module
  colleges: {
    recommend_colleges: (userId: string, course: string, preferences: string): AIPayload => ({
      module: 'colleges',
      task: 'recommend_colleges',
      userId,
      input: { course, preferences },
      prompt: `Suggest colleges for ${course} with preferences: ${preferences}.`
    }),
    
    admission_guidance: (userId: string, targetCourse: string, background: string): AIPayload => ({
      module: 'colleges',
      task: 'admission_guidance',
      userId,
      input: { targetCourse, background },
      prompt: `Provide admission guidance for ${targetCourse} given background: ${background}.`
    }),
    
    scholarship_opportunities: (userId: string, field: string, criteria: string): AIPayload => ({
      module: 'colleges',
      task: 'scholarship_opportunities',
      userId,
      input: { field, criteria },
      prompt: `Find scholarship opportunities for ${field} with criteria: ${criteria}.`
    })
  },

  // Employer Module
  employer: {
    generate_jd: (userId: string, jobTitle: string, companyType: string): AIPayload => ({
      module: 'employer',
      task: 'generate_jd',
      userId,
      input: { jobTitle, companyType },
      prompt: `Create a comprehensive job description for ${jobTitle} at a ${companyType} company.`
    }),
    
    interview_questions: (userId: string, role: string, level: string): AIPayload => ({
      module: 'employer',
      task: 'interview_questions',
      userId,
      input: { role, level },
      prompt: `Generate interview questions for ${role} position at ${level} level.`
    }),
    
    hiring_strategy: (userId: string, role: string, timeline: string): AIPayload => ({
      module: 'employer',
      task: 'hiring_strategy',
      userId,
      input: { role, timeline },
      prompt: `Create a hiring strategy for ${role} within ${timeline} timeline.`
    })
  },

  // General Chat
  general: {
    chat: (userId: string, message: string): AIPayload => ({
      module: 'general',
      task: 'chat',
      userId,
      input: { message },
      prompt: message
    }),
    
    career_advice: (userId: string, situation: string): AIPayload => ({
      module: 'general',
      task: 'career_advice',
      userId,
      input: { situation },
      prompt: `Provide career advice for this situation: ${situation}.`
    })
  }
};

// Helper function to get payload by command
export const getPayloadByCommand = (command: string, userId: string, userProfile?: any): AIPayload | null => {
  const commandMap: Record<string, () => AIPayload> = {
    '/jobs': () => talentXcelAIPayloads.jobs.match_jobs(userId, userProfile),
    '/ats-scan': () => talentXcelAIPayloads.resume_builder.ats_scan(userId, ''),
    '/jd-tailor': () => talentXcelAIPayloads.resume_builder.tailor_resume(userId, '', ''),
    '/mock-interview': () => talentXcelAIPayloads.jobs.interview_prep(userId, userProfile?.title || 'Software Engineer'),
    '/generate-post': () => talentXcelAIPayloads.network.generate_post(userId, 'career update'),
    '/career-roadmap': () => talentXcelAIPayloads.career_map.generate_roadmap(userId, userProfile?.title || '', ''),
    '/salary-analysis': () => talentXcelAIPayloads.jobs.salary_analysis(userId, userProfile?.title || '', userProfile?.location || '', userProfile?.experience || 0),
    '/courses': () => talentXcelAIPayloads.learning.recommend_courses(userId, '', ''),
    '/colleges': () => talentXcelAIPayloads.colleges.recommend_colleges(userId, '', ''),
    '/job-description': () => talentXcelAIPayloads.employer.generate_jd(userId, '', 'startup')
  };

  return commandMap[command]?.() || null;
};
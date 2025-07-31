const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, max_tokens = 500, temperature = 0.7 } = await req.json()

    if (!prompt) {
      throw new Error('Prompt is required')
    }

    console.log('🤖 DeepSeek AI request:', { prompt: prompt.substring(0, 100) + '...' })

    // Mock AI response for job enhancement
    // In production, you would call DeepSeek API here
    const enhancedContent = {
      description: `Enhanced job description based on industry standards and best practices.
      
🎯 Role Overview:
${prompt.includes('Title:') ? prompt.split('Title:')[1].split('\n')[0].trim() : 'Professional Role'}

🏢 Company Culture:
Join a dynamic team that values innovation, collaboration, and professional growth.

💼 Key Responsibilities:
• Lead technical initiatives and drive project success
• Collaborate with cross-functional teams to deliver high-quality solutions
• Mentor junior developers and contribute to team knowledge sharing
• Implement best practices for code quality and system architecture
• Stay current with industry trends and emerging technologies

🎓 Required Qualifications:
• Bachelor's degree in Computer Science or related field
• 3+ years of relevant professional experience
• Strong problem-solving and analytical skills
• Excellent communication and teamwork abilities
• Experience with modern development frameworks and tools

💰 Compensation & Benefits:
• Competitive salary package
• Health insurance and wellness programs
• Professional development opportunities
• Flexible work arrangements
• Performance-based bonuses

🚀 Why Join Us:
• Work on cutting-edge projects with latest technologies
• Collaborative and inclusive work environment
• Opportunities for career advancement
• Work-life balance with flexible policies`,
      
      skills: extractSkillsFromPrompt(prompt),
      
      company_benefits: [
        'Health Insurance',
        'Flexible Working Hours',
        'Professional Development',
        'Performance Bonuses',
        'Work From Home'
      ],
      
      enhanced: true,
      confidence: 0.85
    }

    console.log('✅ AI enhancement completed')

    return new Response(
      JSON.stringify({
        success: true,
        content: JSON.stringify(enhancedContent),
        usage: {
          prompt_tokens: prompt.length / 4, // Rough estimation
          completion_tokens: JSON.stringify(enhancedContent).length / 4,
          total_tokens: (prompt.length + JSON.stringify(enhancedContent).length) / 4
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 DeepSeek AI error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

function extractSkillsFromPrompt(prompt: string): string[] {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
    'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'Git',
    'HTML', 'CSS', 'Vue.js', 'Angular', 'Express.js', 'Django',
    'Machine Learning', 'Data Science', 'DevOps', 'Agile', 'Scrum'
  ]
  
  const extractedSkills: string[] = []
  const lowerPrompt = prompt.toLowerCase()
  
  for (const skill of commonSkills) {
    if (lowerPrompt.includes(skill.toLowerCase())) {
      extractedSkills.push(skill)
    }
  }
  
  // Add some relevant skills based on job title patterns
  if (lowerPrompt.includes('frontend') || lowerPrompt.includes('ui')) {
    extractedSkills.push('HTML', 'CSS', 'JavaScript', 'React')
  }
  
  if (lowerPrompt.includes('backend') || lowerPrompt.includes('api')) {
    extractedSkills.push('Node.js', 'Database Design', 'REST APIs')
  }
  
  if (lowerPrompt.includes('full stack') || lowerPrompt.includes('fullstack')) {
    extractedSkills.push('JavaScript', 'React', 'Node.js', 'Database Design')
  }
  
  if (lowerPrompt.includes('devops')) {
    extractedSkills.push('AWS', 'Docker', 'Kubernetes', 'CI/CD')
  }
  
  // Remove duplicates and return
  return [...new Set(extractedSkills)]
}
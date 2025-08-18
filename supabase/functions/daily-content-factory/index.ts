// Removed XHR polyfill; Edge runtime provides fetch/XMLHttpRequest compatible APIs
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define content owners with their specializations
const contentOwners = [
  {
    name: 'Ananya',
    role: 'Community Manager',
    departments: ['Marketing', 'Community'],
    contentDomains: ['Community Posts', 'Engagement', 'Social Media', 'Networking'],
    tone: 'professional',
    frequency: 'weekly'
  },
  {
    name: 'Shelly Kappor',
    role: 'Customer Service Representative',
    departments: ['Customer Service', 'Support'],
    contentDomains: ['Customer Support', 'FAQ', 'Help Articles', 'User Guidance'],
    tone: 'professional',
    frequency: 'daily'
  },
  {
    name: 'Zoya',
    role: 'Upskilling Advisor',
    departments: ['Skills Development', 'Training'],
    contentDomains: ['Upskilling', 'Training Programs', 'Skill Assessment', 'Learning', 'Insights'],
    tone: 'professional',
    frequency: 'daily'
  },
  {
    name: 'Arjun',
    role: 'Application Support Specialist',
    departments: ['Technical Support', 'Applications'],
    contentDomains: ['Technical Help', 'Application Support', 'Troubleshooting'],
    tone: 'friendly',
    frequency: 'daily'
  },
  {
    name: 'Raj',
    role: 'Job Matching AI',
    departments: ['Job Matching', 'AI'],
    contentDomains: ['Job Matching', 'Career Recommendations', 'Job Alerts', 'Career Insights'],
    tone: 'professional',
    frequency: 'daily'
  },
  {
    name: 'Meera',
    role: 'Mentorship Coordinator',
    departments: ['Mentorship', 'Guidance'],
    contentDomains: ['Mentorship Programs', 'Guidance', 'Professional Development'],
    tone: 'professional',
    frequency: 'daily'
  },
  {
    name: 'Sana',
    role: 'Content Creator',
    departments: ['Marketing', 'Community'],
    contentDomains: ['Social Media', 'Engagement', 'Content Marketing'],
    tone: 'professional',
    frequency: 'daily'
  },
  {
    name: 'Ishaan',
    role: 'Career Coach Pro',
    departments: ['Career Development', 'Coaching'],
    contentDomains: ['Career Advice', 'Resume Tips', 'Interview Prep', 'SEO'],
    tone: 'professional',
    frequency: 'daily'
  },
  {
    name: 'Nikki',
    role: 'Learning Path Assistant',
    departments: ['Learning', 'Education'],
    contentDomains: ['Learning Paths', 'Course Recommendations', 'Skill Development'],
    tone: 'professional',
    frequency: 'daily'
  },
  {
    name: 'AD',
    role: 'Admin Bot',
    departments: ['Entire Platform'],
    contentDomains: ['Platform Updates', 'System Announcements', 'General Information', 'Email Campaigns'],
    tone: 'informative',
    frequency: 'as_needed'
  }
];

// Assign content owner based on category matching
function assignContentOwner(category: string): any {
  const owner = contentOwners.find(owner =>
    owner.contentDomains.some(domain => 
      domain.toLowerCase().includes(category.toLowerCase()) ||
      category.toLowerCase().includes(domain.toLowerCase())
    )
  );
  return owner || contentOwners.find(o => o.role === 'AD'); // Default to Admin Bot
}

interface ContentPlan {
  type: string;
  category: string;
  targetAudience: string;
  count: number;
  wordRange: [number, number];
  placement: string;
  style: string;
}

// Production-scale daily content volumes
const dailyContentPlan: ContentPlan[] = [
  { 
    type: 'Social Post', 
    category: 'Networking', 
    targetAudience: 'Professionals', 
    count: 150, 
    wordRange: [150, 200],
    placement: 'Network feed',
    style: 'Professional, concise, engaging'
  },
  { 
    type: 'Article', 
    category: 'Insights', 
    targetAudience: 'Professionals', 
    count: 25, 
    wordRange: [500, 700],
    placement: 'User walls',
    style: 'Detailed, informative, humanized'
  },
  { 
    type: 'SEO Page', 
    category: 'SEO', 
    targetAudience: 'Professionals', 
    count: 5, 
    wordRange: [500, 700],
    placement: 'Search optimized pages',
    style: 'Structured, keyword-rich, professional'
  },
  { 
    type: 'Newsletter', 
    category: 'Email Campaigns', 
    targetAudience: 'Professionals', 
    count: 2, 
    wordRange: [1000, 1200],
    placement: 'Email campaigns',
    style: 'Authoritative, persuasive, humanized'
  }
];

// Comprehensive topic bank for content generation
const topicCategories = {
  professional_development: [
    'AI-powered content automation and productivity tips',
    'Digital transformation strategies for modern businesses',
    'Effective networking in the digital era',
    'Leadership skills for the digital age',
    'Remote work best practices and productivity hacks',
    'Career advancement strategies in competitive markets',
    'Building personal brand in professional networks',
    'Workplace efficiency optimization techniques',
    'Professional skills development roadmap',
    'Industry insights and emerging trends'
  ],
  technology_trends: [
    'Artificial intelligence applications in business',
    'Automation tools for professional workflows',
    'Data-driven decision making strategies',
    'Cybersecurity best practices for professionals',
    'Cloud computing benefits for businesses',
    'Mobile-first strategies in professional environments',
    'Software tools for team collaboration',
    'Tech stack optimization for productivity',
    'Digital marketing automation strategies',
    'Innovation management in technology sectors'
  ],
  business_strategy: [
    'Content marketing strategies for professionals',
    'Customer relationship management optimization',
    'Strategic planning in uncertain markets',
    'Competitive analysis and market positioning',
    'Revenue growth strategies for businesses',
    'Operational efficiency improvement methods',
    'Change management in organizations',
    'Performance metrics and KPI tracking',
    'Resource allocation and budget optimization',
    'Market research and consumer insights'
  ],
  communication: [
    'Effective communication in professional settings',
    'Presentation skills for business professionals',
    'Written communication best practices',
    'Cross-cultural communication strategies',
    'Conflict resolution in workplace environments',
    'Team collaboration and coordination techniques',
    'Client relationship management strategies',
    'Public speaking and professional presence',
    'Email etiquette and professional correspondence',
    'Meeting facilitation and productivity'
  ]
};

function getRandomWordCount(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateTopics(contentType: string, count: number): Promise<string[]> {
  const allTopics = Object.values(topicCategories).flat();
  const topics: string[] = [];
  
  for (let i = 0; i < count; i++) {
    topics.push(allTopics[i % allTopics.length]);
  }
  
  return topics;
}

async function generateKeywords(topic: string, contentType: string): Promise<string[]> {
  const topicKeywords = topic.toLowerCase()
    .split(' ')
    .filter(word => word.length > 2)
    .slice(0, 5);
  
  const contentTypeKeywords = [
    contentType.toLowerCase().replace(' ', '_'),
    'professional',
    'business',
    'insights',
    'strategies',
    'tips',
    'guide'
  ];
  
  return [...new Set([...topicKeywords, ...contentTypeKeywords])];
}

function generateUniqueAngle(topic: string, variation: number, contentType: string): string {
  const angles = [
    'practical guide', 'comprehensive overview', 'expert insights', 'actionable strategies',
    'best practices', 'proven methods', 'step-by-step approach', 'industry analysis',
    'professional perspective', 'strategic framework', 'innovative solutions', 'expert tips'
  ];
  
  const angle = angles[variation % angles.length];
  return `${topic} - ${angle} for ${contentType.toLowerCase()}`;
}

async function generateAIContentWithOwner(params: {
  contentType: string;
  topic: string;
  targetAudience: string;
  length: number;
  category: string;
  keywords: string[];
  variation: number;
  uniqueAngle: string;
  owner: any;
}): Promise<any> {
  
  const { contentType, topic, targetAudience, length, category, keywords, variation, uniqueAngle, owner } = params;
  
  const systemPrompt = `You are ${owner.name}, a ${owner.role} at TalentXcel, creating ${contentType.toLowerCase()} content for professionals.

YOUR PERSONA:
- Name: ${owner.name}
- Role: ${owner.role}
- Departments: ${owner.departments.join(', ')}
- Specializations: ${owner.contentDomains.join(', ')}
- Writing tone: ${owner.tone}

CRITICAL REQUIREMENTS:
- Write EXACTLY ${length} words (count carefully)
- Use plain text only - NO emojis, symbols, or casual language
- ${owner.tone} and humanized tone throughout
- Target audience: ${targetAudience}
- Content type: ${contentType}
- Unique angle: ${uniqueAngle}
- Write from your expertise in: ${owner.contentDomains.join(', ')}

${contentType === 'SEO Page' ? 'Naturally incorporate these keywords for search optimization: ' + keywords.slice(0, 5).join(', ') : ''}
${contentType === 'Newsletter' ? 'Structure with clear sections, headlines, and actionable insights.' : ''}
${contentType === 'Article' ? 'Include practical examples, actionable advice, and professional insights.' : ''}
${contentType === 'Social Post' ? 'Make it engaging and discussion-worthy for professional networks.' : ''}

Topic: ${topic}
Variation #${variation + 1} - Ensure this variation is unique and offers a fresh perspective.

Write as ${owner.name} would, leveraging your role as ${owner.role} to provide specialized insights.`;

  const userPrompt = `As ${owner.name} (${owner.role}), create a ${contentType.toLowerCase()} about "${topic}" with the unique angle "${uniqueAngle}". 

The content must be exactly ${length} words and ready to publish directly on TalentXcel platform. Focus on providing actionable insights from your expertise in ${owner.contentDomains.join(', ')}.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: length * 2,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;
    const actualWordCount = generatedText.split(/\s+/).length;

    // Generate SEO-optimized title
    const titleResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: `Create a professional, SEO-friendly title for a ${contentType.toLowerCase()}. Maximum 60 characters. No emojis. Include main keyword naturally.`
          },
          { role: 'user', content: `Create title for: ${uniqueAngle}` }
        ],
        max_completion_tokens: 30
      }),
    });

    const titleData = await titleResponse.json();
    const title = titleData.choices[0].message.content.replace(/['"]/g, '').substring(0, 60);

    // Generate meta description
    const descriptionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: `Create a compelling meta description for a ${contentType.toLowerCase()}. Maximum 160 characters. Include main keyword and call to action.`
          },
          { role: 'user', content: `Meta description for: ${title}` }
        ],
        max_completion_tokens: 50
      }),
    });

    const descData = await descriptionResponse.json();
    const description = descData.choices[0].message.content.replace(/['"]/g, '').substring(0, 160);

    return {
      title,
      content: generatedText,
      contentType,
      topic,
      targetAudience,
      category,
      wordCount: actualWordCount,
      metadata: {
        title,
        description,
        keywords,
        uniqueAngle,
        variation: variation + 1,
        author: owner.name,
        authorRole: owner.role,
        authorTone: owner.tone,
        placement: dailyContentPlan.find(p => p.type === contentType)?.placement || '',
        style: dailyContentPlan.find(p => p.type === contentType)?.style || '',
        generatedAt: new Date().toISOString(),
        wordCountTarget: length,
        actualWordCount,
        seoOptimized: contentType === 'SEO Page',
        automated: true,
        daily_batch: new Date().toISOString().split('T')[0]
      }
    };

  } catch (error) {
    console.error(`Error generating ${contentType} content with owner ${owner.name} (variation ${variation + 1}):`, error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse JSON body safely
    let body: any = {};
    try {
      body = await req.json();
    } catch (_e) {
      body = {};
    }

    // Health check / simple test path
    if (body?.action === 'ping' || body?.action === 'health' || body?.name === 'Functions') {
      return new Response(
        JSON.stringify({ success: true, message: 'daily-content-factory online', echo: body }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log('🏭 Daily Content Factory: Starting production-scale generation cycle');
    console.log(`📊 Target: ${dailyContentPlan.reduce((sum, plan) => sum + plan.count, 0)} total pieces`);
    
    const generationResults = [];
    let totalGenerated = 0;
    let errors = 0;
    const startTime = Date.now();
    for (const plan of dailyContentPlan) {
      console.log(`📝 Generating ${plan.count} ${plan.type} pieces...`);
      
      const topics = await generateTopics(plan.type, plan.count);
      let contentTypeGenerated = 0;
      
      for (let i = 0; i < plan.count; i++) {
        try {
          const topic = topics[i % topics.length];
          const length = getRandomWordCount(plan.wordRange[0], plan.wordRange[1]);
          const keywords = await generateKeywords(topic, plan.type);
          const uniqueAngle = generateUniqueAngle(topic, i, plan.type);
          
          console.log(`   • ${plan.type} ${i + 1}/${plan.count}: ${uniqueAngle.substring(0, 50)}...`);
          
          // Assign content owner
          const owner = assignContentOwner(plan.category);
          
          const generatedContent = await generateAIContentWithOwner({
            contentType: plan.type,
            topic,
            targetAudience: plan.targetAudience,
            length,
            category: plan.category,
            keywords,
            variation: i,
            uniqueAngle,
            owner
          });
          
          // Insert into ai_content_library with owner information
          const { data, error } = await supabase
            .from('ai_content_library')
            .insert([
              {
                title: generatedContent.title,
                content: generatedContent.content,
                template_type: generatedContent.contentType.toLowerCase().replace(' ', '_'),
                category: generatedContent.category,
                tags: [
                  generatedContent.contentType.toLowerCase().replace(' ', '_'),
                  'daily_generation',
                  'automated',
                  'production_scale',
                  `variation_${i + 1}`,
                  `author_${owner.name.toLowerCase().replace(' ', '_')}`,
                  `tone_${owner.tone}`,
                  ...keywords.slice(0, 3)
                ],
                metadata: {
                  ...generatedContent.metadata,
                  author: owner.name,
                  authorRole: owner.role,
                  authorTone: owner.tone,
                  authorDepartments: owner.departments,
                  authorContentDomains: owner.contentDomains
                },
                quality_score: 92, // High score for production content with owner
                is_approved: true, // Auto-approve for automated content
                usage_count: 0
              }
            ]);

          if (error) {
            console.error(`❌ Database insertion error for ${plan.type} ${i + 1}:`, error);
            errors++;
          } else {
            contentTypeGenerated++;
            totalGenerated++;
            
            generationResults.push({
              type: plan.type,
              variation: i + 1,
              topic: topic,
              uniqueAngle: uniqueAngle,
              title: generatedContent.title,
              wordCount: generatedContent.wordCount,
              keywords: keywords,
              contentId: data?.[0]?.id
            });
          }

        } catch (error) {
          console.error(`❌ Error generating ${plan.type} ${i + 1}:`, error);
          errors++;
        }
      }
      
      console.log(`✅ ${plan.type}: ${contentTypeGenerated}/${plan.count} successfully generated`);
    }

    const totalTime = Date.now() - startTime;
    const avgTimePerPiece = Math.round(totalTime / totalGenerated);

    // Log the comprehensive generation cycle
    await supabase
      .from('ai_request_logs')
      .insert([
        {
          request_type: 'daily_content_factory_production',
          input_data: {
            content_plans: dailyContentPlan,
            total_target: dailyContentPlan.reduce((sum, plan) => sum + plan.count, 0),
            generation_date: new Date().toISOString().split('T')[0]
          },
          output_data: {
            total_generated: totalGenerated,
            errors: errors,
            success_rate: ((totalGenerated / (totalGenerated + errors)) * 100).toFixed(2),
            generation_time_ms: totalTime,
            avg_time_per_piece_ms: avgTimePerPiece,
            breakdown: dailyContentPlan.map(plan => ({
              type: plan.type,
              target: plan.count,
              generated: generationResults.filter(r => r.type === plan.type).length
            }))
          },
          success: errors < totalGenerated * 0.1, // Success if < 10% error rate
          tokens_used: totalGenerated * 1500, // Estimate
          cost_estimate: totalGenerated * 0.03 // Estimate
        }
      ]);

    console.log(`🎉 Daily Content Factory completed!`);
    console.log(`📊 Results: ${totalGenerated} pieces generated, ${errors} errors`);
    console.log(`⏱️ Total time: ${Math.round(totalTime / 1000)}s, Avg: ${avgTimePerPiece}ms per piece`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Production-scale daily content factory completed successfully',
        summary: {
          total_generated: totalGenerated,
          total_target: dailyContentPlan.reduce((sum, plan) => sum + plan.count, 0),
          errors: errors,
          success_rate: ((totalGenerated / (totalGenerated + errors)) * 100).toFixed(2) + '%',
          generation_time_seconds: Math.round(totalTime / 1000),
          avg_time_per_piece_ms: avgTimePerPiece,
          generation_date: new Date().toISOString().split('T')[0],
          content_breakdown: dailyContentPlan.map(plan => ({
            type: plan.type,
            target: plan.count,
            generated: generationResults.filter(r => r.type === plan.type).length,
            word_range: plan.wordRange
          }))
        },
        sample_results: generationResults.slice(0, 10) // Show first 10 as sample
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Daily Content Factory failed:', error);
    const message = error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
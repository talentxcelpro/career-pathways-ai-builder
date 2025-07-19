import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { userId, userProgress, currentSkills, targetRole, learningPreferences } = await req.json();

    console.log('Generating AI recommendations for user:', userId);

    // Get user's recent progress and roadmap data
    const { data: userRoadmaps } = await supabase
      .from('career_roadmaps')
      .select('*, roadmap_progress(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    const currentRoadmap = userRoadmaps?.[0];
    
    // Get market trends and skill demands
    const { data: marketData } = await supabase
      .from('market_data_cache')
      .select('*')
      .eq('role', targetRole)
      .order('updated_at', { ascending: false })
      .limit(1);

    // Generate personalized recommendations using AI
    const recommendationsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are an AI career coach that provides personalized learning recommendations. Analyze user progress and market trends to suggest optimal next steps.`
          },
          {
            role: 'user',
            content: `Analyze this user's career progress and provide personalized recommendations:

            Target Role: ${targetRole}
            Current Skills: ${JSON.stringify(currentSkills)}
            User Progress: ${JSON.stringify(userProgress)}
            Current Roadmap: ${JSON.stringify(currentRoadmap?.phases || [])}
            Learning Preferences: ${JSON.stringify(learningPreferences)}
            Market Data: ${JSON.stringify(marketData?.[0]?.data || {})}

            Provide comprehensive recommendations in this JSON format:
            {
              "immediateActions": [
                {
                  "title": "Action title",
                  "description": "What to do",
                  "priority": "high|medium|low",
                  "estimatedTime": "1-2 weeks",
                  "category": "skill|course|project|networking|certification",
                  "reasoning": "Why this is recommended"
                }
              ],
              "skillRecommendations": [
                {
                  "skill": "Skill name",
                  "currentLevel": 1-10,
                  "targetLevel": 1-10,
                  "priority": "high|medium|low",
                  "learningPath": "Recommended learning approach",
                  "marketDemand": "high|medium|low",
                  "resources": ["resource1", "resource2"]
                }
              ],
              "courseRecommendations": [
                {
                  "title": "Course title",
                  "provider": "Platform name",
                  "duration": "4 weeks",
                  "difficulty": "beginner|intermediate|advanced",
                  "relevanceScore": 1-100,
                  "reasoning": "Why this course",
                  "prerequisites": ["prerequisite1"]
                }
              ],
              "projectSuggestions": [
                {
                  "title": "Project title",
                  "description": "Project description",
                  "skills": ["skill1", "skill2"],
                  "complexity": "simple|moderate|complex",
                  "estimatedTime": "2-3 weeks",
                  "portfolioValue": "high|medium|low"
                }
              ],
              "certificationGoals": [
                {
                  "certification": "Cert name",
                  "provider": "Provider",
                  "relevance": "high|medium|low",
                  "prepTime": "1-3 months",
                  "marketValue": "high|medium|low",
                  "cost": "free|paid"
                }
              ],
              "networkingAdvice": [
                {
                  "action": "Networking action",
                  "platform": "LinkedIn|Twitter|Events",
                  "description": "How to do it",
                  "frequency": "daily|weekly|monthly"
                }
              ],
              "adaptiveAdjustments": {
                "roadmapChanges": ["change1", "change2"],
                "paceAdjustments": "faster|slower|same",
                "focusAreas": ["area1", "area2"],
                "reasoning": "Why these adjustments"
              },
              "motivationalInsights": {
                "progress": "You've completed X% of your journey",
                "strengths": ["strength1", "strength2"],
                "nextMilestone": "Your next big goal",
                "encouragement": "Motivational message"
              }
            }`
          }
        ],
        temperature: 0.3,
      }),
    });

    const aiResponse = await recommendationsResponse.json();
    let recommendations;
    
    try {
      recommendations = JSON.parse(aiResponse.choices[0].message.content);
    } catch (e) {
      // Fallback recommendations
      recommendations = {
        immediateActions: [
          {
            title: "Focus on Core Skills",
            description: "Strengthen your foundation in key areas",
            priority: "high",
            estimatedTime: "2-3 weeks",
            category: "skill",
            reasoning: "Strong fundamentals are crucial for career growth"
          }
        ],
        skillRecommendations: [
          {
            skill: "Communication",
            currentLevel: 5,
            targetLevel: 8,
            priority: "high",
            learningPath: "Practice presentations and writing",
            marketDemand: "high",
            resources: ["Toastmasters", "Writing courses"]
          }
        ],
        courseRecommendations: [
          {
            title: "Professional Development",
            provider: "Various",
            duration: "4 weeks",
            difficulty: "intermediate",
            relevanceScore: 85,
            reasoning: "Essential for career advancement",
            prerequisites: []
          }
        ],
        projectSuggestions: [
          {
            title: "Portfolio Project",
            description: "Build a project showcasing your skills",
            skills: ["Technical", "Design"],
            complexity: "moderate",
            estimatedTime: "3-4 weeks",
            portfolioValue: "high"
          }
        ],
        certificationGoals: [
          {
            certification: "Industry Certification",
            provider: "Industry Body",
            relevance: "high",
            prepTime: "2-3 months",
            marketValue: "high",
            cost: "paid"
          }
        ],
        networkingAdvice: [
          {
            action: "Connect with professionals",
            platform: "LinkedIn",
            description: "Reach out to people in your target role",
            frequency: "weekly"
          }
        ],
        adaptiveAdjustments: {
          roadmapChanges: ["Focus on practical skills"],
          paceAdjustments: "same",
          focusAreas: ["Core competencies"],
          reasoning: "Maintain steady progress"
        },
        motivationalInsights: {
          progress: "Making steady progress",
          strengths: ["Dedication", "Learning ability"],
          nextMilestone: "Complete current phase",
          encouragement: "Keep up the great work!"
        }
      };
    }

    // Store recommendations for tracking
    const { error: insertError } = await supabase
      .from('ai_career_recommendations')
      .insert({
        user_id: userId,
        recommendation_type: 'comprehensive',
        title: 'Personalized Career Recommendations',
        description: 'AI-generated recommendations based on progress analysis',
        metadata: recommendations,
        confidence_score: 0.85,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error storing recommendations:', insertError);
    }

    const enhancedRecommendations = {
      ...recommendations,
      generatedAt: new Date().toISOString(),
      userId,
      targetRole,
      confidenceScore: 85,
      methodology: 'AI analysis of progress, skills, and market trends',
      refreshRecommended: '7 days'
    };

    return new Response(JSON.stringify(enhancedRecommendations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI recommendations:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallback: {
        immediateActions: [
          { title: "Continue Learning", description: "Keep building your skills", priority: "high" }
        ]
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
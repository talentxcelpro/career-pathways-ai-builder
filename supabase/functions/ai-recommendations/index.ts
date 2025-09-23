import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, action, courseId, preferences } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    let result = {}

    switch (action) {
      case 'getRecommendations':
        // Get user's enrolled courses and preferences
        const { data: enrollments } = await supabase
          .from('course_enrollments')
          .select('course_id, courses(category, difficulty_level, skills_taught)')
          .eq('user_id', userId)

        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        // Extract user interests from enrollment history
        const userCategories = enrollments?.map(e => e.courses?.category).filter(Boolean) || []
        const userSkills = enrollments?.flatMap(e => e.courses?.skills_taught || []) || []
        
        // Get available courses excluding already enrolled ones
        const enrolledCourseIds = enrollments?.map(e => e.course_id) || []
        
        const { data: availableCourses } = await supabase
          .from('courses')
          .select('*')
          .eq('published', true)
          .not('id', 'in', `(${enrolledCourseIds.join(',')})`)
          .order('rating', { ascending: false })
          .limit(20)

        // Score courses based on user preferences
        const scoredCourses = availableCourses?.map(course => {
          let score = 0
          
          // Category match
          if (userCategories.includes(course.category)) score += 3
          
          // Skill overlap
          const skillOverlap = course.skills_taught?.filter(skill => 
            userSkills.some(userSkill => 
              userSkill.toLowerCase().includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(userSkill.toLowerCase())
            )
          ).length || 0
          score += skillOverlap * 2
          
          // Rating boost
          score += course.rating || 0
          
          // Popularity boost
          score += Math.log(course.enrolled_count + 1) * 0.1
          
          return { ...course, recommendationScore: score }
        }).sort((a, b) => b.recommendationScore - a.recommendationScore) || []

        result = {
          recommendations: scoredCourses.slice(0, 10),
          categories: [...new Set(userCategories)],
          skills: [...new Set(userSkills)]
        }
        break

      case 'trackInteraction':
        const { interactionType, metadata } = await req.json()
        
        // Log user interaction for future recommendations
        await supabase
          .from('user_learning_analytics')
          .insert({
            user_id: userId,
            course_id: courseId,
            interaction_type: interactionType,
            metadata: metadata || {},
            created_at: new Date().toISOString()
          })

        result = { success: true }
        break

      case 'updatePreferences':
        // Update user learning preferences
        await supabase
          .from('profiles')
          .update({
            learning_preferences: preferences,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        result = { success: true }
        break

      case 'getAnalytics':
        // Get user learning analytics
        const { data: analytics } = await supabase
          .from('user_learning_analytics')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(100)

        const { data: courseProgress } = await supabase
          .from('course_enrollments')
          .select(`
            *,
            courses (title, category, difficulty_level)
          `)
          .eq('user_id', userId)

        // Calculate learning insights
        const totalCourses = courseProgress?.length || 0
        const completedCourses = courseProgress?.filter(c => c.progress_percentage >= 100).length || 0
        const averageProgress = totalCourses > 0 
          ? courseProgress.reduce((acc, c) => acc + (c.progress_percentage || 0), 0) / totalCourses 
          : 0

        const learningStreak = calculateLearningStreak(analytics || [])
        const favoriteCategory = getMostFrequentCategory(courseProgress || [])

        result = {
          analytics: {
            totalCourses,
            completedCourses,
            averageProgress: Math.round(averageProgress),
            learningStreak,
            favoriteCategory,
            recentActivity: analytics?.slice(0, 10) || []
          }
        }
        break

      default:
        throw new Error('Invalid action')
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('AI Recommendations Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

function calculateLearningStreak(analytics: any[]): number {
  if (!analytics.length) return 0
  
  const dates = analytics
    .map(a => new Date(a.created_at).toDateString())
    .filter((date, index, arr) => arr.indexOf(date) === index)
    .sort()

  let streak = 0
  let currentDate = new Date()
  
  for (let i = 0; i < dates.length; i++) {
    const activityDate = new Date(dates[i])
    const daysDiff = Math.floor((currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === streak) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

function getMostFrequentCategory(courses: any[]): string {
  if (!courses.length) return 'None'
  
  const categoryCount: Record<string, number> = {}
  
  courses.forEach(course => {
    const category = course.courses?.category
    if (category) {
      categoryCount[category] = (categoryCount[category] || 0) + 1
    }
  })
  
  return Object.keys(categoryCount).reduce((a, b) => 
    categoryCount[a] > categoryCount[b] ? a : b
  ) || 'None'
}
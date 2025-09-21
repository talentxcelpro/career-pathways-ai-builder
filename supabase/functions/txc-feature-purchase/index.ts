import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FeaturePricing {
  [key: string]: {
    cost: number;
    description: string;
    expires?: number; // days
    category: string;
  }
}

// TXC pricing for various features
const FEATURE_PRICING: FeaturePricing = {
  // Resume & Templates
  'premium_resume_template': { cost: 500, description: 'Premium Resume Template', category: 'templates' },
  'ai_resume_optimization': { cost: 750, description: 'AI Resume Optimization', category: 'ai_tools' },
  'resume_ats_analysis': { cost: 300, description: 'ATS Compatibility Analysis', category: 'analysis' },
  
  // Job Applications
  'priority_job_application': { cost: 200, description: 'Priority Job Application', category: 'jobs' },
  'smart_apply_boost': { cost: 150, description: 'Smart Apply Boost', category: 'jobs' },
  'application_tracking': { cost: 100, description: 'Enhanced Application Tracking', expires: 30, category: 'jobs' },
  
  // AI Tools
  'ai_cover_letter': { cost: 400, description: 'AI-Generated Cover Letter', category: 'ai_tools' },
  'ai_interview_prep': { cost: 600, description: 'AI Interview Preparation', category: 'ai_tools' },
  'ai_skill_assessment': { cost: 800, description: 'AI Skill Assessment', category: 'assessment' },
  
  // Learning & Development
  'premium_course_access': { cost: 1000, description: 'Premium Course Access', expires: 30, category: 'learning' },
  'certification_exam': { cost: 1500, description: 'Industry Certification Exam', category: 'certification' },
  'mentor_session': { cost: 2000, description: '1-on-1 Mentor Session', category: 'mentoring' },
  
  // Profile & Networking
  'profile_boost': { cost: 300, description: 'Profile Visibility Boost', expires: 7, category: 'profile' },
  'linkedin_optimization': { cost: 500, description: 'LinkedIn Profile Optimization', category: 'profile' },
  'networking_premium': { cost: 800, description: 'Premium Networking Features', expires: 30, category: 'networking' },
  
  // Analytics & Insights
  'career_analytics': { cost: 600, description: 'Advanced Career Analytics', expires: 30, category: 'analytics' },
  'salary_insights': { cost: 400, description: 'Salary Benchmarking Insights', category: 'insights' },
  'market_analysis': { cost: 700, description: 'Job Market Analysis Report', category: 'insights' }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { featureId, customCost, customDescription } = await req.json()

    // Validate feature
    const feature = FEATURE_PRICING[featureId]
    if (!feature && !customCost) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid feature ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const cost = customCost || feature.cost
    const description = customDescription || feature.description
    const category = feature?.category || 'custom'

    console.log(`Processing TXC feature purchase: ${featureId} for ${cost} TXC`)

    // Get current balance
    const { data: balance, error: balanceError } = await supabaseClient
      .from('user_txc_balances')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (balanceError) {
      console.error('Error fetching balance:', balanceError)
      return new Response(
        JSON.stringify({ success: false, error: 'Unable to fetch balance' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    if (!balance || balance.balance < cost) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Insufficient TXC balance',
          required: cost,
          available: balance?.balance || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Check if user already owns this feature (for non-consumable items)
    if (feature && !['jobs', 'ai_tools'].includes(category)) {
      const { data: existingPurchase } = await supabaseClient
        .from('txc_purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('feature_id', featureId)
        .eq('status', 'active')
        .single()

      if (existingPurchase) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'You already own this feature',
            existingPurchase: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
    }

    // Start transaction
    const newBalance = balance.balance - cost

    // Update balance
    const { error: updateError } = await supabaseClient
      .from('user_txc_balances')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating balance:', updateError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update balance' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Record transaction
    const { error: txError } = await supabaseClient
      .from('txc_transactions')
      .insert({
        user_id: user.id,
        amount: -cost,
        transaction_type: 'purchase',
        description: `Purchased: ${description}`
      })

    if (txError) {
      console.error('Error recording transaction:', txError)
    }

    // Record purchase for tracking
    const expiresAt = feature?.expires ? 
      new Date(Date.now() + feature.expires * 24 * 60 * 60 * 1000).toISOString() : 
      null

    const { error: purchaseError } = await supabaseClient
      .from('txc_purchases')
      .insert({
        user_id: user.id,
        feature_type: category,
        feature_id: featureId,
        cost: cost,
        status: 'active',
        expires_at: expiresAt
      })

    if (purchaseError) {
      console.error('Error recording purchase:', purchaseError)
    }

    // Grant specific feature access based on type
    let additionalData = {}
    
    if (featureId === 'premium_course_access') {
      // Grant premium course access for 30 days
      additionalData = { 
        accessGranted: true, 
        accessType: 'premium_courses',
        expiresAt 
      }
    } else if (featureId === 'profile_boost') {
      // Boost profile visibility
      additionalData = { 
        boostActive: true, 
        boostType: 'visibility',
        multiplier: 5 
      }
    } else if (featureId.includes('ai_')) {
      // Grant AI feature credits
      additionalData = { 
        creditsGranted: 1, 
        featureType: featureId 
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully purchased ${description}`,
        newBalance: newBalance,
        featureId: featureId,
        cost: cost,
        expiresAt,
        ...additionalData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in txc-feature-purchase:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
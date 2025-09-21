import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    console.log('Fetching TXC bonus configuration...')

    // Get recent awards (last 50 transactions with positive amounts)
    const { data: recentTransactions } = await supabaseClient
      .from('txc_transactions')
      .select(`
        id,
        user_id,
        amount,
        description,
        transaction_type,
        created_at,
        profiles:user_id (
          full_name
        )
      `)
      .gt('amount', 0)
      .order('created_at', { ascending: false })
      .limit(50)

    const recentAwards = (recentTransactions || []).map(tx => {
      const description = tx.description || 'Token transaction'
      let type = 'general'
      
      if (description.toLowerCase().includes('welcome') || description.toLowerCase().includes('new user')) {
        type = 'welcome'
      } else if (description.toLowerCase().includes('streak') || description.toLowerCase().includes('daily')) {
        type = 'streak'  
      } else if (description.toLowerCase().includes('champion') || description.toLowerCase().includes('master') || description.toLowerCase().includes('bonus')) {
        type = 'achievement'
      }

      return {
        id: tx.id,
        user: (tx.profiles as any)?.full_name || 'Anonymous User',
        activity: description,
        amount: tx.amount,
        timestamp: tx.created_at,
        type
      }
    })

    // Default bonus settings (these would ideally come from a database table)
    const bonusSettings = [
      { id: '1', activity: 'Daily Login', amount: 75, enabled: true, cooldown: '24h' },
      { id: '2', activity: 'Create Post', amount: 150, enabled: true, cooldown: '1h' },
      { id: '3', activity: 'Connect with Someone', amount: 75, enabled: true, cooldown: '1h' },
      { id: '4', activity: 'Complete Profile', amount: 300, enabled: true, cooldown: '24h' },
      { id: '5', activity: 'Create Resume', amount: 225, enabled: true, cooldown: '4h' },
      { id: '6', activity: 'Apply to Job', amount: 90, enabled: true, cooldown: '1h' },
      { id: '7', activity: 'Give Recommendation', amount: 120, enabled: true, cooldown: '2h' },
      { id: '8', activity: 'Add Skills', amount: 60, enabled: true, cooldown: '3h' },
      { id: '9', activity: 'Complete Course', amount: 600, enabled: true, cooldown: '1h' },
      { id: '10', activity: 'Provide Feedback', amount: 45, enabled: true, cooldown: '1h' },
      { id: '11', activity: 'Social Activity Bonus', amount: 300, enabled: true, cooldown: '7d' },
      { id: '12', activity: 'Refer Friend', amount: 1000, enabled: true, cooldown: 'none' },
      { id: '13', activity: 'Like Post', amount: 20, enabled: true, cooldown: 'none' },
      { id: '14', activity: 'Comment on Post', amount: 20, enabled: true, cooldown: 'none' },
      { id: '15', activity: 'Post Article', amount: 500, enabled: true, cooldown: '4h' }
    ]

    const specialBonuses = [
      { id: '1', name: 'Welcome Bonus', amount: 500, description: 'One-time bonus for new users', type: 'welcome' },
      { id: '2', name: 'Weekly Streak', amount: 250, description: 'Login 7 days in a row', type: 'streak' },
      { id: '3', name: 'Profile Champion', amount: 400, description: '100% profile completion', type: 'achievement' },
      { id: '4', name: 'Networking Master', amount: 350, description: 'Connect with 50 professionals', type: 'achievement' },
      { id: '5', name: 'Job Hunter', amount: 300, description: 'Apply to 25 jobs', type: 'achievement' }
    ]

    return new Response(
      JSON.stringify({
        success: true,
        bonusSettings,
        specialBonuses,
        recentAwards
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in txc-bonus-config:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
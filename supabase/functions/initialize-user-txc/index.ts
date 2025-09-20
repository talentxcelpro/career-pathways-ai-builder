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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user } } = await supabaseClient.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    )

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    console.log(`Initializing TXC for user: ${user.id}`)

    // Check if user already has TXC balance
    const { data: existingBalance } = await supabaseClient
      .from('user_txc_balances')
      .select('balance, lifetime_earned')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingBalance) {
      console.log(`User ${user.id} already has TXC balance: ${existingBalance.balance}`)
      return new Response(
        JSON.stringify({
          success: true,
          balance: existingBalance.balance,
          lifetime_earned: existingBalance.lifetime_earned,
          message: 'User already initialized'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate initial bonus based on user activity
    let initialBonus = 500 // Base welcome bonus

    // Check user profile completion for bonus calculation
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('full_name, title, about, profile_picture_url, created_at')
      .eq('id', user.id)
      .maybeSingle()

    if (profile) {
      // Profile completion bonus
      if (profile.full_name) initialBonus += 100
      if (profile.title) initialBonus += 100
      if (profile.about) initialBonus += 150
      if (profile.profile_picture_url) initialBonus += 150

      // Early user bonus (users who joined early get more)
      const joinDate = new Date(profile.created_at)
      const now = new Date()
      const daysSinceJoin = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSinceJoin > 30) {
        initialBonus += 1000 // Loyalty bonus for existing users
      }
    }

    // Check for activity-based bonuses
    const { data: posts } = await supabaseClient
      .from('posts')
      .select('id')
      .eq('user_id', user.id)
      .limit(5)

    const { data: jobApps } = await supabaseClient
      .from('job_applications')
      .select('id')
      .eq('user_id', user.id)
      .limit(10)

    const { data: connections } = await supabaseClient
      .from('connections')
      .select('id')
      .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .eq('status', 'accepted')
      .limit(10)

    // Activity bonuses
    if (posts && posts.length > 0) {
      initialBonus += posts.length * 150 // 150 TXC per post
    }
    
    if (jobApps && jobApps.length > 0) {
      initialBonus += jobApps.length * 90 // 90 TXC per application
    }
    
    if (connections && connections.length > 0) {
      initialBonus += connections.length * 75 // 75 TXC per connection
    }

    // Cap the maximum initial bonus at 25000 for heavy users
    initialBonus = Math.min(initialBonus, 25000)

    console.log(`Calculated initial bonus for user ${user.id}: ${initialBonus} TXC`)

    // Create initial balance record
    const { error: balanceError } = await supabaseClient
      .from('user_txc_balances')
      .insert({
        user_id: user.id,
        balance: initialBonus,
        lifetime_earned: initialBonus
      })

    if (balanceError) {
      console.error('Error creating initial balance:', balanceError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create initial balance' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Create transaction record for the bonus
    const { error: txError } = await supabaseClient
      .from('txc_transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'bonus',
        amount: initialBonus,
        description: `Welcome to TalentXcel! Initial bonus based on your activity and profile completion.`
      })

    if (txError) {
      console.error('Error creating bonus transaction:', txError)
    }

    console.log(`Successfully initialized TXC for user ${user.id} with ${initialBonus} tokens`)

    return new Response(
      JSON.stringify({
        success: true,
        balance: initialBonus,
        lifetime_earned: initialBonus,
        message: `Welcome bonus of ${initialBonus} TXC awarded!`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in initialize-user-txc:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
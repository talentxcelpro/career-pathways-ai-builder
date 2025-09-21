import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      user_txc_balances: {
        Row: {
          user_id: string
          balance: number
          total_earned: number
          created_at: string
          updated_at: string
        }
      }
      txc_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          transaction_type: string
          description: string
          created_at: string
        }
      }
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient<Database>(
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

    console.log('Fetching TXC analytics...')

    // Get current date for time-based calculations
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Fetch analytics data in parallel
    const [
      { data: allBalances },
      { data: totalTransactions },
      { data: recentTransactions },
      { data: earningTransactions },
      { data: spendingTransactions },
      { data: activityStats }
    ] = await Promise.all([
      // All user balances
      supabaseClient.from('user_txc_balances').select('balance, total_earned'),
      
      // Total transactions ever
      supabaseClient.from('txc_transactions').select('amount, transaction_type'),
      
      // Recent transactions (last 7 days)
      supabaseClient.from('txc_transactions')
        .select('amount, transaction_type, created_at')
        .gte('created_at', sevenDaysAgo),
      
      // Earning transactions (last 30 days)
      supabaseClient.from('txc_transactions')
        .select('amount, description, created_at')
        .gte('created_at', thirtyDaysAgo)
        .gt('amount', 0),
      
      // Spending transactions (last 30 days)
      supabaseClient.from('txc_transactions')
        .select('amount, description, created_at')
        .gte('created_at', thirtyDaysAgo)
        .lt('amount', 0),
      
      // Activity-based transaction stats
      supabaseClient.from('txc_transactions')
        .select('amount, description, transaction_type, created_at')
        .gte('created_at', thirtyDaysAgo)
        .gt('amount', 0)
    ])

    // Calculate basic token economics
    const totalSupply = 50000000 // System-defined max supply
    const circulatingSupply = allBalances?.reduce((sum, b) => sum + (b.balance || 0), 0) || 0
    const totalEarned = allBalances?.reduce((sum, b) => sum + (b.total_earned || 0), 0) || 0
    
    const totalSpent = Math.abs(spendingTransactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0)
    const netCirculation = totalEarned - totalSpent
    const circulationRate = totalSupply > 0 ? (circulatingSupply / totalSupply) * 100 : 0
    
    const totalHolders = allBalances?.filter(b => (b.balance || 0) > 0).length || 0
    const avgBalance = totalHolders > 0 ? circulatingSupply / totalHolders : 0

    // Calculate daily/weekly activity
    const dailyTransactions = recentTransactions?.filter(tx => 
      tx.created_at.startsWith(today)
    ).length || 0
    
    const weeklyTransactions = recentTransactions?.length || 0
    const weeklyEarnings = recentTransactions?.filter(tx => (tx.amount || 0) > 0)
      .reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0

    // Activity breakdown
    const activityBreakdown = (activityStats || []).reduce((acc, tx) => {
      const description = tx.description || 'Other'
      let category = 'Other'
      
      if (description.toLowerCase().includes('login')) category = 'Daily Login'
      else if (description.toLowerCase().includes('post')) category = 'Post Creation'
      else if (description.toLowerCase().includes('job') || description.toLowerCase().includes('apply')) category = 'Job Applications'
      else if (description.toLowerCase().includes('connect')) category = 'Connections'
      else if (description.toLowerCase().includes('profile')) category = 'Profile Updates'
      else if (description.toLowerCase().includes('welcome') || description.toLowerCase().includes('bonus')) category = 'Bonuses & Rewards'
      
      if (!acc[category]) {
        acc[category] = { earnings: 0, count: 0 }
      }
      acc[category].earnings += tx.amount || 0
      acc[category].count += 1
      return acc
    }, {} as Record<string, { earnings: number, count: number }>)

    const topActivities = Object.entries(activityBreakdown)
      .map(([activity, data]) => ({
        activity,
        earnings: data.earnings,
        count: data.count,
        percentage: totalEarned > 0 ? Math.round((data.earnings / totalEarned) * 100) : 0
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5)

    // Calculate economic health (0-100 score)
    const economicHealth = Math.min(100, Math.round(
      (circulationRate * 0.3) + 
      (Math.min(dailyTransactions / 10, 50) * 0.3) + 
      (Math.min(totalHolders / 100, 20) * 0.4)
    ))

    // Generate chart data for last 7 days
    const chartData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayTransactions = recentTransactions?.filter(tx => 
        tx.created_at.startsWith(dateStr)
      ) || []
      
      const earnings = dayTransactions.filter(tx => (tx.amount || 0) > 0)
        .reduce((sum, tx) => sum + (tx.amount || 0), 0)
      
      const users = new Set(dayTransactions.map(tx => tx.created_at)).size // Approximation
      
      chartData.push({
        date: dateStr,
        earnings,
        users: Math.max(users, Math.floor(earnings / 100)) // Rough estimate
      })
    }

    // Distribution data for pie chart
    const distributionData = topActivities.slice(0, 4).map((activity, index) => ({
      name: activity.activity,
      value: activity.percentage,
      color: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'][index]
    }))

    // Calculate inflation rate (based on new tokens vs existing supply)
    const recentEarnings = earningTransactions?.filter(tx => 
      tx.created_at >= sevenDaysAgo
    ).reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0
    
    const weeklyInflationRate = circulatingSupply > 0 ? 
      ((recentEarnings / circulatingSupply) * 100 * 52) : 0 // Annualized

    return new Response(
      JSON.stringify({
        success: true,
        tokenEconomics: {
          totalEarned,
          totalSpent,
          circulationRate: Math.round(circulationRate * 100) / 100,
          averageBalance: Math.round(avgBalance),
          economicHealth,
          inflationRate: Math.round(weeklyInflationRate * 100) / 100
        },
        usageAnalytics: {
          dailyActiveEarners: Math.max(dailyTransactions, Math.floor(weeklyEarnings / 100)),
          weeklyGrowth: 12.5, // TODO: Calculate from historical data
          topActivities
        },
        earningsChart: chartData,
        distributionData,
        roiMetrics: [
          { 
            metric: 'User Engagement', 
            value: `+${Math.min(Math.round(weeklyTransactions / 10), 50)}%`, 
            trend: 'up', 
            description: 'Increased platform activity' 
          },
          { 
            metric: 'Token Circulation', 
            value: `${Math.round(circulationRate)}%`, 
            trend: circulationRate > 50 ? 'up' : 'down', 
            description: 'Active token usage' 
          },
          { 
            metric: 'Daily Transactions', 
            value: `${dailyTransactions}`, 
            trend: dailyTransactions > 10 ? 'up' : 'down', 
            description: 'Transaction volume today' 
          },
          { 
            metric: 'Total Holders', 
            value: `${totalHolders}`, 
            trend: 'up', 
            description: 'Users with TXC balance' 
          }
        ]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in txc-analytics:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
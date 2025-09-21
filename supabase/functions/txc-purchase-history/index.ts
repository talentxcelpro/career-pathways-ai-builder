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
      txc_purchases: {
        Row: {
          id: string
          user_id: string
          feature_type: string
          feature_id: string
          cost: number
          status: string
          expires_at: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          feature_type: string
          feature_id: string
          cost: number
          status?: string
          expires_at?: string | null
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

    console.log('Fetching TXC purchase history...')

    // Get user's purchase history with categorization
    const { data: purchases } = await supabaseClient
      .from('txc_purchases')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Get spending transactions for additional history
    const { data: spendingTx } = await supabaseClient
      .from('txc_transactions')
      .select('*')
      .eq('user_id', user.id)
      .lt('amount', 0)
      .order('created_at', { ascending: false })
      .limit(100)

    // Categorize transactions
    const categorizedTransactions = (spendingTx || []).map(tx => {
      const description = tx.description || ''
      let category = 'Other'
      let subcategory = 'General'
      
      if (description.toLowerCase().includes('subscription') || description.toLowerCase().includes('pro')) {
        category = 'Subscriptions'
        subcategory = description.includes('Monthly') ? 'Monthly Plan' : 'Annual Plan'
      } else if (description.toLowerCase().includes('resume') || description.toLowerCase().includes('template')) {
        category = 'Resume & Templates'
        subcategory = description.includes('premium') ? 'Premium Template' : 'Basic Template'
      } else if (description.toLowerCase().includes('job') || description.toLowerCase().includes('apply')) {
        category = 'Job Applications'
        subcategory = description.includes('priority') ? 'Priority Application' : 'Smart Apply'
      } else if (description.toLowerCase().includes('ai') || description.toLowerCase().includes('generation')) {
        category = 'AI Tools'
        subcategory = 'AI Generation'
      } else if (description.toLowerCase().includes('assessment') || description.toLowerCase().includes('skill')) {
        category = 'Skills & Assessment'
        subcategory = 'Skill Assessment'
      } else if (description.toLowerCase().includes('course') || description.toLowerCase().includes('learning')) {
        category = 'Learning & Development'
        subcategory = 'Course Access'
      }

      return {
        id: tx.id,
        amount: Math.abs(tx.amount),
        description: tx.description,
        category,
        subcategory,
        timestamp: tx.created_at,
        type: 'transaction'
      }
    })

    // Add purchase records
    const categorizedPurchases = (purchases || []).map(purchase => ({
      id: purchase.id,
      amount: purchase.cost,
      description: `${purchase.feature_type} - ${purchase.feature_id}`,
      category: purchase.feature_type,
      subcategory: purchase.feature_id,
      timestamp: purchase.created_at,
      type: 'purchase',
      status: purchase.status,
      expires_at: purchase.expires_at
    }))

    // Combine and sort all spending history
    const allSpending = [...categorizedTransactions, ...categorizedPurchases]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Calculate spending by category
    const spendingByCategory = allSpending.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = {
          total: 0,
          count: 0,
          subcategories: {}
        }
      }
      acc[item.category].total += item.amount
      acc[item.category].count += 1
      
      if (!acc[item.category].subcategories[item.subcategory]) {
        acc[item.category].subcategories[item.subcategory] = {
          total: 0,
          count: 0
        }
      }
      acc[item.category].subcategories[item.subcategory].total += item.amount
      acc[item.category].subcategories[item.subcategory].count += 1
      
      return acc
    }, {} as Record<string, any>)

    // Calculate monthly spending trends
    const monthlySpending = allSpending.reduce((acc, item) => {
      const month = item.timestamp.substring(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = 0
      }
      acc[month] += item.amount
      return acc
    }, {} as Record<string, number>)

    // Generate spending insights
    const totalSpent = allSpending.reduce((sum, item) => sum + item.amount, 0)
    const avgTransactionSize = allSpending.length > 0 ? totalSpent / allSpending.length : 0
    const mostSpentCategory = Object.entries(spendingByCategory)
      .sort(([,a], [,b]) => b.total - a.total)[0]

    return new Response(
      JSON.stringify({
        success: true,
        spendingHistory: allSpending.slice(0, 50), // Latest 50 transactions
        spendingByCategory,
        monthlySpending,
        insights: {
          totalSpent,
          avgTransactionSize: Math.round(avgTransactionSize),
          mostSpentCategory: mostSpentCategory ? {
            name: mostSpentCategory[0],
            amount: mostSpentCategory[1].total,
            percentage: Math.round((mostSpentCategory[1].total / totalSpent) * 100)
          } : null,
          transactionCount: allSpending.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in txc-purchase-history:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
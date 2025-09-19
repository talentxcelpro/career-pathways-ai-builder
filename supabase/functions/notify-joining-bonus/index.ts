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

    // Check if user is admin
    const { data: adminCheck } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .in('role', ['super_admin', 'admin'])
      .single()

    if (!adminCheck) {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin access required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    console.log('Notifying users about their 100 TXC joining bonus...')

    // Get all users who have received joining bonus but might not have been notified
    const { data: bonusRecipients, error: recipientsError } = await supabaseClient
      .from('token_transactions')
      .select(`
        to_user_id,
        created_at,
        profiles!inner(id, full_name, email)
      `)
      .eq('transaction_type', 'joining_bonus')
      .eq('amount', 100)
      .order('created_at', { ascending: false })

    if (recipientsError) {
      console.error('Error fetching bonus recipients:', recipientsError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch bonus recipients' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const notifications = []
    let successCount = 0
    let errorCount = 0

    for (const recipient of bonusRecipients || []) {
      try {
        // Check if notification already exists
        const { data: existingNotification } = await supabaseClient
          .from('notifications')
          .select('id')
          .eq('user_id', recipient.to_user_id)
          .eq('type', 'txc_bonus')
          .eq('title', 'Welcome Bonus Received! 🎉')
          .limit(1)
          .single()

        if (existingNotification) {
          console.log(`Notification already exists for user ${recipient.to_user_id}`)
          continue
        }

        // Create notification using the RPC function
        const { error: notificationError } = await supabaseClient.rpc('create_notification', {
          p_user_id: recipient.to_user_id,
          p_type: 'txc_bonus',
          p_title: 'Welcome Bonus Received! 🎉',
          p_message: `You've received 100 TXC as a welcome bonus for joining TalentXcel! Start earning more by completing activities in the mining center.`,
          p_module: 'txc',
          p_reference_id: recipient.to_user_id,
          p_action_url: '/txc/mining',
          p_priority: 'medium',
          p_icon: 'coins'
        })

        if (notificationError) {
          console.error(`Failed to create notification for user ${recipient.to_user_id}:`, notificationError)
          errorCount++
        } else {
          console.log(`Created joining bonus notification for user ${recipient.to_user_id}`)
          successCount++
          notifications.push({
            user_id: recipient.to_user_id,
            user_name: recipient.profiles?.full_name,
            user_email: recipient.profiles?.email,
            notified: true
          })
        }

      } catch (error) {
        console.error(`Error processing notification for user ${recipient.to_user_id}:`, error)
        errorCount++
        notifications.push({
          user_id: recipient.to_user_id,
          error: error.message
        })
      }
    }

    console.log(`Joining bonus notification process completed. Success: ${successCount}, Errors: ${errorCount}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully sent ${successCount} joining bonus notifications`,
        total_notifications: successCount,
        errors: errorCount,
        notifications: notifications
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in notify-joining-bonus:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
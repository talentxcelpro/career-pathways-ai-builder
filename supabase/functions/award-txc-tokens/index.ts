import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenAwardRequest {
  user_id: string;
  amount: number;
  description: string;
  source: string;
  metadata?: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { user_id, amount, description, source, metadata }: TokenAwardRequest = await req.json();

    console.log('Awarding TXC tokens:', { user_id, amount, description, source });

    // Validate inputs
    if (!user_id || !amount || !description || !source) {
      throw new Error('Missing required fields: user_id, amount, description, source');
    }

    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // Award tokens via gamification system
    const { data: txcData, error: txcError } = await supabase.rpc('award_txc_tokens', {
      p_user_id: user_id,
      p_amount: amount,
      p_description: description,
      p_source: source,
      p_metadata: metadata || {}
    });

    if (txcError) {
      console.error('Error awarding TXC tokens:', txcError);
      throw txcError;
    }

    // Create transaction record
    const { data: transactionData, error: transactionError } = await supabase
      .from('txc_transactions')
      .insert({
        user_id: user_id,
        amount: amount,
        transaction_type: 'earned',
        description: description,
        source: source,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating transaction record:', transactionError);
      // Don't throw here as the tokens were already awarded
    }

    // Send notification to user
    try {
      await supabase.rpc('create_notification', {
        p_user_id: user_id,
        p_type: 'txc_earned',
        p_title: 'TXC Tokens Earned! 🪙',
        p_message: `You've earned ${amount} TXC tokens! ${description}`,
        p_module: 'gamification',
        p_related_id: transactionData?.id,
        p_link: '/gamification',
        p_priority: 'medium',
        p_icon: 'coins'
      });
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't throw here as the main operation succeeded
    }

    const result = {
      success: true,
      message: 'TXC tokens awarded successfully',
      user_id,
      amount,
      description,
      source,
      transaction_id: transactionData?.id,
      new_balance: txcData?.new_balance || null
    };

    console.log('TXC tokens awarded successfully:', result);

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in award-txc-tokens function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
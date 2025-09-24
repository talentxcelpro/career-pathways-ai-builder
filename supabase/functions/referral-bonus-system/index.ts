import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Referral bonus configurations
const REFERRAL_BONUSES = {
  'signup': { referrer: 500, referee: 100 },
  'first_application': { referrer: 200, referee: 50 },
  'profile_completion': { referrer: 300, referee: 100 },
  'extension_install': { referrer: 150, referee: 50 },
  'premium_upgrade': { referrer: 1000, referee: 500 },
  'successful_hire': { referrer: 5000, referee: 2000 }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { sessionToken, action, referralData } = await req.json();

    // Validate session for most actions
    let userId = null;
    if (sessionToken) {
      const { data: session, error: sessionError } = await supabase
        .from('chrome_extension_sessions')
        .select('user_id')
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (sessionError || !session) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid session' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      userId = session.user_id;
    }

    switch (action) {
      case 'generate_referral_code': {
        if (!userId) {
          return new Response(
            JSON.stringify({ success: false, error: 'Authentication required' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Generate unique referral code
        const referralCode = generateReferralCode();

        // Store or update referral code
        const { data: referralRecord, error: referralError } = await supabase
          .from('referral_codes')
          .upsert({
            user_id: userId,
            referral_code: referralCode,
            is_active: true,
            created_at: new Date().toISOString(),
            total_uses: 0,
            total_earnings: 0
          })
          .select()
          .single();

        if (referralError) {
          console.error('Referral code generation error:', referralError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to generate referral code' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            referralCode: referralCode,
            referralUrl: `https://talentxcel.com/signup?ref=${referralCode}`,
            record: referralRecord
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'validate_referral': {
        const { referralCode } = referralData;

        if (!referralCode) {
          return new Response(
            JSON.stringify({ success: false, error: 'Referral code required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if referral code exists and is active
        const { data: referralRecord, error: validationError } = await supabase
          .from('referral_codes')
          .select('user_id, referral_code, is_active, profiles(full_name, profile_picture_url)')
          .eq('referral_code', referralCode)
          .eq('is_active', true)
          .single();

        if (validationError || !referralRecord) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid or inactive referral code' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            isValid: true,
            referrerId: referralRecord.user_id,
            referrerInfo: referralRecord.profiles
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'process_referral': {
        const { referralCode, refereeUserId, milestoneType, metadata = {} } = referralData;

        // Validate referral code
        const { data: referralRecord, error: validationError } = await supabase
          .from('referral_codes')
          .select('user_id')
          .eq('referral_code', referralCode)
          .eq('is_active', true)
          .single();

        if (validationError || !referralRecord) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid referral code' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const referrerId = referralRecord.user_id;

        // Prevent self-referral
        if (referrerId === refereeUserId) {
          return new Response(
            JSON.stringify({ success: false, error: 'Self-referral not allowed' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if this milestone was already processed
        const { data: existingBonus, error: bonusCheckError } = await supabase
          .from('referral_bonuses')
          .select('id')
          .eq('referrer_id', referrerId)
          .eq('referee_id', refereeUserId)
          .eq('milestone_type', milestoneType)
          .single();

        if (existingBonus) {
          return new Response(
            JSON.stringify({ success: false, error: 'Bonus already processed for this milestone' }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const bonusConfig = REFERRAL_BONUSES[milestoneType];
        if (!bonusConfig) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid milestone type' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Create referral bonus record
        const { data: bonus, error: bonusError } = await supabase
          .from('referral_bonuses')
          .insert({
            referrer_id: referrerId,
            referee_id: refereeUserId,
            referral_code: referralCode,
            milestone_type: milestoneType,
            referrer_bonus: bonusConfig.referrer,
            referee_bonus: bonusConfig.referee,
            metadata: metadata,
            processed_at: new Date().toISOString()
          })
          .select()
          .single();

        if (bonusError) {
          console.error('Referral bonus creation error:', bonusError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to process referral bonus' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Award TXC to referrer
        await supabase.functions.invoke('activity-reward-engine', {
          body: {
            activityData: {
              userId: referrerId,
              activityType: 'referral_bonus',
              customAmount: bonusConfig.referrer,
              metadata: { milestoneType, refereeId: refereeUserId }
            },
            action: 'process_activity'
          }
        });

        // Award TXC to referee
        await supabase.functions.invoke('activity-reward-engine', {
          body: {
            activityData: {
              userId: refereeUserId,
              activityType: 'referral_bonus',
              customAmount: bonusConfig.referee,
              metadata: { milestoneType, referrerId }
            },
            action: 'process_activity'
          }
        });

        // Update referral code statistics
        await supabase
          .from('referral_codes')
          .update({
            total_uses: supabase.raw('total_uses + 1'),
            total_earnings: supabase.raw(`total_earnings + ${bonusConfig.referrer}`)
          })
          .eq('referral_code', referralCode);

        return new Response(
          JSON.stringify({
            success: true,
            bonus,
            referrerBonus: bonusConfig.referrer,
            refereeBonus: bonusConfig.referee,
            milestoneType
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_referral_stats': {
        if (!userId) {
          return new Response(
            JSON.stringify({ success: false, error: 'Authentication required' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get user's referral code info
        const { data: referralCode, error: codeError } = await supabase
          .from('referral_codes')
          .select('*')
          .eq('user_id', userId)
          .single();

        // Get referral statistics
        const { data: referralStats, error: statsError } = await supabase
          .from('referral_bonuses')
          .select('milestone_type, referrer_bonus, processed_at, profiles!referee_id(full_name)')
          .eq('referrer_id', userId)
          .order('processed_at', { ascending: false });

        // Get pending referrals (people who signed up but haven't completed milestones)
        const { data: pendingReferrals, error: pendingError } = await supabase
          .from('user_referrals')
          .select('referred_user_id, created_at, profiles!referred_user_id(full_name, created_at)')
          .eq('referrer_id', userId)
          .eq('is_active', true);

        const stats = {
          referralCode: referralCode?.referral_code || null,
          totalReferrals: referralStats?.length || 0,
          totalEarnings: referralCode?.total_earnings || 0,
          recentBonuses: referralStats?.slice(0, 10) || [],
          pendingReferrals: pendingReferrals || [],
          milestoneBreakdown: calculateMilestoneBreakdown(referralStats || [])
        };

        return new Response(
          JSON.stringify({
            success: true,
            stats
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create_referral_link': {
        if (!userId) {
          return new Response(
            JSON.stringify({ success: false, error: 'Authentication required' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { platform, campaign, customMessage } = referralData;

        // Get or create referral code
        let { data: referralCode, error: codeError } = await supabase
          .from('referral_codes')
          .select('referral_code')
          .eq('user_id', userId)
          .single();

        if (codeError || !referralCode) {
          // Generate new referral code
          const newCode = generateReferralCode();
          const { data: newReferral, error: newError } = await supabase
            .from('referral_codes')
            .insert({
              user_id: userId,
              referral_code: newCode,
              is_active: true,
              created_at: new Date().toISOString()
            })
            .select('referral_code')
            .single();

          if (newError) {
            return new Response(
              JSON.stringify({ success: false, error: 'Failed to create referral code' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          referralCode = newReferral;
        }

        // Generate platform-specific sharing links
        const baseUrl = `https://talentxcel.com/signup?ref=${referralCode.referral_code}`;
        const sharingLinks = generateSharingLinks(baseUrl, platform, customMessage);

        return new Response(
          JSON.stringify({
            success: true,
            referralCode: referralCode.referral_code,
            baseUrl,
            sharingLinks
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Referral bonus system error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function calculateMilestoneBreakdown(bonuses: any[]): any {
  const breakdown = {};
  
  bonuses.forEach(bonus => {
    const milestone = bonus.milestone_type;
    if (!breakdown[milestone]) {
      breakdown[milestone] = { count: 0, totalEarnings: 0 };
    }
    breakdown[milestone].count++;
    breakdown[milestone].totalEarnings += bonus.referrer_bonus;
  });
  
  return breakdown;
}

function generateSharingLinks(baseUrl: string, platform: string, customMessage: string): any {
  const defaultMessage = customMessage || "Join TalentXcel and boost your career with AI-powered tools!";
  const encodedMessage = encodeURIComponent(defaultMessage);
  const encodedUrl = encodeURIComponent(baseUrl);

  const links = {
    email: `mailto:?subject=Join TalentXcel&body=${encodedMessage} ${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedMessage} ${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`,
    copy: baseUrl
  };

  return platform ? { [platform]: links[platform] } : links;
}
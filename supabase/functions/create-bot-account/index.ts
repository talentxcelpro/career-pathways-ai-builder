import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BotAccountRequest {
  botId: string;
  name: string;
  email: string;
  role: string;
  contentDomains: string[];
  profilePictureUrl?: string;
  bannerPictureUrl?: string;
  socialLinks: Record<string, string>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Creating bot account...');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { 
      botId, 
      name, 
      email, 
      role, 
      contentDomains, 
      profilePictureUrl, 
      bannerPictureUrl, 
      socialLinks 
    }: BotAccountRequest = await req.json();

    const username = name.toLowerCase().replace(/\s+/g, '');
    const botEmail = email || `${username}@talentxcel.in`;
    const defaultPassword = 'Talentxcel#123';

    console.log(`Creating account for bot: ${name} with email: ${botEmail}`);

    // Create auth user for the bot
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: botEmail,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        is_ai_bot: true
      }
    });

    let userId = botId;
    if (authData?.user && !authError) {
      userId = authData.user.id;
      console.log(`Auth user created with ID: ${userId}`);
    } else if (authError && authError.message.includes('already registered')) {
      console.log('User already exists, fetching existing user...');
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const botUser = existingUsers?.users?.find(u => u.email === botEmail);
      if (botUser) {
        userId = botUser.id;
        console.log(`Found existing user with ID: ${userId}`);
      }
    } else if (authError) {
      console.error('Auth creation error:', authError);
      throw authError;
    }

    // Create/update profile for the bot
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        full_name: name,
        email: botEmail,
        profile_picture_url: profilePictureUrl,
        banner_url: bannerPictureUrl,
        headline: role,
        about: `AI Bot specializing in ${contentDomains?.join(', ')}`,
        location: 'TalentXcel Network',
        social_links: socialLinks,
        is_profile_public: true,
        last_login_at: new Date().toISOString(),
        is_ai_bot: true
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    }

    console.log('Bot account and profile created successfully');

    return new Response(
      JSON.stringify({
        success: true,
        userId: userId,
        email: botEmail,
        password: defaultPassword,
        username: username,
        profileUrl: `https://talentxcel.in/profile/${username}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating bot account:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
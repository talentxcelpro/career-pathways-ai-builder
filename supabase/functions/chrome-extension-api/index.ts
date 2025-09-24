import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, ...payload } = await req.json();

    console.log('Chrome Extension API request:', { action, payload });

    switch (action) {
      case 'getUserProfile':
        return await getUserProfile(supabase, payload);
      
      case 'getTXCBalance':
        return await getTXCBalance(supabase, payload);
      
      case 'getProfileCompletion':
        return await getProfileCompletion(supabase, payload);
      
      case 'analyzeJobMatch':
        return await analyzeJobMatch(supabase, payload);
      
      case 'analyzeBrand':
        return await analyzeBrand(supabase, payload);
      
      case 'generateContentIdeas':
        return await generateContentIdeas(supabase, payload);
      
      case 'analyzeNetworkGrowth':
        return await analyzeNetworkGrowth(supabase, payload);
      
      case 'performSmartJobMatching':
        return await performSmartJobMatching(supabase, payload);
      
      case 'analyzeJobFit':
        return await analyzeJobFit(supabase, payload);
      
      case 'autoFillJobApplication':
        return await autoFillJobApplication(supabase, payload);
      
      case 'generateInviteLink':
        return await generateInviteLink(supabase, payload);

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Chrome Extension API error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getUserProfile(supabase: any, payload: any) {
  const authHeader = payload.authToken;
  if (!authHeader) {
    return new Response(
      JSON.stringify({ success: false, error: 'Authentication required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get user from auth token
  const { data: user, error: userError } = await supabase.auth.getUser(authHeader);
  if (userError || !user?.user) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid authentication' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.user.id)
    .single();

  if (profileError) {
    console.error('Profile fetch error:', profileError);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch profile' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: {
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: user.user.email || '',
        phone: profile.phone || '',
        coverLetter: profile.cover_letter || ''
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getTXCBalance(supabase: any, payload: any) {
  const { userId } = payload;
  if (!userId) {
    return new Response(
      JSON.stringify({ success: false, error: 'User ID required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data: balance, error } = await supabase
    .rpc('get_user_txc_balance', { user_id: userId });

  if (error) {
    console.error('TXC balance fetch error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch balance' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, data: { balance: balance || 0 } }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getProfileCompletion(supabase: any, payload: any) {
  const { userId } = payload;
  if (!userId) {
    return new Response(
      JSON.stringify({ success: false, error: 'User ID required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Calculate profile completion percentage
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Profile completion fetch error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch profile' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const completionFields = [
    'first_name', 'last_name', 'phone', 'bio', 'location',
    'experience_level', 'current_role', 'skills'
  ];

  const completedFields = completionFields.filter(field => 
    profile[field] && profile[field].toString().trim().length > 0
  );

  const completionPercentage = Math.round((completedFields.length / completionFields.length) * 100);

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: { 
        completionPercentage,
        missingFields: completionFields.filter(field => !completedFields.includes(field))
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function analyzeJobMatch(supabase: any, payload: any) {
  const { platform, jobData } = payload;
  
  // Mock job matching analysis - in production, this would use AI
  const mockMatchScore = Math.floor(Math.random() * 40) + 60; // 60-100% match

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: { 
        matchScore: mockMatchScore,
        reasons: [
          'Strong skill alignment',
          'Experience level matches',
          'Location preference fits'
        ]
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function analyzeBrand(supabase: any, payload: any) {
  const { platform, profileData } = payload;
  
  // Mock brand analysis
  const insights = [
    { icon: '📈', text: 'Your engagement rate is above average' },
    { icon: '🎯', text: 'Content aligns well with professional goals' },
    { icon: '👥', text: 'Growing network of industry professionals' }
  ];

  return new Response(
    JSON.stringify({ success: true, data: insights }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateContentIdeas(supabase: any, payload: any) {
  const { platform } = payload;
  
  const contentSuggestions = [
    {
      title: 'Share Industry Insights',
      description: 'Post about recent trends in your field',
      tags: ['industry', 'trends', 'insights']
    },
    {
      title: 'Professional Achievement',
      description: 'Highlight a recent project or accomplishment',
      tags: ['achievement', 'project', 'success']
    },
    {
      title: 'Learning Journey',
      description: 'Share what you\'re currently learning',
      tags: ['learning', 'growth', 'skills']
    }
  ];

  return new Response(
    JSON.stringify({ success: true, data: contentSuggestions }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function analyzeNetworkGrowth(supabase: any, payload: any) {
  const { platform } = payload;
  
  const insights = {
    growthRate: Math.floor(Math.random() * 20) + 5, // 5-25%
    engagementRate: Math.floor(Math.random() * 15) + 3, // 3-18%
    recommendations: [
      'Post consistently to increase visibility',
      'Engage with industry leaders\' content',
      'Share valuable insights regularly'
    ]
  };

  return new Response(
    JSON.stringify({ success: true, data: insights }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function performSmartJobMatching(supabase: any, payload: any) {
  const { platform, url } = payload;
  
  // Mock smart matching results
  const matches = [
    {
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      matchScore: 95,
      reasons: ['Perfect skill match', 'Salary range fits', 'Remote option available']
    },
    {
      title: 'Product Manager',
      company: 'Innovation Inc',
      matchScore: 88,
      reasons: ['Leadership experience valued', 'Industry alignment', 'Growth opportunity']
    }
  ];

  return new Response(
    JSON.stringify({ success: true, data: matches }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function analyzeJobFit(supabase: any, payload: any) {
  const { platform, jobData } = payload;
  
  const analysis = {
    overallScore: Math.floor(Math.random() * 30) + 70, // 70-100%
    skillsMatch: [
      { name: 'JavaScript', match: true },
      { name: 'React', match: true },
      { name: 'Node.js', match: false },
      { name: 'Python', match: true }
    ],
    recommendations: [
      'Consider learning Node.js to strengthen your backend skills',
      'Highlight your React experience in your application',
      'Emphasize your JavaScript expertise'
    ]
  };

  return new Response(
    JSON.stringify({ success: true, data: analysis }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function autoFillJobApplication(supabase: any, payload: any) {
  const { platform } = payload;
  
  // Mock user profile data for auto-fill
  const profileData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    coverLetter: 'I am excited to apply for this position...'
  };

  return new Response(
    JSON.stringify({ success: true, data: profileData }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateInviteLink(supabase: any, payload: any) {
  const { method } = payload;
  
  // Generate unique invite link
  const inviteCode = Math.random().toString(36).substring(2, 15);
  const inviteLink = `https://talentxcel.in/invite/${inviteCode}`;

  return new Response(
    JSON.stringify({ success: true, data: { link: inviteLink } }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
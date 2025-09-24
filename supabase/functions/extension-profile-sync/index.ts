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

    const { sessionToken, action, platform, profileData, syncDirection = 'import' } = await req.json();

    // Validate session
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

    const userId = session.user_id;

    switch (action) {
      case 'sync_profile': {
        // Get current TalentXcel profile
        const { data: currentProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) {
          return new Response(
            JSON.stringify({ success: false, error: 'Profile not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        let updateData: any = {};
        let syncLog: any = {
          user_id: userId,
          platform,
          sync_direction: syncDirection,
          synced_fields: [],
          created_at: new Date().toISOString()
        };

        if (syncDirection === 'import') {
          // Import from external platform to TalentXcel
          const fieldMapping = {
            'linkedin': {
              'full_name': 'name',
              'title': 'headline',
              'about': 'summary',
              'location': 'location',
              'linkedin_url': 'profileUrl',
              'profile_picture_url': 'profilePicture',
              'skills': 'skills',
              'experience': 'experience',
              'education': 'education'
            },
            'naukri': {
              'full_name': 'candidateName',
              'title': 'currentDesignation',
              'about': 'profileSummary',
              'location': 'currentLocation',
              'skills': 'keySkills',
              'experience': 'workExperience'
            },
            'twitter': {
              'full_name': 'displayName',
              'about': 'bio',
              'location': 'location',
              'profile_picture_url': 'profileImageUrl'
            }
          };

          const mapping = fieldMapping[platform];
          if (mapping) {
            for (const [txField, extField] of Object.entries(mapping)) {
              if (profileData[extField]) {
                updateData[txField] = profileData[extField];
                syncLog.synced_fields.push(txField);
              }
            }
          }

          // Update TalentXcel profile
          if (Object.keys(updateData).length > 0) {
            updateData.updated_at = new Date().toISOString();
            
            const { error: updateError } = await supabase
              .from('profiles')
              .update(updateData)
              .eq('id', userId);

            if (updateError) {
              console.error('Profile update error:', updateError);
              return new Response(
                JSON.stringify({ success: false, error: 'Failed to update profile' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          }

        } else if (syncDirection === 'export') {
          // Export from TalentXcel to external platform
          const exportData = {
            name: currentProfile.full_name,
            headline: currentProfile.title,
            summary: currentProfile.about,
            location: currentProfile.location,
            skills: currentProfile.skills || [],
            experience: currentProfile.experience || [],
            education: currentProfile.education || []
          };

          syncLog.exported_data = exportData;
          syncLog.synced_fields = Object.keys(exportData).filter(key => exportData[key]);
        }

        // Log sync activity
        await supabase
          .from('profile_sync_logs')
          .insert(syncLog);

        // Award TXC for profile sync
        await supabase.functions.invoke('extension-txc-miner', {
          body: {
            userId,
            activity: 'profile_sync',
            metadata: { 
              platform, 
              syncDirection, 
              fieldsCount: syncLog.synced_fields.length 
            }
          }
        });

        return new Response(
          JSON.stringify({
            success: true,
            syncedFields: syncLog.synced_fields,
            syncDirection,
            platform,
            message: `Profile ${syncDirection === 'import' ? 'imported from' : 'exported to'} ${platform} successfully`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_sync_status': {
        // Get recent sync history
        const { data: syncHistory, error: historyError } = await supabase
          .from('profile_sync_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (historyError) {
          console.error('Sync history error:', historyError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to fetch sync history' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            syncHistory: syncHistory || [],
            lastSync: syncHistory?.[0] || null
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'bulk_sync': {
        // Sync across multiple platforms
        const { platforms, syncDirection: bulkDirection = 'import' } = profileData;
        const results = [];

        for (const platformData of platforms) {
          try {
            const { data: result } = await supabase.functions.invoke('extension-profile-sync', {
              body: {
                sessionToken,
                action: 'sync_profile',
                platform: platformData.platform,
                profileData: platformData.data,
                syncDirection: bulkDirection
              }
            });
            results.push({ platform: platformData.platform, success: true, result });
          } catch (error) {
            results.push({ platform: platformData.platform, success: false, error: error.message });
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            results,
            totalPlatforms: platforms.length,
            successfulSyncs: results.filter(r => r.success).length
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
    console.error('Profile sync error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
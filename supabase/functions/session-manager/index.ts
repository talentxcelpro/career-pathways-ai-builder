import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      secure_sessions: {
        Row: {
          id: string;
          user_id: string;
          token_hash: string;
          expires_at: string;
          created_at: string;
          last_accessed: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          token_hash: string;
          expires_at: string;
          created_at?: string;
          last_accessed?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          token_hash?: string;
          expires_at?: string;
          created_at?: string;
          last_accessed?: string | null;
          is_active?: boolean;
        };
      };
    };
  };
}

const supabaseClient = createClient<Database>(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const generateSecureToken = async (): Promise<string> => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

const hashToken = async (token: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, email, password, token } = await req.json();

    switch (action) {
      case 'create': {
        if (!email || !password) {
          return new Response(
            JSON.stringify({ success: false, error: 'Email and password required' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        // Authenticate with Supabase Auth
        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
          email,
          password
        });

        if (authError || !authData.user) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid credentials' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
          );
        }

        // Generate secure session token
        const sessionToken = await generateSecureToken();
        const tokenHash = await hashToken(sessionToken);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Store session in database
        const { error: sessionError } = await supabaseClient
          .from('secure_sessions')
          .insert({
            user_id: authData.user.id,
            token_hash: tokenHash,
            expires_at: expiresAt.toISOString(),
            is_active: true
          } as any);

        if (sessionError) {
          console.error('Session creation error:', sessionError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to create session' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            token: sessionToken,
            expires_at: expiresAt.toISOString(),
            user: authData.user
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'validate': {
        if (!token) {
          return new Response(
            JSON.stringify({ valid: false }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        const tokenHash = await hashToken(token);
        
        const { data: sessionData, error } = await supabaseClient
          .from('secure_sessions')
          .select('*')
          .eq('token_hash', tokenHash)
          .eq('is_active', true)
          .gte('expires_at', new Date().toISOString())
          .single();

        if (error || !sessionData) {
          return new Response(
            JSON.stringify({ valid: false }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update last accessed
        await (supabaseClient as any)
          .from('secure_sessions')
          .update({ last_accessed: new Date().toISOString() })
          .eq('id', (sessionData as any).id);

        return new Response(
          JSON.stringify({ valid: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'refresh': {
        if (!token) {
          return new Response(
            JSON.stringify({ success: false, error: 'Token required' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }

        const tokenHash = await hashToken(token);
        
        const { data: sessionData, error } = await supabaseClient
          .from('secure_sessions')
          .select('*')
          .eq('token_hash', tokenHash)
          .eq('is_active', true)
          .single();

        if (error || !sessionData) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid session' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
          );
        }

        // Check if session is close to expiry (within 5 minutes)
        const expiresAt = new Date((sessionData as any).expires_at);
        const now = new Date();
        const minutesUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60);

        if (minutesUntilExpiry > 5) {
          return new Response(
            JSON.stringify({
              success: true,
              token: token,
              expires_at: (sessionData as any).expires_at
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Generate new token and extend expiry
        const newToken = await generateSecureToken();
        const newTokenHash = await hashToken(newToken);
        const newExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await (supabaseClient as any)
          .from('secure_sessions')
          .update({
            token_hash: newTokenHash,
            expires_at: newExpiresAt.toISOString(),
            last_accessed: new Date().toISOString()
          })
          .eq('id', (sessionData as any).id);

        return new Response(
          JSON.stringify({
            success: true,
            token: newToken,
            expires_at: newExpiresAt.toISOString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'invalidate': {
        if (!token) {
          return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const tokenHash = await hashToken(token);
        
        await (supabaseClient as any)
          .from('secure_sessions')
          .update({ is_active: false })
          .eq('token_hash', tokenHash);

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
  } catch (error) {
    console.error('Session manager error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
// supabase/functions/register-document-mapping/index.ts
// Trusted server-side candidate document mapping registration endpoint.
// Executes in isolated Deno/Edge environment; NEVER bundled into client browser builds.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { getCorsHeaders } from '../_shared/cors.ts';

interface RegisterMappingRequest {
  bucketId: string;
  objectName: string;
  candidateId: string;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 1. Verify caller identity using their JWT
    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    });
    const { data: { user }, error: userErr } = await callerClient.auth.getUser();

    // Privileged service-role client for validation and mutation
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const isServiceRole = authHeader.includes(supabaseServiceKey);
    let callingUserId: string | null = user?.id ?? null;

    if (!isServiceRole && !callingUserId) {
      return new Response(JSON.stringify({ error: 'Unauthorized: invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body: RegisterMappingRequest = await req.json();
    const { bucketId, objectName, candidateId } = body;

    // 2. Target bucket check
    if (bucketId !== 'documents') {
      return new Response(JSON.stringify({ error: 'Only documents bucket is supported' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3. Authorization check: Non-service-role callers can ONLY register for their own candidateId
    if (!isServiceRole && callingUserId !== candidateId) {
      return new Response(JSON.stringify({ error: 'Forbidden: candidates can only register mappings for own documents' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 4. Folder depth containment verification
    const segments = objectName.split('/').filter(Boolean);
    const candidateSegment = segments[1] || segments[0];
    if (candidateSegment !== candidateId) {
      return new Response(JSON.stringify({ error: `Object path prefix does not match candidate identity ${candidateId}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 5. Verify candidate profile exists in public.profiles
    const { data: profile, error: profileErr } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', candidateId)
      .maybeSingle();

    if (profileErr || !profile) {
      return new Response(JSON.stringify({ error: `Candidate profile not found: ${candidateId}` }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 6. Verify object actually exists in Supabase Storage documents bucket
    const folder = segments.slice(0, -1).join('/');
    const filename = segments[segments.length - 1];
    const { data: files, error: listErr } = await adminClient.storage
      .from(bucketId)
      .list(folder, { search: filename });

    if (listErr || !files || !files.some((f: { name: string }) => f.name === filename)) {
      return new Response(JSON.stringify({ error: `Storage object does not exist: ${objectName}` }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 7. Perform privileged upsert via service_role client
    const { data, error: upsertErr } = await adminClient
      .from('candidate_document_mappings')
      .upsert(
        {
          bucket_id: bucketId,
          object_name: objectName,
          candidate_id: candidateId,
          verified_by_service_role: true
        },
        { onConflict: 'bucket_id,object_name' }
      )
      .select()
      .single();

    if (upsertErr) {
      return new Response(JSON.stringify({ error: upsertErr.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

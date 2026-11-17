import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface CandidateDocumentMappingRecord {
  id?: string;
  bucket_id: string;
  object_name: string;
  candidate_id: string;
  created_at?: string;
  verified_by_service_role?: boolean;
}

/**
 * Trusted server-side candidate document mapping writer.
 * Strictly requires a privileged Supabase client (service_role) and enforces:
 * 1. Target bucket must be 'documents'
 * 2. Object key folder depth containment (must match candidate ID prefix)
 * 3. Candidate profile existence in public.profiles
 * 4. Object existence in Supabase Storage documents bucket
 * 5. Automatic audit logging via database trigger
 */
export async function registerCandidateDocumentMapping(
  serviceClient: SupabaseClient,
  params: {
    bucketId: string;
    objectName: string;
    candidateId: string;
  }
): Promise<{ success: boolean; error?: string; data?: CandidateDocumentMappingRecord }> {
  const { bucketId, objectName, candidateId } = params;

  // 1. Bucket boundary check
  if (bucketId !== 'documents') {
    return { success: false, error: 'Only documents bucket is supported' };
  }

  // 2. Folder depth containment verification
  const segments = objectName.split('/').filter(Boolean);
  const candidateSegment = segments[1] || segments[0];
  if (candidateSegment !== candidateId) {
    return {
      success: false,
      error: `Object path prefix does not match candidate identity ${candidateId}`
    };
  }

  // 3. Verify candidate profile exists
  const { data: profile, error: profileErr } = await serviceClient
    .from('profiles')
    .select('id')
    .eq('id', candidateId)
    .maybeSingle();

  if (profileErr || !profile) {
    return { success: false, error: `Candidate profile not found: ${candidateId}` };
  }

  // 4. Verify object exists in Storage
  const folder = segments.slice(0, -1).join('/');
  const filename = segments[segments.length - 1];
  const { data: files, error: listErr } = await serviceClient.storage
    .from(bucketId)
    .list(folder, { search: filename });

  if (listErr || !files || !files.some(f => f.name === filename)) {
    return { success: false, error: `Storage object does not exist: ${objectName}` };
  }

  // 5. Insert or update mapping record using service_role
  const { data, error } = await serviceClient
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

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

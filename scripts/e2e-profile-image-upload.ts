/**
 * End-to-end smoke test: upload a fresh avatar + banner against production
 * Supabase, then verify the new public URLs are fetchable and that the
 * `profiles` row reflects the new URLs immediately.
 *
 * Usage:
 *   SUPABASE_URL=... \
 *   SUPABASE_ANON_KEY=... \
 *   TEST_EMAIL=... TEST_PASSWORD=... \
 *   bun scripts/e2e-profile-image-upload.ts
 *
 * The script exits non-zero on any failure so it can run in CI.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const EMAIL = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !EMAIL || !PASSWORD) {
  console.error('Missing env: SUPABASE_URL, SUPABASE_ANON_KEY, TEST_EMAIL, TEST_PASSWORD');
  process.exit(2);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function makePng(seed: number): Uint8Array {
  // Minimal 1x1 PNG with seed in tEXt chunk to ensure unique bytes per run.
  const base = Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c63f8cf' +
    '00000000ffff03000006000557bfabd40000000049454e44ae426082',
    'hex',
  );
  const out = new Uint8Array(base.length + 4);
  out.set(base, 0);
  new DataView(out.buffer).setUint32(base.length, seed >>> 0);
  return out;
}

async function uploadAndVerify(bucket: string, field: string, userId: string) {
  const bytes = makePng(Date.now() + Math.random() * 1e6);
  const path = `${userId}/e2e_${Date.now()}.png`;
  const { data, error } = await supabase.storage.from(bucket).upload(path, bytes, {
    cacheControl: '60',
    upsert: true,
    contentType: 'image/png',
  });
  if (error) throw new Error(`[${bucket}] upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  const url = `${urlData.publicUrl}?v=${Date.now().toString(36)}`;

  const { error: updErr } = await supabase
    .from('profiles')
    .update({ [field]: url, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (updErr) throw new Error(`[${bucket}] profile update failed: ${updErr.message}`);

  // Verify the URL is publicly reachable with the same byte length
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`[${bucket}] public fetch ${res.status}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf.byteLength !== bytes.byteLength) {
    throw new Error(`[${bucket}] byte mismatch ${buf.byteLength} vs ${bytes.byteLength}`);
  }

  // Verify profile row reflects new URL
  const { data: row, error: selErr } = await supabase
    .from('profiles')
    .select(field)
    .eq('user_id', userId)
    .single();
  if (selErr) throw new Error(`[${bucket}] profile read failed: ${selErr.message}`);
  if ((row as any)?.[field] !== url) {
    throw new Error(`[${bucket}] profile.${field} mismatch`);
  }

  console.log(`✓ ${bucket} -> ${field}: ${url}`);
  return url;
}

(async () => {
  const { data: auth, error } = await supabase.auth.signInWithPassword({
    email: EMAIL!,
    password: PASSWORD!,
  });
  if (error || !auth.user) {
    console.error('Auth failed:', error?.message);
    process.exit(1);
  }
  const userId = auth.user.id;
  console.log(`Signed in as ${userId}`);

  try {
    await uploadAndVerify('avatars', 'profile_picture_url', userId);
    await uploadAndVerify('banners', 'banner_url', userId);
    console.log('\n✅ Avatar + banner upload e2e PASSED');
    process.exit(0);
  } catch (e: any) {
    console.error('\n❌ E2E failed:', e.message);
    process.exit(1);
  }
})();

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import JSZip from 'jszip';
import { createClient } from '@supabase/supabase-js';

// Configuration
const DIST_DIR = path.resolve(process.cwd(), 'dist');
const PACKAGE_JSON_PATH = path.resolve(process.cwd(), 'package.json');
const BUCKET_NAME = 'ota-bundles';

function getProjectVersion(): string {
  try {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
    return pkg.version || '1.0.0';
  } catch {
    return '1.0.0';
  }
}

function addDirectoryToZip(zip: JSZip, rootPath: string, currentPath: string = '') {
  const fullPath = path.join(rootPath, currentPath);
  const items = fs.readdirSync(fullPath);

  for (const item of items) {
    const itemPath = path.join(fullPath, item);
    const zipRelativePath = currentPath ? `${currentPath}/${item}` : item;
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      addDirectoryToZip(zip, rootPath, zipRelativePath);
    } else {
      const fileData = fs.readFileSync(itemPath);
      zip.file(zipRelativePath, fileData);
    }
  }
}

async function main() {
  console.log('🚀 [OTA Push] Initializing Live Bundle Build & Push...');

  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ [OTA Push] dist/ directory not found! Run "npm run build" first.');
    process.exit(1);
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ [OTA Push] SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required.');
    console.error('   Please provide them in your shell or .env file.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  const version = getProjectVersion();
  const buildTimestamp = Date.now();
  const bundleFilename = `bundle-v${version}-${buildTimestamp}.zip`;
  const bundleStoragePath = `bundles/${bundleFilename}`;

  console.log(`📦 [OTA Push] Compressing dist/ bundle for v${version}...`);
  const zip = new JSZip();
  addDirectoryToZip(zip, DIST_DIR);

  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const checksum = crypto.createHash('sha256').update(zipBuffer).digest('hex');
  console.log(`🔒 [OTA Push] SHA-256 Checksum: ${checksum}`);
  console.log(`📊 [OTA Push] Archive size: ${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB`);

  // Ensure bucket exists
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (!bucketError) {
    const exists = buckets.some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      console.log(`⚡ [OTA Push] Creating public storage bucket "${BUCKET_NAME}"...`);
      await supabase.storage.createBucket(BUCKET_NAME, { public: true });
    }
  }

  // Upload ZIP
  console.log(`⬆️ [OTA Push] Uploading archive to Supabase Storage (${bundleStoragePath})...`);
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(bundleStoragePath, zipBuffer, {
      contentType: 'application/zip',
      upsert: true,
    });

  if (uploadError) {
    console.error('❌ [OTA Push] Failed to upload bundle zip:', uploadError.message);
    process.exit(1);
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(bundleStoragePath);

  const bundleUrl = publicUrlData.publicUrl;
  console.log(`🌐 [OTA Push] Live Bundle Public URL: ${bundleUrl}`);

  // Construct manifest
  const manifest = {
    version: `${version}.${buildTimestamp.toString().slice(-4)}`,
    semver: version,
    url: bundleUrl,
    checksum: checksum,
    notes: process.env.OTA_NOTES || `Live update deployed on ${new Date().toUTCString()}`,
    minNativeVersion: '1.0.0',
    updatedAt: new Date().toISOString(),
  };

  const manifestBuffer = Buffer.from(JSON.stringify(manifest, null, 2), 'utf-8');

  console.log('📝 [OTA Push] Updating manifest.json in bucket root...');
  const { error: manifestError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload('manifest.json', manifestBuffer, {
      contentType: 'application/json',
      upsert: true,
      cacheControl: '30',
    });

  if (manifestError) {
    console.error('❌ [OTA Push] Failed to upload manifest.json:', manifestError.message);
    process.exit(1);
  }

  console.log('\n======================================================');
  console.log('✅ [OTA Push] OVER-THE-AIR UPDATE DEPLOYED SUCCESSFULLY');
  console.log(`   New OTA Version: ${manifest.version}`);
  console.log(`   Bundle URL:     ${manifest.url}`);
  console.log('   Native devices will auto-fetch this delta on next launch!');
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('❌ [OTA Push] Fatal error:', err);
  process.exit(1);
});

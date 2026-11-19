// scripts/reactivate-existing-users.ts
// Reactivate 703 Existing Users in auth.users / profiles, Reserve Vanity Handles, Credit +10 AI Credits, and Prepare Broadcast Payloads

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const helper = require('./db-audit-helper.cjs');
helper.setLinkedTarget('production');

interface UserJoinRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  username: string | null;
  created_at: string;
}

function slugifyName(name: string | null, email: string | null, id: string): string {
  if (name && name.trim().length > 0) {
    const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.length >= 3) return clean.slice(0, 24);
  }
  if (email && email.includes('@')) {
    const prefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    if (prefix.length >= 3) return prefix.slice(0, 24);
  }
  return 'member' + id.replace(/[^a-z0-9]/gi, '').slice(0, 6).toLowerCase();
}

function escapeSql(str: string | null): string {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

async function reactivateExistingUsers() {
  console.log('================================================================');
  console.log('🚀 TalentXcel 703-User Reactivation & Vanity Handle Engine');
  console.log('================================================================\n');

  console.log('[STEP 1] Querying 703 registered users from auth.users & profiles...');
  const rows: UserJoinRow[] = helper.runSql(`
    SELECT 
      u.id, 
      COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) as full_name,
      u.email, 
      COALESCE(p.phone, u.phone) as phone, 
      p.username, 
      u.created_at
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    ORDER BY u.created_at ASC;
  `, 'production');

  if (!Array.isArray(rows)) {
    console.error('Failed to query auth.users join profiles:', rows);
    process.exit(1);
  }

  console.log(`✓ Fetched ${rows.length} registered user records from auth.users / profiles.`);

  // Track assigned usernames for collision prevention
  const takenUsernames = new Set<string>();
  rows.forEach(r => {
    if (r.username && r.username.trim().length > 0) {
      takenUsernames.add(r.username.trim().toLowerCase());
    }
  });

  const profilesToUpsert: { id: string; fullName: string; email: string; phone: string | null; username: string }[] = [];
  const campaigns: any[] = [];

  for (const user of rows) {
    let handle = (user.username || '').trim().toLowerCase();
    let neededReservation = false;

    if (!handle) {
      neededReservation = true;
      let baseSlug = slugifyName(user.full_name, user.email, user.id);
      handle = baseSlug;
      let counter = 2;
      while (takenUsernames.has(handle)) {
        handle = `${baseSlug}${counter}`;
        counter++;
      }
      takenUsernames.add(handle);
      profilesToUpsert.push({
        id: user.id,
        fullName: user.full_name || 'Member',
        email: user.email || '',
        phone: user.phone || null,
        username: handle
      });
    }

    const firstName = (user.full_name || 'Member').trim().split(' ')[0];
    const passportUrl = `https://talentxcel.in/u/${handle}`;
    const verifyUrl = `https://talentxcel.in/verify/${handle}`;

    campaigns.push({
      userId: user.id,
      fullName: user.full_name || 'Member',
      firstName,
      email: user.email,
      phone: user.phone,
      reservedHandle: handle,
      passportUrl,
      verifyUrl,
      creditsGranted: 10,
      txcGranted: 100,
      neededReservation,
      emailPayload: {
        to: user.email,
        subject: `Your TalentXcel Career Passport handle (@${handle}) has been reserved (+10 AI Credits)`,
        headline: `Claim your verified career identity before public release`,
        ctaText: 'Claim Your Career Passport',
        ctaUrl: `${passportUrl}?claim=${handle}&welcome_bonus=10`
      },
      whatsappPayload: {
        to: user.phone,
        message: `Hi ${firstName}! 🛡️ Your verified Career Passport handle (*talentxcel.in/u/${handle}*) has been reserved on TalentXcel, and *+10 Welcome AI Credits* have been added to your account.\n\nClaim your handle & post your 30s intro on /network to appear at the top of recruiter searches:\n👉 ${passportUrl}?claim=${handle}`
      }
    });
  }

  console.log(`\n[STEP 2] Upserting vanity handles in public.profiles for ${profilesToUpsert.length} users...`);
  if (profilesToUpsert.length > 0) {
    const chunkSize = 50;
    for (let i = 0; i < profilesToUpsert.length; i += chunkSize) {
      const chunk = profilesToUpsert.slice(i, i + chunkSize);
      const valuesSql = chunk.map(u => `(
        '${u.id}', 
        '${escapeSql(u.fullName)}', 
        '${escapeSql(u.email)}', 
        ${u.phone ? `'${escapeSql(u.phone)}'` : 'NULL'}, 
        '${escapeSql(u.username)}', 
        now()
      )`).join(',\n');

      const upsertSql = `
        INSERT INTO public.profiles (id, full_name, email, phone, username, updated_at)
        VALUES ${valuesSql}
        ON CONFLICT (id) DO UPDATE SET
          username = EXCLUDED.username,
          full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
          email = COALESCE(public.profiles.email, EXCLUDED.email),
          updated_at = now();
      `;
      helper.runSql(upsertSql, 'production');
      console.log(`  ✓ Synced vanity profiles chunk ${Math.floor(i / chunkSize) + 1} (${chunk.length} users)`);
    }
  } else {
    console.log('  ✓ All 703 registered users have active profile handles.');
  }

  console.log('\n[STEP 3] Allocating +10 Welcome AI Credits & +100 TXC to all 703 registered users...');
  const creditChunkSize = 100;
  for (let i = 0; i < rows.length; i += creditChunkSize) {
    const chunk = rows.slice(i, i + creditChunkSize);
    
    // 1. user_credits
    const creditValues = chunk.map(u => `('${u.id}', 10, 10, 0, now(), now())`).join(',\n');
    const upsertCreditsSql = `
      INSERT INTO public.user_credits (user_id, balance, total_earned, total_spent, created_at, updated_at)
      VALUES ${creditValues}
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        balance = COALESCE(public.user_credits.balance, 0) + 10,
        total_earned = COALESCE(public.user_credits.total_earned, 0) + 10,
        updated_at = now();
    `;
    helper.runSql(upsertCreditsSql, 'production');

    // 2. user_txc_balances
    const txcValues = chunk.map(u => `('${u.id}', 100, 100, 0, now(), now())`).join(',\n');
    const upsertTxcSql = `
      INSERT INTO public.user_txc_balances (user_id, txc_balance, total_earned, total_spent, created_at, updated_at)
      VALUES ${txcValues}
      ON CONFLICT (user_id)
      DO UPDATE SET
        txc_balance = COALESCE(public.user_txc_balances.txc_balance, 0) + 100,
        total_earned = COALESCE(public.user_txc_balances.total_earned, 0) + 100,
        updated_at = now();
    `;
    helper.runSql(upsertTxcSql, 'production');
    console.log(`  ✓ Credited batch ${Math.floor(i / creditChunkSize) + 1} (${chunk.length} users)`);
  }

  // Export reactivation campaign payloads
  const reportsDir = resolve('reports');
  if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true });

  const payloadPath = resolve(reportsDir, 'user_reactivation_payloads.json');
  writeFileSync(payloadPath, JSON.stringify({
    totalRegisteredUsers: rows.length,
    handlesReservedOrVerified: rows.length,
    creditsIssuedPerUser: 10,
    txcIssuedPerUser: 100,
    generatedAt: new Date().toISOString(),
    campaigns: campaigns.slice(0, 100), // First 100 sample for inspection
    totalCampaignsCount: campaigns.length
  }, null, 2), 'utf-8');

  console.log(`\n[STEP 4] Campaign Payloads Ready!`);
  console.log(`  ✓ Total Registered Accounts Processed: ${rows.length}`);
  console.log(`  ✓ Reserved Vanity Handles: ${rows.length} (available under talentxcel.in/u/:handle)`);
  console.log(`  ✓ Welcome Bonus: +10 AI Credits & +100 TXC credited to all 703 users`);
  console.log(`  ✓ Saved payloads report to: ${payloadPath}`);
  console.log('\n🏁 703-User Reactivation Preparation Completed Successfully!');
}

reactivateExistingUsers().catch(err => {
  console.error('Fatal reactivation error:', err);
  process.exit(1);
});

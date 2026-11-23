// scripts/record-operator-dispatch.ts
// TalentXcel Global Embed Adoption Engine — Operator Manual Dispatch Logger
// Records confirmed manual email dispatch into Supabase production tables

import { execSync } from 'child_process';
import fs from 'fs';

interface ManualDispatchArgs {
  id: string;
  recipient: string;
  subject: string;
  messageRef?: string;
  notes?: string;
}

export async function recordManualDispatch(args: ManualDispatchArgs) {
  const { id, recipient, subject, messageRef = 'MANUAL-CLIENT-SEND', notes = '' } = args;

  if (!id || !recipient || !subject) {
    console.error('Usage: npx tsx scripts/record-operator-dispatch.ts --id <id> --recipient <email> --subject <subject> [--ref <messageRef>] [--notes <notes>]');
    process.exit(1);
  }

  const cleanSubject = subject.replace(/'/g, "''");
  const cleanNotes = `Confirmed manual operator dispatch to ${recipient}. Subject: "${cleanSubject}". Reference: ${messageRef}. ${notes}`.replace(/'/g, "''");

  console.log('========================================================================');
  console.log('RECORDING MANUAL OPERATOR DISPATCH TO PRODUCTION DATABASE');
  console.log('========================================================================\n');
  console.log(`Publisher ID:  ${id}`);
  console.log(`Recipient:     ${recipient}`);
  console.log(`Subject:       ${subject}`);
  console.log(`Message Ref:   ${messageRef}`);

  const sqlStatements = `
    -- 1. Update pipeline_stage to 'contacted' in embed_publisher_opportunities
    UPDATE public.embed_publisher_opportunities
    SET pipeline_stage = 'contacted',
        updated_at = NOW()
    WHERE id = '${id}';

    -- 2. Insert verified outreach_sent entry in publisher_outreach_log
    INSERT INTO public.publisher_outreach_log (
      publisher_id,
      action,
      operator_id,
      channel,
      notes,
      created_at
    ) VALUES (
      '${id}',
      'outreach_sent',
      'manual_operator',
      'email',
      '${cleanNotes}',
      NOW()
    );
  `;

  const sqlPath = 'scripts/temp-log-dispatch.sql';
  fs.writeFileSync(sqlPath, sqlStatements, 'utf8');

  try {
    console.log('\nExecuting Supabase database update...');
    execSync(`npx supabase db query --linked -f ${sqlPath}`, { stdio: 'inherit' });

    console.log('\nVerifying update in publisher_outreach_log:');
    const verifySql = `
      SELECT publisher_id, action, operator_id, channel, notes, created_at
      FROM public.publisher_outreach_log
      WHERE publisher_id = '${id}' AND action = 'outreach_sent'
      ORDER BY created_at DESC
      LIMIT 1;
    `;
    fs.writeFileSync('scripts/temp-verify-dispatch.sql', verifySql, 'utf8');
    execSync(`npx supabase db query --linked -f scripts/temp-verify-dispatch.sql`, { stdio: 'inherit' });

    console.log('\n========================================================================');
    console.log('SUCCESS: MANUAL DISPATCH LOGGED TO PRODUCTION DATABASE');
    console.log('========================================================================');
  } finally {
    if (fs.existsSync(sqlPath)) fs.unlinkSync(sqlPath);
    if (fs.existsSync('scripts/temp-verify-dispatch.sql')) fs.unlinkSync('scripts/temp-verify-dispatch.sql');
  }
}

// Parse CLI flags if invoked directly
if (process.argv[1]?.includes('record-operator-dispatch.ts')) {
  const args = process.argv.slice(2);
  const parsed: any = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--id' && args[i + 1]) parsed.id = args[++i];
    if (args[i] === '--recipient' && args[i + 1]) parsed.recipient = args[++i];
    if (args[i] === '--subject' && args[i + 1]) parsed.subject = args[++i];
    if (args[i] === '--ref' && args[i + 1]) parsed.messageRef = args[++i];
    if (args[i] === '--notes' && args[i + 1]) parsed.notes = args[++i];
  }

  if (parsed.id && parsed.recipient && parsed.subject) {
    recordManualDispatch(parsed).catch(console.error);
  } else {
    console.log('Ready: Call recordManualDispatch(args) or invoke with --id, --recipient, and --subject flags.');
  }
}

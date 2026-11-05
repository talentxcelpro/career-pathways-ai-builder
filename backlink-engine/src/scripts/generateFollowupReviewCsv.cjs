// backlink-engine/src/scripts/generateFollowupReviewCsv.cjs
// Generates the comprehensive TXC_BACKLINK_007_FOLLOWUP_REVIEW.csv containing
// full, untruncated text of both original proposals and proposed Day +7 follow-up pitches.

const fs = require('fs');
const path = require('path');
const { FIRST_5_INSTITUTIONS_OUTREACH } = require('../campaigns/stage4_1Execution.cjs');

const FOLLOWUP_PITCHES = {
  'iitm.ac.in': {
    dueDate: '2026-11-10T09:00:00+05:30',
    subject: 'Re: [Institutional Career Resource] Free ATS Resume Diagnostic for IIT Madras Students',
    body: `Respected Prof. Sathyanarayana N. Gummadi,

Greetings from TalentXcel Technologies.

Following our earlier message regarding student career preparation resources, we wanted to briefly check whether the Career Development Centre (CDC) at IIT Madras had the opportunity to evaluate our free ATS resume diagnostic portal for your graduating cohort.

The utility (https://talentxcel.in/resume-scanner) is 100% free of charge with zero advertisements or subscription paywalls. Students upload their draft CV to receive real-time structural feedback, keyword density scoring, and formatting adjustments compatible with modern corporate ATS parsers.

If appropriate for your department, we would be honored by voluntary inclusion of the resource link on your student preparation portal (https://placement.iitm.ac.in).

We remain entirely at your service should you or the CDC team require a platform demonstration or aggregated campus diagnostic telemetry.

With highest esteem and warm regards,
Academic Relations & University Partnerships Desk
TalentXcel Technologies
https://talentxcel.in | contact@talentxcel.in`
  },
  'home.iitd.ac.in': {
    dueDate: '2026-11-10T09:00:00+05:30',
    subject: 'Re: [Placement Resource] Free ATS Resume Checker & Benchmark Analytics for IIT Delhi Students',
    body: `Respected Prof. Abhishek Dixit,

Greetings from TalentXcel Technologies.

We hope this note finds the Office of Career Services at IIT Delhi well.

We are following up regarding our offer of open access to TalentXcel's ATS Resume Evaluation tool for IIT Delhi students. As corporate technical employers rely heavily on automated screening algorithms, our tool helps students ensure their resumes parse cleanly without accidental disqualification.

Students can test their CVs with zero commercial friction at:
https://talentxcel.in/resume-scanner

If aligned with OCS career guidance initiatives, we would welcome voluntary inclusion in your student links directory (https://ocs.iitd.ac.in). Please let us know if your office would like a brief administrative overview.

Thank you for your ongoing commitment to engineering excellence.

With warm regards and highest respect,
University Partnerships Desk
TalentXcel Technologies
https://talentxcel.in | contact@talentxcel.in`
  },
  'iitb.ac.in': {
    dueDate: '2026-11-10T09:00:00+05:30',
    subject: 'Re: [Student Career Support] Free ATS Resume Diagnostic Tool for IIT Bombay Placement Cycle',
    body: `Respected Prof. Lalit Kumar,

Greetings from TalentXcel Technologies.

We hope the campus placement drive at IIT Bombay is proceeding with great success.

We are gently following up on our previous note offering students unrestricted access to TalentXcel's institutional ATS Resume Scanner. The platform provides automated parsing diagnostics, flagging structural or keyword gaps before resumes are delivered to enterprise recruiters:
https://talentxcel.in/resume-scanner

We would be honored if the Placement Office considered voluntarily linking this utility on the campus resources desk (https://campus.placements.iitb.ac.in/).

We are available at your convenience should your team have questions regarding our architecture or student privacy standards.

With highest esteem and regards,
Academic Relations & Outreach Desk
TalentXcel Technologies
https://talentxcel.in | contact@talentxcel.in`
  },
  'iitk.ac.in': {
    dueDate: '2026-11-10T09:00:00+05:30',
    subject: 'Re: [Institutional Partnership] Free ATS Resume Scanner for IIT Kanpur Graduating Cohort',
    body: `Respected Prof. Raju Kumar Gupta,

Greetings from TalentXcel Technologies.

We hope the placement season at IIT Kanpur continues to deliver outstanding opportunities for your students.

We are checking in regarding our offer to provide IIT Kanpur students with open, cost-free access to TalentXcel's ATS Resume Diagnostic utility (https://talentxcel.in/resume-scanner). The tool helps technical candidates verify algorithmic readability across standard applicant tracking schemas.

If of value to your students, we would appreciate voluntary inclusion on the SPO student resource page (https://spo.iitk.ac.in).

We remain at your service should you or the placement committee require further information.

With utmost respect and highest regards,
University Relations Desk
TalentXcel Technologies
https://talentxcel.in | contact@talentxcel.in`
  },
  'bits-pilani.ac.in': {
    dueDate: '2026-11-10T09:00:00+05:30',
    subject: 'Re: [Student Career Resource] Free ATS Resume Diagnostic Tool for BITS Pilani Students',
    body: `Respected Dr. G. Balasubramanian,

Greetings from TalentXcel Technologies.

We hope all is well at the BITS Pilani Placement Unit across all campuses.

Following up on our earlier note, we wanted to ensure your office had an opportunity to review TalentXcel's free ATS Resume Scanner (https://talentxcel.in/resume-scanner). The utility is engineered to assist graduating engineers in diagnosing parsing bottlenecks and aligning skills with corporate job descriptions.

If aligned with your placement preparation initiatives, we would welcome voluntary inclusion in the student links directory on your placement portal (https://www.bits-pilani.ac.in/placements).

Please let us know if we can provide an institutional demonstration or answer any questions.

With warm regards and highest esteem,
Campus Partnership Team
TalentXcel Technologies
https://talentxcel.in | contact@talentxcel.in`
  }
};

function escapeCsv(val) {
  const str = String(val === null || val === undefined ? '' : val);
  return `"${str.replace(/"/g, '""')}"`;
}

function generateCsv() {
  const headers = [
    'action_id',
    'institution_name',
    'domain',
    'placement_desk',
    'verified_officer_name',
    'verified_officer_role',
    'verified_officer_email',
    'verified_placement_portal_url',
    'original_proposal_subject',
    'original_proposal_full_body',
    'followup_due_date',
    'followup_proposal_subject',
    'followup_proposal_full_body',
    'human_approval_status'
  ];

  const rows = [headers.join(',')];

  FIRST_5_INSTITUTIONS_OUTREACH.forEach((inst, index) => {
    const actionId = `ACT-TPO-00${index + 1}`;
    const fu = FOLLOWUP_PITCHES[inst.domain];

    const row = [
      escapeCsv(actionId),
      escapeCsv(inst.name),
      escapeCsv(inst.domain),
      escapeCsv(inst.placement_desk),
      escapeCsv(inst.officer_name),
      escapeCsv(inst.officer_role),
      escapeCsv(inst.officer_email),
      escapeCsv(inst.placement_url),
      escapeCsv(inst.pitch_subject),
      escapeCsv(inst.pitch_body),
      escapeCsv(fu.dueDate),
      escapeCsv(fu.subject),
      escapeCsv(fu.body),
      escapeCsv('AWAITING_EXECUTIVE_REVIEW_NO_AUTO_DISPATCH')
    ];
    rows.push(row.join(','));
  });

  const outPath = path.resolve(__dirname, '../../../reports/TXC_BACKLINK_007_FOLLOWUP_REVIEW.csv');
  fs.writeFileSync(outPath, rows.join('\n'), 'utf8');
  console.log(`✓ Exported: ${outPath}`);

  // Also update reports/TXC_BACKLINK_006_RESPONSE_TRACKER.csv with full body columns
  const trackerHeaders = [
    'action_id',
    'workstream',
    'target_entity',
    'contact_or_platform',
    'initial_action_type',
    'staged_or_dispatched_at',
    'transmission_evidence_id',
    'delivery_status',
    'response_status',
    'reply_timestamp',
    'permission_granted',
    'next_action_due',
    'original_message_full_text',
    'followup_message_full_text'
  ];

  const trackerRows = [trackerHeaders.join(',')];

  FIRST_5_INSTITUTIONS_OUTREACH.forEach((inst, index) => {
    const actionId = `ACT-TPO-00${index + 1}`;
    const fu = FOLLOWUP_PITCHES[inst.domain];

    trackerRows.push([
      escapeCsv(actionId),
      escapeCsv('CAMPUS_TPO'),
      escapeCsv(inst.name),
      escapeCsv(`${inst.officer_name} <${inst.officer_email}>`),
      escapeCsv('OUTREACH_PROPOSAL_DISPATCH'),
      escapeCsv('2026-11-03T08:15:00+05:30'),
      escapeCsv('LOCAL_STAGING_ONLY_NO_EXTERNAL_SMTP'),
      escapeCsv('PREPARED_NOT_DISPATCHED'),
      escapeCsv('NO_REPLY'),
      escapeCsv('NULL'),
      escapeCsv('NO'),
      escapeCsv(fu.dueDate),
      escapeCsv(`Subject: ${inst.pitch_subject}\n\n${inst.pitch_body}`),
      escapeCsv(`Subject: ${fu.subject}\n\n${fu.body}`)
    ].join(','));
  });

  const b2bPlatforms = [
    { id: 'ACT-B2B-001', name: 'Startup India', target: 'DPIIT Portal', status: 'DOCUMENTS_PENDING_AUTHORISED_REVIEW', action: 'DPIIT Recognition Application Staged', due: '2026-11-05T12:00:00+05:30' },
    { id: 'ACT-B2B-002', name: 'Crunchbase', target: 'crunchbase.com/add-new', status: 'PROFILE_VERIFICATION_PENDING', action: 'Company Profile Staged for Email Claim', due: '2026-11-04T12:00:00+05:30' },
    { id: 'ACT-B2B-003', name: 'Clutch', target: 'clutch.co/profile/get-listed', status: 'PROFILE_VERIFICATION_PENDING', action: 'Vendor Profile Staged for Phone Verification', due: '2026-11-05T12:00:00+05:30' },
    { id: 'ACT-B2B-004', name: 'SoftwareSuggest', target: 'softwaresuggest.com/list-your-software', status: 'PROFILE_PUBLICATION_UNCONFIRMED', action: 'SaaS Listing Staged for Editorial Review', due: '2026-11-06T12:00:00+05:30' },
    { id: 'ACT-B2B-005', name: 'Product Hunt', target: 'producthunt.com/posts/new', status: 'PROFILE_VERIFICATION_PENDING', action: 'Maker Post Staged for Launch Scheduling', due: '2026-11-04T12:00:00+05:30' }
  ];

  b2bPlatforms.forEach(b => {
    trackerRows.push([
      escapeCsv(b.id),
      escapeCsv('B2B_DIRECTORY'),
      escapeCsv(b.name),
      escapeCsv(b.target),
      escapeCsv(b.action),
      escapeCsv('2026-11-03T08:15:00+05:30'),
      escapeCsv('STAGED_PAYLOAD_PENDING_PLATFORM_CONFIRMATION'),
      escapeCsv(b.status),
      escapeCsv('AWAITING_VERIFICATION_OR_APPROVAL'),
      escapeCsv('NULL'),
      escapeCsv('NO'),
      escapeCsv(b.due),
      escapeCsv(`Official company profile payload staged in SQLite b2b_directory_profiles table. Listing tier: 100% Free Organic Tier ($0.00).`),
      escapeCsv('N/A - Commercial directory profile claiming / moderation queue.')
    ].join(','));
  });

  const trackerPath = path.resolve(__dirname, '../../../reports/TXC_BACKLINK_006_RESPONSE_TRACKER.csv');
  fs.writeFileSync(trackerPath, trackerRows.join('\n'), 'utf8');
  console.log(`✓ Updated with full text: ${trackerPath}`);
}

generateCsv();

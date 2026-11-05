/**
 * src/lib/email/masterTemplates.ts
 *
 * Full Production Suite of 10 Core Brand-Aligned Email Templates
 *
 * Catalog:
 * 1. welcome_candidate          — New candidate onboarding & Career Passport activation
 * 2. application_received       — Candidate application submitted confirmation with timeline
 * 3. application_status_update  — Candidate status milestone (Shortlisted, In-Review, Offer)
 * 4. interview_invitation       — Calendar schedule, platform link & technical prep guide
 * 5. job_match_alert            — Curated job recommendations matching candidate skills & tier
 * 6. new_candidate_applied      — Recruiter notification with candidate TalentScore match
 * 7. recruiter_outreach         — Personalized direct outreach from recruiter to talent
 * 8. contact_enquiry            — Admin alert for incoming inquiries from /contact
 * 9. contact_auto_reply         — Immediate branded acknowledgement to visitor
 * 10. security_alert            — Account login, security PIN, or password modification alert
 */

import {
  escapeHtml,
  renderButton,
  renderBadge,
  renderDataCard,
  wrapInMasterLayout,
  EmailRenderOutput,
  CANONICAL_URL
} from './designSystem';

export function renderMasterTemplate(
  templateName: string,
  vars: Record<string, any>,
  recipientEmail: string
): EmailRenderOutput {
  const t = templateName.toLowerCase().trim();
  const name = escapeHtml(vars.name || vars.firstName || vars.candidateName || 'there');
  const ctaUrl = vars.ctaUrl || `${CANONICAL_URL}/dashboard`;

  let subject = 'Notification from TalentXcel';
  let preheader = 'Important career notification from TalentXcel';
  let contentHtml = '';
  let plainText = '';
  let category: 'transactional' | 'engagement' | 'marketing' = 'transactional';

  switch (t) {
    // ─────────────────────────────────────────────────────────────────────────
    // 1. WELCOME CANDIDATE
    // ─────────────────────────────────────────────────────────────────────────
    case 'welcome':
    case 'welcome_candidate': {
      category = 'transactional';
      subject = `Welcome to TalentXcel, ${name}! Your Career OS is Ready 🚀`;
      preheader = 'Discover verified tech roles, run free ATS diagnostics, and build your verified Career Passport.';
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          ${renderBadge('Welcome to the Network', 'purple')}
          <h1 class="hero-title" style="margin: 16px 0 10px 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
            Let's Supercharge Your Tech Career, ${name}!
          </h1>
          <p style="margin: 0; font-size: 15px; line-height: 24px; color: #475569;">
            You have joined India and the world's most transparent technical talent platform. Here are your 3 fast-track steps:
          </p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding: 10px 0; vertical-align: top; width: 36px;">
                <div style="background-color: #2563eb; color: #ffffff; width: 26px; height: 26px; border-radius: 50%; text-align: center; line-height: 26px; font-size: 13px; font-weight: 700;">1</div>
              </td>
              <td style="padding: 8px 0 16px 8px;">
                <strong style="color: #0f172a; font-size: 15px;">Run Instant ATS Diagnostics</strong>
                <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px; line-height: 19px;">Upload your CV to uncover missing industry keywords and formatting score.</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; vertical-align: top; width: 36px;">
                <div style="background-color: #2563eb; color: #ffffff; width: 26px; height: 26px; border-radius: 50%; text-align: center; line-height: 26px; font-size: 13px; font-weight: 700;">2</div>
              </td>
              <td style="padding: 8px 0 16px 8px;">
                <strong style="color: #0f172a; font-size: 15px;">Build Your Verified Career Passport</strong>
                <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px; line-height: 19px;">Cryptographically link skills, GitHub repositories, and verified achievements.</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; vertical-align: top; width: 36px;">
                <div style="background-color: #2563eb; color: #ffffff; width: 26px; height: 26px; border-radius: 50%; text-align: center; line-height: 26px; font-size: 13px; font-weight: 700;">3</div>
              </td>
              <td style="padding: 8px 0 4px 8px;">
                <strong style="color: #0f172a; font-size: 15px;">Direct Recruiter Sourcing</strong>
                <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px; line-height: 19px;">Get directly shortlisted by top tech organizations without agency middle-men.</p>
              </td>
            </tr>
          </table>
        </div>

        ${renderButton('Complete Your Profile', `${CANONICAL_URL}/passport/builder`)}
        
        <p style="margin: 28px 0 0 0; font-size: 13px; line-height: 20px; color: #94a3b8; text-align: center;">
          Have questions? Reply directly to this email or visit our <a href="${CANONICAL_URL}/contact" style="color: #2563eb;">Help Center</a>.
        </p>
      `;
      plainText = `Welcome to TalentXcel, ${name}!\n\nYour Tech Career OS is Ready.\n\nNext steps:\n1. Run Instant ATS Diagnostics: ${CANONICAL_URL}/resume/ats-check\n2. Build Your Verified Career Passport: ${CANONICAL_URL}/passport/builder\n3. Match with Top Roles: ${CANONICAL_URL}/jobs\n\n© TalentXcel Services Pvt. Ltd.`;
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. APPLICATION RECEIVED (Candidate confirmation)
    // ─────────────────────────────────────────────────────────────────────────
    case 'application_received':
    case 'application_confirmation': {
      category = 'transactional';
      const role = escapeHtml(vars.jobTitle || 'Technical Role');
      const company = escapeHtml(vars.companyName || 'Verified Partner');
      subject = `Application Received: ${role} at ${company} ✅`;
      preheader = `We confirmed delivery of your application for ${role} to the hiring team.`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          ${renderBadge('Application Delivered', 'success')}
          <h1 class="hero-title" style="margin: 16px 0 10px 0; font-size: 24px; font-weight: 800; color: #0f172a;">
            Application Successfully Submitted!
          </h1>
          <p style="margin: 0; font-size: 15px; color: #475569;">
            Hi ${name}, your profile and credentials have been forwarded directly to the hiring managers at <strong>${company}</strong>.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Role Title', value: role, icon: '💼' },
          { label: 'Company', value: company, icon: '🏢' },
          { label: 'Location', value: escapeHtml(vars.location || 'Remote / Hybrid'), icon: '📍' },
          { label: 'Application ID', value: escapeHtml(vars.applicationId || `TX-${Date.now().toString().slice(-6)}`), icon: '🔖' },
          { label: 'Applied Date', value: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), icon: '📅' }
        ])}

        <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 6px; padding: 14px 18px; margin: 20px 0;">
          <strong style="color: #1e40af; font-size: 14px;">What happens next?</strong>
          <p style="margin: 6px 0 0 0; color: #3b82f6; font-size: 13px; line-height: 19px;">
            The hiring team will review your TalentScore, verified proofs, and resume. You will receive an immediate automated alert as soon as your status updates.
          </p>
        </div>

        ${renderButton('Track Application Status', vars.trackingUrl || `${CANONICAL_URL}/dashboard/applications`)}
      `;
      plainText = `Application Received: ${role} at ${company}\n\nHi ${name},\nYour application has been received and delivered to the hiring team.\n\nTrack status: ${vars.trackingUrl || `${CANONICAL_URL}/dashboard/applications`}\n\n© TalentXcel`;
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. APPLICATION STATUS UPDATE (Candidate milestone)
    // ─────────────────────────────────────────────────────────────────────────
    case 'application_status_update':
    case 'application_status': {
      category = 'transactional';
      const role = escapeHtml(vars.jobTitle || 'Role');
      const company = escapeHtml(vars.companyName || 'Company');
      const status = escapeHtml(vars.newStatus || 'Shortlisted');
      const badgeVariant = status.toLowerCase().includes('shortlist') ? 'success' : 'purple';

      subject = `Status Update: ${status} for ${role} at ${company}`;
      preheader = `Your application for ${role} has moved to ${status}.`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          ${renderBadge(status, badgeVariant)}
          <h1 class="hero-title" style="margin: 16px 0 10px 0; font-size: 24px; font-weight: 800; color: #0f172a;">
            Application Milestone Reached
          </h1>
          <p style="margin: 0; font-size: 15px; color: #475569;">
            Hi ${name}, the hiring team at <strong>${company}</strong> has updated your candidacy for <strong>${role}</strong>.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Position', value: role },
          { label: 'Company', value: company },
          { label: 'Current Status', value: status },
          { label: 'Updated', value: 'Just Now' }
        ])}

        ${vars.recruiterNote ? `
          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px;">Recruiter Note:</div>
            <div style="font-size: 14px; color: #1e293b; line-height: 22px;">"${escapeHtml(vars.recruiterNote)}"</div>
          </div>
        ` : ''}

        ${renderButton('View Next Steps in Portal', vars.actionUrl || `${CANONICAL_URL}/dashboard/applications`)}
      `;
      plainText = `Status Update: ${status} for ${role} at ${company}\n\nHi ${name},\nYour application has been updated to ${status}.\n\nView details: ${vars.actionUrl || `${CANONICAL_URL}/dashboard/applications`}`;
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. INTERVIEW INVITATION
    // ─────────────────────────────────────────────────────────────────────────
    case 'interview_invitation':
    case 'interview_scheduled': {
      category = 'transactional';
      const role = escapeHtml(vars.jobTitle || 'Engineering Role');
      const company = escapeHtml(vars.companyName || 'TalentXcel Partner');
      const interviewDate = escapeHtml(vars.interviewDate || 'To be selected');
      const interviewTime = escapeHtml(vars.interviewTime || 'See invite link');
      const meetingLink = vars.meetingUrl || vars.ctaUrl || `${CANONICAL_URL}/dashboard/interviews`;

      subject = `Interview Invitation: ${role} at ${company} 🗓️`;
      preheader = `You have been invited for an interview with ${company} on ${interviewDate}.`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          ${renderBadge('Interview Scheduled', 'success')}
          <h1 class="hero-title" style="margin: 16px 0 10px 0; font-size: 24px; font-weight: 800; color: #0f172a;">
            You're Invited to Interview!
          </h1>
          <p style="margin: 0; font-size: 15px; color: #475569;">
            Hi ${name}, congratulations! <strong>${company}</strong> was impressed with your profile and has invited you to interview for the <strong>${role}</strong> role.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Role', value: role, icon: '💼' },
          { label: 'Interviewer', value: escapeHtml(vars.interviewerName || 'Hiring Panel'), icon: '👤' },
          { label: 'Format', value: escapeHtml(vars.interviewFormat || 'Video Call (Technical Round)'), icon: '💻' },
          { label: 'Date', value: interviewDate, icon: '📅' },
          { label: 'Time / Timezone', value: interviewTime, icon: '⏰' }
        ])}

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
          <strong style="color: #0f172a; font-size: 14px;">💡 Technical Preparation Tips:</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #475569; font-size: 13px; line-height: 20px;">
            <li>Test your microphone and camera 10 minutes prior to call.</li>
            <li>Have your verified TalentXcel Career Passport ready to share.</li>
            <li>Be prepared to discuss past GitHub implementations and architecture decisions.</li>
          </ul>
        </div>

        ${renderButton('Join Interview / Confirm Slot', meetingLink, 'success')}
      `;
      plainText = `Interview Invitation: ${role} at ${company}\n\nHi ${name},\nYou have been invited to interview on ${interviewDate} at ${interviewTime}.\n\nAccess link: ${meetingLink}\n\n© TalentXcel`;
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. JOB MATCH ALERT (Personalized recommendations)
    // ─────────────────────────────────────────────────────────────────────────
    case 'job_match_alert':
    case 'job_matches': {
      category = 'engagement';
      subject = `🎯 ${vars.matchCount || 3} New Verified Roles Match Your TalentScore`;
      preheader = `Top hiring teams just published opportunities matching your verified skills.`;

      const jobsList = (vars.jobs || [
        { title: 'Senior Full Stack Engineer', company: 'NextGen Cloud', location: 'Bengaluru (Hybrid)', salary: '₹28L - ₹38L' },
        { title: 'Backend Systems Architect', company: 'FinTech Velocity', location: 'Remote (India)', salary: '₹32L - ₹45L' },
        { title: 'Lead DevOps / SRE Engineer', company: 'ScaleX Digital', location: 'Hyderabad', salary: '₹24L - ₹34L' }
      ]).map((j: any) => `
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 20px; margin-bottom: 12px; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <strong style="color: #0f172a; font-size: 16px;">${escapeHtml(j.title)}</strong>
          </div>
          <div style="color: #475569; font-size: 14px; margin: 4px 0 8px 0;">
            ${escapeHtml(j.company)} &bull; <span style="color: #64748b;">${escapeHtml(j.location)}</span>
          </div>
          <div style="display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 6px;">
            ${escapeHtml(j.salary)}
          </div>
        </div>
      `).join('');

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          ${renderBadge('Curated Matches', 'purple')}
          <h1 class="hero-title" style="margin: 16px 0 10px 0; font-size: 24px; font-weight: 800; color: #0f172a;">
            Fresh Roles Matching Your Skills
          </h1>
          <p style="margin: 0; font-size: 15px; color: #475569;">
            Hi ${name}, our AI matcher discovered high-affinity openings aligned with your profile this week:
          </p>
        </div>

        <div style="margin: 24px 0;">
          ${jobsList}
        </div>

        ${renderButton('View All Matching Jobs', `${CANONICAL_URL}/jobs`)}
      `;
      plainText = `Fresh Roles Matching Your Skills\n\nHi ${name},\nExplore new matching opportunities on TalentXcel: ${CANONICAL_URL}/jobs\n\nUnsubscribe: ${CANONICAL_URL}/unsubscribe?email=${encodeURIComponent(recipientEmail)}`;
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. NEW CANDIDATE APPLIED (Recruiter notification)
    // ─────────────────────────────────────────────────────────────────────────
    case 'new_candidate_applied': {
      category = 'transactional';
      const role = escapeHtml(vars.jobTitle || 'Your Open Job');
      const candidateScore = escapeHtml(vars.talentScore || '92');
      subject = `New Application for ${role}: ${name} (TalentScore: ${candidateScore}) ⚡`;
      preheader = `${name} just applied for ${role} with an ATS rating of ${candidateScore}/100.`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          ${renderBadge('New Candidate Application', 'info')}
          <h1 class="hero-title" style="margin: 16px 0 10px 0; font-size: 24px; font-weight: 800; color: #0f172a;">
            Candidate Application Received
          </h1>
          <p style="margin: 0; font-size: 15px; color: #475569;">
            A new pre-vetted engineer has submitted their Career Passport for <strong>${role}</strong>.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Candidate Name', value: name, icon: '👤' },
          { label: 'Match Rating', value: `${candidateScore} / 100 TalentScore`, icon: '⭐' },
          { label: 'Experience Level', value: escapeHtml(vars.experience || '4+ Years'), icon: '📈' },
          { label: 'Primary Tech Stack', value: escapeHtml(vars.skills || 'TypeScript, Node.js, PostgreSQL'), icon: '🛠️' },
          { label: 'Notice Period', value: escapeHtml(vars.noticePeriod || 'Immediate / 15 Days'), icon: '⏱️' }
        ])}

        ${renderButton('Review Candidate Profile & CV', vars.reviewUrl || `${CANONICAL_URL}/employers/candidates`)}
      `;
      plainText = `New Application for ${role}: ${name}\n\nTalentScore: ${candidateScore}/100\nReview candidate: ${vars.reviewUrl || `${CANONICAL_URL}/employers/candidates`}`;
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 7. RECRUITER OUTREACH (Direct candidate message)
    // ─────────────────────────────────────────────────────────────────────────
    case 'recruiter_outreach': {
      category = 'engagement';
      const recruiterName = escapeHtml(vars.recruiterName || 'A TalentXcel Partner Recruiter');
      const company = escapeHtml(vars.companyName || 'Leading Tech Company');
      subject = vars.subject || `Opportunity from ${company} via TalentXcel`;
      preheader = `${recruiterName} from ${company} sent you a direct outreach message.`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          ${renderBadge('Direct Recruiter Message', 'purple')}
          <h1 class="hero-title" style="margin: 16px 0 10px 0; font-size: 24px; font-weight: 800; color: #0f172a;">
            ${escapeHtml(recruiterName)} Reached Out
          </h1>
          <p style="margin: 0; font-size: 15px; color: #475569;">
            Representing <strong>${company}</strong> on TalentXcel
          </p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 22px; margin: 24px 0;">
          <div style="font-size: 15px; line-height: 24px; color: #1e293b; white-space: pre-line;">
            ${escapeHtml(vars.message || 'Hi, we reviewed your profile on TalentXcel and would love to discuss an exciting engineering opportunity with our team.')}
          </div>
        </div>

        ${renderButton('Reply to Recruiter', vars.ctaUrl || `${CANONICAL_URL}/messages`)}
      `;
      plainText = `Message from ${recruiterName} at ${company}\n\n${vars.message}\n\nReply: ${vars.ctaUrl || `${CANONICAL_URL}/messages`}`;
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 8. CONTACT ENQUIRY (Admin alert for incoming form)
    // ─────────────────────────────────────────────────────────────────────────
    case 'contact_enquiry': {
      category = 'transactional';
      subject = `New Contact Form Message: ${escapeHtml(vars.subject || 'Enquiry')}`;
      preheader = `Enquiry from ${escapeHtml(vars.senderName || 'Visitor')} (${escapeHtml(vars.senderEmail || 'No email')})`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          ${renderBadge('New Contact Enquiry', 'info')}
          <h1 class="hero-title" style="margin: 16px 0 10px 0; font-size: 24px; font-weight: 800; color: #0f172a;">
            Incoming Support / Sales Message
          </h1>
        </div>

        ${renderDataCard([
          { label: 'Sender Name', value: escapeHtml(vars.senderName || 'Visitor'), icon: '👤' },
          { label: 'Sender Email', value: escapeHtml(vars.senderEmail || recipientEmail), icon: '✉️' },
          { label: 'Subject', value: escapeHtml(vars.subject || 'Platform Enquiry'), icon: '💬' },
          { label: 'Received At', value: new Date().toUTCString(), icon: '🕒' }
        ])}

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 22px; margin: 20px 0;">
          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">Message Content:</div>
          <div style="font-size: 15px; line-height: 24px; color: #1e293b; white-space: pre-line;">
            ${escapeHtml(vars.message || 'No message provided.')}
          </div>
        </div>

        ${renderButton('Reply via Email', `mailto:${encodeURIComponent(vars.senderEmail || '')}?subject=Re: ${encodeURIComponent(vars.subject || 'TalentXcel Support')}`)}
      `;
      plainText = `New Enquiry from ${vars.senderName} (${vars.senderEmail})\nSubject: ${vars.subject}\n\n${vars.message}`;
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 9. CONTACT AUTO REPLY (Immediate confirmation to visitor)
    // ─────────────────────────────────────────────────────────────────────────
    case 'contact_auto_reply': {
      category = 'transactional';
      subject = `We received your message — TalentXcel Support ✅`;
      preheader = `Thank you for reaching out. A team member will get back to you within 24 business hours.`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          ${renderBadge('Message Received', 'success')}
          <h1 class="hero-title" style="margin: 16px 0 10px 0; font-size: 24px; font-weight: 800; color: #0f172a;">
            Thank You for Contacting Us, ${name}!
          </h1>
          <p style="margin: 0; font-size: 15px; color: #475569;">
            We have safely received your inquiry. A dedicated member of our support and partnerships team is reviewing your message.
          </p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin: 24px 0;">
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">Your Submission Summary:</div>
          <div style="font-size: 14px; color: #475569; margin-bottom: 4px;">Subject: <strong>${escapeHtml(vars.subject || 'General Inquiry')}</strong></div>
          <div style="font-size: 13px; color: #64748b; margin-top: 8px; font-style: italic;">
            "${escapeHtml(vars.message ? (vars.message.length > 150 ? vars.message.slice(0, 150) + '...' : vars.message) : '')}"
          </div>
        </div>

        <div style="background-color: #eff6ff; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
          <strong style="color: #1e40af; font-size: 14px;">Average Response Time:</strong>
          <p style="margin: 4px 0 0 0; color: #3b82f6; font-size: 13px; line-height: 19px;">
            Our support desk operates Monday through Saturday. You can expect a personalized response within 12 to 24 business hours.
          </p>
        </div>

        ${renderButton('Explore TalentXcel Knowledge Base', `${CANONICAL_URL}`)}
      `;
      plainText = `Thank You for Contacting Us, ${name}!\n\nWe received your message regarding "${vars.subject || 'Inquiry'}".\nOur support team will respond within 24 hours.\n\nExplore: ${CANONICAL_URL}`;
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 10. SECURITY ALERT
    // ─────────────────────────────────────────────────────────────────────────
    case 'security_alert': {
      category = 'transactional';
      const eventType = escapeHtml(vars.eventType || 'New Login / Security Event');
      subject = `Security Notice: ${eventType} on Your TalentXcel Account 🔒`;
      preheader = `We noticed a security event on your TalentXcel account.`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          ${renderBadge('Security Alert', 'warning')}
          <h1 class="hero-title" style="margin: 16px 0 10px 0; font-size: 24px; font-weight: 800; color: #0f172a;">
            Account Security Notice
          </h1>
          <p style="margin: 0; font-size: 15px; color: #475569;">
            Hi ${name}, we detected the following security-related activity on your TalentXcel account:
          </p>
        </div>

        ${renderDataCard([
          { label: 'Activity', value: eventType, icon: '🛡️' },
          { label: 'Date & Time', value: new Date().toUTCString(), icon: '🕒' },
          { label: 'Device / IP', value: escapeHtml(vars.ipAddress || 'Web Client (Verified Session)'), icon: '🌐' },
          { label: 'Location', value: escapeHtml(vars.location || 'India (Approximate)'), icon: '📍' }
        ])}

        <p style="margin: 20px 0; font-size: 14px; line-height: 22px; color: #64748b;">
          If this was you, no action is required. If you did not initiate this action, please secure your account immediately by resetting your password.
        </p>

        ${renderButton('Review Security Settings', `${CANONICAL_URL}/settings/security`, 'dark')}
      `;
      plainText = `Security Notice: ${eventType}\n\nHi ${name},\nActivity was detected on your account at ${new Date().toUTCString()}.\n\nIf this wasn't you, reset your password: ${CANONICAL_URL}/settings/security`;
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FALLBACK GENERIC
    // ─────────────────────────────────────────────────────────────────────────
    default: {
      category = vars.category || 'transactional';
      subject = vars.subject || `Notification from TalentXcel`;
      preheader = vars.preheader || 'Important update from TalentXcel';
      contentHtml = `
        <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
          ${escapeHtml(subject)}
        </h2>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #334155;">
          ${escapeHtml(vars.message || 'You have a new update from TalentXcel.')}
        </p>
        ${vars.ctaUrl ? renderButton(vars.ctaLabel || 'View Details', vars.ctaUrl) : ''}
      `;
      plainText = `${subject}\n\n${vars.message || 'Notification from TalentXcel'}\n\n${vars.ctaUrl || ''}`;
      break;
    }
  }

  const html = wrapInMasterLayout({
    title: subject,
    preheader,
    contentHtml,
    category,
    recipientEmail
  });

  return { subject, preheader, html, plainText, category };
}

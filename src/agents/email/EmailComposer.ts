// src/agents/email/EmailComposer.ts
// Clean, High-Signal Professional Email Template Composer
// Zero hype, zero corporate buzzwords, strict factuality for TalentXcel communications.

export interface ComposedEmail {
  subject: string;
  html: string;
  plainText: string;
}

export class EmailComposer {
  compose(
    templateName: string,
    vars: {
      recipientName?: string;
      companyName?: string;
      roleTitle?: string;
      categoryName?: string;
      scopeName?: string;
      reclaimAmountINR?: number;
      senderDisplayName?: string;
      senderEmail?: string;
      customData?: Record<string, any>;
    }
  ): ComposedEmail {
    const name = vars.recipientName || 'there';
    const company = vars.companyName || 'your company';
    const sender = vars.senderDisplayName || 'TalentXcel Team';

    switch (templateName) {
      // 1. Claim #1 Founding 100 Invitation
      case 'claim1_invitation': {
        const subject = `TalentXcel Claim #1 — Official Founding 100 verification for ${company}`;
        const html = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
            <p>Hi ${name},</p>
            <p>We’ve indexed <strong>${company}</strong> on the <strong>TalentXcel Global AI Product Leaderboard</strong>.</p>
            <p>As an early category leader, your product qualifies for the <strong>Founding 100 Cohort</strong>, locking in a permanent <strong>5% platform fee</strong> (standard: 10%).</p>
            <p>You can claim your profile, verify your listing, and challenge for the #1 spot here:</p>
            <p style="margin: 24px 0;">
              <a href="https://talentxcel.in/claim1/enter" style="background-color: #0284c7; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Claim ${company}'s Ranking →</a>
            </p>
            <p>Best regards,<br><strong>${sender}</strong><br>TalentXcel Executive Office</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0 10px;" />
            <p style="font-size: 11px; color: #94a3b8;">TalentXcel Autonomous Business OS • Reply "STOP" to unsubscribe.</p>
          </div>
        `;
        return { subject, html, plainText: `Hi ${name},\n\nWe've indexed ${company} on TalentXcel Claim #1. Claim your profile: https://talentxcel.in/claim1/enter\n\nBest,\n${sender}` };
      }

      // 2. Claim #1 Immediate Outbid Alert
      case 'claim1_outbid_alert': {
        const amount = vars.reclaimAmountINR ? `₹${vars.reclaimAmountINR.toLocaleString()}` : 'the minimum increment';
        const subject = `⚡ Your rank changed on TalentXcel — Reclaim #1 for ${amount}`;
        const html = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
            <p>Hi ${name},</p>
            <p>Another contender has placed a higher bid on the <strong>${vars.categoryName || 'AI Products'}</strong> leaderboard.</p>
            <p>Your listing for <strong>${company}</strong> has moved down in rank.</p>
            <p>You can reclaim your position immediately for <strong>${amount}</strong>:</p>
            <p style="margin: 24px 0;">
              <a href="https://talentxcel.in/rankings/ai-products" style="background-color: #f97316; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Reclaim #1 Position →</a>
            </p>
            <p>Best regards,<br><strong>${sender}</strong></p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0 10px;" />
            <p style="font-size: 11px; color: #94a3b8;">TalentXcel Real-Time Bidding Engine • Reply "STOP" to unsubscribe.</p>
          </div>
        `;
        return { subject, html, plainText: `Hi ${name},\n\nYour rank for ${company} moved down. Reclaim #1 for ${amount}: https://talentxcel.in/rankings/ai-products\n\n${sender}` };
      }

      // 3. Employer Hiring Discovery Outreach
      case 'employer_discovery': {
        const subject = `Candidate matches for open roles at ${company}`;
        const html = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
            <p>Hi ${name},</p>
            <p>I noticed ${company} is currently expanding its technical engineering team.</p>
            <p>At TalentXcel, we pre-screen and verify software and AI candidates with ATS scores $\\ge 90$ and proof-of-work Career Passports.</p>
            <p>Would you like me to share a shortlist of 5 matching candidates for your open vacancies?</p>
            <p style="margin: 24px 0;">
              <a href="https://talentxcel.in/employers" style="background-color: #0284c7; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">View TalentXcel Employer Portal →</a>
            </p>
            <p>Best regards,<br><strong>${sender}</strong><br>TalentXcel Talent Acquisition</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0 10px;" />
            <p style="font-size: 11px; color: #94a3b8;">TalentXcel Employer Operations • Reply "STOP" to unsubscribe.</p>
          </div>
        `;
        return { subject, html, plainText: `Hi ${name},\n\nI noticed ${company} is hiring technical talent. Can I share 5 pre-screened candidate matches? View portal: https://talentxcel.in/employers\n\nBest,\n${sender}` };
      }

      // 4. College Placement Cell Partnership
      case 'college_partnership': {
        const subject = `Placement & Career Passport collaboration for ${company}`;
        const html = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
            <p>Dear ${name},</p>
            <p>I am reaching out regarding placement readiness and skill verification for the upcoming graduating batch at <strong>${company}</strong>.</p>
            <p>TalentXcel provides accredited higher education institutions with verified AI career pathways, direct employer hiring bridges, and global scholarship intelligence across 1,509 institutions.</p>
            <p>We would welcome the opportunity to share our institutional partnership dossier with your placement cell.</p>
            <p style="margin: 24px 0;">
              <a href="https://talentxcel.in/colleges" style="background-color: #0284c7; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Explore Institutional Pathways →</a>
            </p>
            <p>Warm regards,<br><strong>${sender}</strong><br>TalentXcel University Relations</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0 10px;" />
            <p style="font-size: 11px; color: #94a3b8;">TalentXcel Higher Education Division • Reply "STOP" to unsubscribe.</p>
          </div>
        `;
        return { subject, html, plainText: `Dear ${name},\n\nRegarding placement collaboration for ${company}. Explore pathways: https://talentxcel.in/colleges\n\nWarm regards,\n${sender}` };
      }

      default: {
        const subject = vars.customData?.subject || `Update from TalentXcel regarding ${company}`;
        const html = `<p>Hi ${name},</p><p>${vars.customData?.message || 'Thank you for connecting with TalentXcel.'}</p><p>Best regards,<br><strong>${sender}</strong></p>`;
        return { subject, html, plainText: `Hi ${name},\n\n${vars.customData?.message || 'Update from TalentXcel'}\n\nBest,\n${sender}` };
      }
    }
  }
}

export const coreEmailComposer = new EmailComposer();

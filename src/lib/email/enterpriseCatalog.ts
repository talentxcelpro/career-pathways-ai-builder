/**
 * src/lib/email/enterpriseCatalog.ts
 *
 * TalentXcel Comprehensive 35-Template Platform-Native & Viral Growth Email Suite
 *
 * Designed directly from live TalentXcel Navigation, Explore Mega Menu & Refer & Earn Engine:
 * - Candidate Career OS (Post-Google/LinkedIn SSO)
 * - The Professional Social Network (/network)
 * - Video Reels & Elevator Pitches (/reels)
 * - Resume Builder & ATS Diagnostics (/resume)
 * - Job Search, Government & PSU Openings (/jobs, /government-jobs)
 * - Salary Intelligence & Compensation Benchmarks (/salary)
 * - 10,250+ Colleges & Campus Placement Network (/colleges)
 * - Recruiter OS & Talent Discovery (/employer, /talent)
 * - Learning Hub & Course Credentials (/learning)
 * - Viral Referral & Earn Programs (/refer-and-earn)
 * - Creator Studio & Ambassador Growth Programs (/network/articles)
 *
 * Design Standards:
 * - Apple-Grade Visuals: Transparent logo, #f5f5f7 canvas, clean white card (16px radius), pill buttons.
 * - Privacy Compliant: ZERO physical postal HQ addresses anywhere in the footers.
 * - Deep Links: 100% canonical, registered routes on https://talentxcel.in
 */

import {
  escapeHtml,
  renderButton,
  renderDataCard,
  renderActionTiles,
  wrapInMasterLayout,
  EmailRenderOutput,
  CANONICAL_URL
} from './designSystem.js';

export function renderEnterpriseTemplate(
  templateName: string,
  vars: Record<string, any>,
  recipientEmail: string
): EmailRenderOutput {
  const t = templateName.toLowerCase().trim();
  const name = escapeHtml(vars.name || vars.firstName || vars.candidateName || vars.recipient_name || 'there');
  const email = escapeHtml(recipientEmail);

  let subject = 'Notification from TalentXcel';
  let preheader = 'Important career update from TalentXcel';
  let contentHtml = '';
  let plainText = '';
  let category: 'transactional' | 'engagement' | 'marketing' = 'transactional';

  switch (t) {
    // ═════════════════════════════════════════════════════════════════════════
    // 1. CANDIDATE CAREER OS (1 - 5)
    // ═════════════════════════════════════════════════════════════════════════

    case 'welcome':
    case 'welcome_candidate': {
      category = 'transactional';
      subject = `Welcome to TalentXcel. Your next career chapter starts here.`;
      preheader = 'Your account is active. Access your connected professional ecosystem to build your identity, unlock opportunities and accelerate your career.';

      contentHtml = `
        <div style="margin-bottom: 24px;">
          <div style="font-size: 15px; font-weight: 600; color: #64748b; margin-bottom: 8px;">
            Hi ${name},
          </div>
          <h1 class="hero-title" style="margin: 0 0 14px 0; font-size: 25px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px; line-height: 32px;">
            Welcome to TalentXcel.<br>Your next career chapter starts here.
          </h1>
          <p style="margin: 0 0 12px 0; font-size: 14.5px; line-height: 23px; color: #334155;">
            Your account is now active, and you have access to a connected professional ecosystem designed to help you build your identity, unlock opportunities and accelerate your career.
          </p>
          <p style="margin: 0 0 12px 0; font-size: 14.5px; line-height: 23px; color: #334155; font-style: italic;">
            The world of work is evolving. Your professional journey should evolve with it.
          </p>
          <p style="margin: 0; font-size: 14.5px; line-height: 23px; color: #475569;">
            TalentXcel combines AI-powered career intelligence, professional networking, digital career credentials, job discovery and continuous skill development to help you stay prepared, visible and connected.
          </p>
        </div>

        <div style="margin: 28px 0 14px 0; border-top: 1px solid #e2e8f0; padding-top: 22px;">
          <h2 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px;">
            Everything You Need to Move Your Career Forward
          </h2>
        </div>

        ${renderActionTiles([
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-1.png`,
            title: '01. Build a Stronger Resume',
            description: 'Create professional resumes, analyse ATS compatibility, identify skill and keyword gaps, and tailor your profile to the roles you want.',
            url: 'https://talentxcel.in/resume/ats-check'
          },
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-2.png`,
            title: '02. Create Your Career Passport',
            description: 'Go beyond a traditional CV. Build your digital professional identity with your experience, skills, projects, achievements and certifications.',
            url: 'https://talentxcel.in/passport'
          },
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-3.png`,
            title: '03. Discover Your Next Opportunity',
            description: 'Explore job opportunities across industries, discover relevant roles and take meaningful steps towards your next career move.',
            url: 'https://talentxcel.in/jobs'
          },
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-4.png`,
            title: '04. Navigate Your Career with AI',
            description: 'Get intelligent career guidance, personalised roadmaps, skill-gap analysis, job matching and technical assessments.',
            url: 'https://careers.talentxcel.in/ai-career-hub'
          },
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-5.png`,
            title: '05. Know Your Professional Worth',
            description: 'Explore salary benchmarks, compensation insights and market intelligence to make informed career decisions.',
            url: 'https://salary.talentxcel.in/index-salary.html'
          },
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-6.png`,
            title: '06. Connect with the Professional World',
            description: 'Build meaningful connections with professionals, industry experts, founders and emerging talent. Share knowledge, publish articles and participate in professional discussions.',
            url: 'https://talentxcel.in/network/articles'
          },
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-7.png`,
            title: '07. Prepare. Perform. Progress.',
            description: 'Strengthen your interview skills, improve your professional presentation and build the capabilities needed for long-term career success.',
            url: 'https://talentxcel.in/dashboard'
          }
        ])}

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 22px 20px; margin: 26px 0 22px 0;">
          <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
            Make Your First Move
          </div>
          <p style="margin: 0 0 12px 0; font-size: 13.5px; color: #475569; line-height: 20px;">
            Your TalentXcel journey begins with three simple actions:
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
            <tr>
              <td style="padding: 4px 0; font-size: 13.5px; color: #1e293b; line-height: 20px;">
                <strong style="color: #0071e3;">1.</strong> Complete your professional profile.
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 13.5px; color: #1e293b; line-height: 20px;">
                <strong style="color: #0071e3;">2.</strong> Run your first ATS resume assessment.
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 13.5px; color: #1e293b; line-height: 20px;">
                <strong style="color: #0071e3;">3.</strong> Create your Career Passport.
              </td>
            </tr>
          </table>
          <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 19px;">
            These steps will help you establish a stronger professional presence and get more value from the TalentXcel ecosystem.
          </p>
        </div>

        <div style="text-align: center; margin: 26px 0 8px 0;">
          <p style="margin: 0; font-size: 15px; font-weight: 600; color: #0f172a; line-height: 23px; letter-spacing: -0.2px;">
            Think beyond the resume. Build your professional identity.<br>
            Discover your potential. Create your next opportunity.
          </p>
        </div>

        ${renderButton('GET STARTED WITH TALENTXCEL', `${CANONICAL_URL}/dashboard`)}

        <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 13.5px; line-height: 22px; color: #475569;">
          <p style="margin: 0 0 12px 0;">
            We look forward to being part of your journey.<br>
            <strong style="color: #0f172a;">Team TalentXcel</strong><br>
            <a href="https://talentxcel.in" target="_blank" style="color: #0071e3; text-decoration: none; font-weight: 500;">www.talentxcel.in</a>
          </p>
          <p style="margin: 12px 0 0 0; font-size: 12px; font-weight: 600; color: #64748b; letter-spacing: 0.3px;">
            Your Career. Your Identity. Your Next Opportunity.
          </p>
          <p style="margin: 6px 0 0 0; font-size: 11px; color: #94a3b8; line-height: 16px;">
            This is an automated account welcome email. You received this message because an account was created on TalentXcel.
          </p>
        </div>
      `;

      plainText = `Hi ${name},\n\nWelcome to TalentXcel. Your next career chapter starts here.\n\nYour account is now active, and you have access to a connected professional ecosystem designed to help you build your identity, unlock opportunities and accelerate your career.\n\nThe world of work is evolving. Your professional journey should evolve with it.\n\nTalentXcel combines AI-powered career intelligence, professional networking, digital career credentials, job discovery and continuous skill development to help you stay prepared, visible and connected.\n\nEverything You Need to Move Your Career Forward:\n\n01. Build a Stronger Resume: https://talentxcel.in/resume/ats-check\n02. Create Your Career Passport: https://talentxcel.in/passport\n03. Discover Your Next Opportunity: https://talentxcel.in/jobs\n04. Navigate Your Career with AI: https://careers.talentxcel.in/ai-career-hub\n05. Know Your Professional Worth: https://salary.talentxcel.in/index-salary.html\n06. Connect with the Professional World: https://talentxcel.in/network/articles\n07. Prepare. Perform. Progress.: https://talentxcel.in/dashboard\n\nMake Your First Move:\n1. Complete your professional profile.\n2. Run your first ATS resume assessment.\n3. Create your Career Passport.\n\nThink beyond the resume. Build your professional identity. Discover your potential. Create your next opportunity.\n\nGET STARTED WITH TALENTXCEL: https://talentxcel.in/dashboard\n\nWe look forward to being part of your journey.\nTeam TalentXcel\nwww.talentxcel.in\n\nYour Career. Your Identity. Your Next Opportunity.\nThis is an automated account welcome email.`;
      break;
    }

    case 'profile_incomplete':
    case 'profile_completion_reminder': {
      category = 'engagement';
      const completeness = escapeHtml(vars.completeness || '65%');
      const missingSection = escapeHtml(vars.missingSection || 'Portfolio, Key Projects & Work Highlights');
      subject = `Complete your TalentXcel profile to unlock 3x recruiter search visibility`;
      preheader = `Your profile is at ${completeness}. Adding ${missingSection} gives you priority visibility with top hiring managers and recruiters.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Your profile is ${completeness} complete, ${name}.
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Candidates with completed Career Passports receive 3.4x more recruiter profile views and direct connection requests.
          </p>
        </div>

        ${renderActionTiles([
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-2.png`,
            title: 'Complete Your Career Passport',
            description: 'Add verified achievements, project case studies, and certifications to reach 100% completeness.',
            url: `${CANONICAL_URL}/passport`
          }
        ])}

        ${renderDataCard([
          { label: 'Current Completeness', value: completeness },
          { label: 'Recommended Next Step', value: missingSection },
          { label: 'Est. Completion Time', value: '2 Minutes' },
          { label: 'Search Visibility Impact', value: '+240% Priority Rank' }
        ])}

        ${renderButton('Complete Your Profile', `${CANONICAL_URL}/profile/edit`)}
      `;

      plainText = `Hi ${name}, your TalentXcel profile is ${completeness} complete. Complete ${missingSection} to boost recruiter views: ${CANONICAL_URL}/profile/edit`;
      break;
    }

    case 'career_map_ready': {
      category = 'engagement';
      const targetRole = escapeHtml(vars.targetRole || 'Strategy & Operations Director');
      const timeHorizon = escapeHtml(vars.timeHorizon || '3-5 Years');
      const skillGaps = escapeHtml(vars.skillGaps || 'Enterprise Cross-Functional Leadership, P&L Modeling, Growth Strategy');
      const ctcCorridor = escapeHtml(vars.ctcCorridor || '₹35L - ₹55L PA');
      subject = `Your AI Career Pathway Roadmap is Ready: ${targetRole} 🧭`;
      preheader = `We analyzed 10,000+ career trajectories to chart your fastest path to ${targetRole}.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Your Career Pathway to ${targetRole}
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Our Career Pathway intelligence engine generated a milestone-by-milestone roadmap for your skills.
          </p>
        </div>

        ${renderActionTiles([
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-4.png`,
            title: 'Explore AI Milestone Roadmap',
            description: 'View personalized skill bridges, execution milestones, and compensation benchmark corridors.',
            url: `${CANONICAL_URL}/ai-career-map`
          }
        ])}

        ${renderDataCard([
          { label: 'Target Role', value: targetRole },
          { label: 'Target Horizon', value: timeHorizon },
          { label: 'Core Skill Gaps', value: skillGaps },
          { label: 'Target CTC Corridor', value: ctcCorridor }
        ])}

        ${renderButton('Explore Your AI Career Roadmap', `${CANONICAL_URL}/ai-career-map`)}
      `;

      plainText = `Hi ${name}, your AI Career Roadmap to ${targetRole} is ready. View milestones: ${CANONICAL_URL}/ai-career-map`;
      break;
    }

    case 'career_passport_verified': {
      category = 'transactional';
      const badgeTitle = escapeHtml(vars.badgeTitle || 'Professional Domain Excellence & Leadership');
      const passportId = escapeHtml(vars.passportId || 'TXC-PASS-84920');
      subject = `Career Passport Verified: ${badgeTitle} ✅`;
      preheader = 'Your verified credentials, achievements and skill benchmarks are active on TalentXcel.';

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Career Passport Verified
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Congratulations, ${name}. Your career profile and achievements have received an authenticated verification badge.
          </p>
        </div>

        ${renderActionTiles([
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-2.png`,
            title: 'Cryptographic Career Passport',
            description: 'Your verified credentials and achievements are tamper-proof and shareable directly with hiring leaders.',
            url: `${CANONICAL_URL}/passport`
          }
        ])}

        ${renderDataCard([
          { label: 'Passport Credential ID', value: passportId },
          { label: 'Verified Competency', value: badgeTitle },
          { label: 'Verification Standard', value: 'Proof-of-Work & Peer Audit' },
          { label: 'Recruiter Badge Status', value: 'Active on Network' }
        ])}

        ${renderButton('View Verified Career Passport', `${CANONICAL_URL}/passport`)}
      `;

      plainText = `Hi ${name}, your Career Passport (${passportId}) is verified for ${badgeTitle}. View: ${CANONICAL_URL}/passport`;
      break;
    }

    case 'weekly_summary':
    case 'weekly_candidate_digest': {
      category = 'engagement';
      const views = escapeHtml(vars.views || '48');
      const appearances = escapeHtml(vars.appearances || '134');
      const matches = escapeHtml(vars.matches || '12');
      subject = `Your TalentXcel Weekly Network & Career Digest 📊`;
      preheader = `${views} recruiter views, ${appearances} search appearances, and ${matches} new matching jobs this week.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Your Weekly Activity Summary
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Here is how your profile and network performed across TalentXcel this past week:
          </p>
        </div>

        ${renderDataCard([
          { label: 'Recruiter Profile Views', value: `${views} Views` },
          { label: 'Talent Search Appearances', value: `${appearances} Times` },
          { label: 'New Curated Role Matches', value: `${matches} Verified Jobs` },
          { label: 'Most In-Demand Stack', value: 'Go, PostgreSQL, Kubernetes' }
        ])}

        ${renderButton('Open Your Career Dashboard', `${CANONICAL_URL}/dashboard`)}
      `;

      plainText = `Hi ${name}, here is your weekly summary:\n- Recruiter Views: ${views}\n- Search Appearances: ${appearances}\n- New Matches: ${matches}\n\nView details: ${CANONICAL_URL}/dashboard`;
      break;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 2. THE PROFESSIONAL SOCIAL NETWORK (/network) (6 - 13)
    // ═════════════════════════════════════════════════════════════════════════

    case 'connection_request':
    case 'new_connection': {
      category = 'engagement';
      const sender = escapeHtml(vars.senderName || vars.requester_name || 'Vikram Rao');
      const senderTitle = escapeHtml(vars.senderTitle || vars.requester_title || 'Lead Architect at Razorpay');
      subject = `${sender} wants to connect with you on TalentXcel 🤝`;
      preheader = `${sender} (${senderTitle}) sent you a connection request.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            New Connection Request
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            <strong>${sender}</strong> would like to connect with you on the TalentXcel professional network.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Member', value: sender },
          { label: 'Current Role', value: senderTitle },
          { label: 'Mutual Tech Focus', value: 'Cloud Infrastructure & High-Scale APIs' },
          { label: 'Network Location', value: 'Bengaluru, India' }
        ])}

        ${renderButton('View & Respond to Request', `${CANONICAL_URL}/network/requests`)}
      `;

      plainText = `${sender} (${senderTitle}) wants to connect with you on TalentXcel: ${CANONICAL_URL}/network/requests`;
      break;
    }

    case 'connection_accepted': {
      category = 'engagement';
      const connectionName = escapeHtml(vars.connectionName || vars.name || 'Sneha Roy');
      const connectionTitle = escapeHtml(vars.connectionTitle || 'Director of Commercial Growth & Operations');
      subject = `${connectionName} accepted your connection request! 🎉`;
      preheader = `You and ${connectionName} are now connected on TalentXcel. Start a conversation.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Connection Request Accepted
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            <strong>${connectionName}</strong> has accepted your connection request. Your professional network just expanded.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Connected With', value: connectionName },
          { label: 'Role', value: connectionTitle },
          { label: 'Network Access', value: 'Direct Messaging & Profile Collaboration' }
        ])}

        ${renderButton('Send a Message', `${CANONICAL_URL}/network/messages`)}
      `;

      plainText = `Hi ${name}, ${connectionName} accepted your connection request! Send a message: ${CANONICAL_URL}/network/messages`;
      break;
    }

    case 'direct_message':
    case 'message_notification': {
      category = 'engagement';
      const sender = escapeHtml(vars.senderName || 'Rahul Deshmukh');
      const preview = escapeHtml(vars.messagePreview || 'Hi! Loved your recent insights on market expansion and leadership roadmaps. Would love to collaborate and exchange notes...');
      subject = `New message from ${sender} on TalentXcel 💬`;
      preheader = `"${preview.slice(0, 80)}..."`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            You have a new message
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            <strong>${sender}</strong> sent you a direct message on TalentXcel.
          </p>
        </div>

        <div style="background-color: #f5f5f7; border-left: 4px solid #0071e3; border-radius: 8px; padding: 18px 20px; margin: 24px 0; font-size: 14px; line-height: 22px; color: #1d1d1f; font-style: italic;">
          "${preview}"
        </div>

        ${renderButton('Reply to Message', `${CANONICAL_URL}/network/messages`)}
      `;

      plainText = `New message from ${sender}: "${preview}"\n\nReply here: ${CANONICAL_URL}/network/messages`;
      break;
    }

    case 'mention_notification': {
      category = 'engagement';
      const author = escapeHtml(vars.authorName || 'Karthik Raja');
      const postTitle = escapeHtml(vars.postTitle || 'Navigating Industry Transformations & High-Impact Execution');
      subject = `${author} mentioned you in a discussion on TalentXcel 📣`;
      preheader = `${author} tagged you in "${postTitle}". Join the conversation.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            You were mentioned by ${author}
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            ${author} mentioned you in a professional post: <strong>"${postTitle}"</strong>.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Post Discussion', value: postTitle },
          { label: 'Mentioned By', value: author },
          { label: 'Channel', value: escapeHtml(vars.channel || 'Industry Leadership & Strategic Discussions') }
        ])}

        ${renderButton('View Discussion & Reply', `${CANONICAL_URL}/network/posts`)}
      `;

      plainText = `${author} mentioned you in "${postTitle}". View post: ${CANONICAL_URL}/network/posts`;
      break;
    }

    case 'event_invitation': {
      category = 'engagement';
      const eventTitle = escapeHtml(vars.eventTitle || 'Global Leadership Roundtable: Navigating Industry Evolution');
      const host = escapeHtml(vars.hostName || 'TalentXcel Executive Network');
      const eventDate = escapeHtml(vars.eventDate || 'Saturday, 14 Nov 2026, 6:00 PM IST');
      subject = `Event Invitation: ${eventTitle} 🗓️`;
      preheader = `You're invited to join ${eventTitle} hosted by ${host}.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            ${eventTitle}
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            You are invited to an interactive live roundtable and AMA hosted by ${host}.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Event', value: eventTitle },
          { label: 'Date & Time', value: eventDate },
          { label: 'Format', value: 'Live Virtual Session & Interactive Q&A' },
          { label: 'Host', value: host }
        ])}

        ${renderButton('RSVP & Reserve Your Seat', `${CANONICAL_URL}/network/events`)}
      `;

      plainText = `You're invited to "${eventTitle}" on ${eventDate}. RSVP here: ${CANONICAL_URL}/network/events`;
      break;
    }

    case 'community_invite': {
      category = 'engagement';
      const communityName = escapeHtml(vars.communityName || 'Global Strategy & Operations Leadership Guild');
      const memberCount = escapeHtml(vars.memberCount || '3,420 Verified Professionals');
      subject = `You're invited to join ${communityName} 👥`;
      preheader = `Connect with ${memberCount} sharing industry insights and leadership opportunities.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Join ${communityName}
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Based on your professional profile and credentials, you've been invited to join this private leadership circle.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Community', value: communityName },
          { label: 'Members', value: memberCount },
          { label: 'Primary Topics', value: escapeHtml(vars.primaryTopics || 'Strategic Leadership, Market Expansion, Operational Excellence') },
          { label: 'Moderation', value: 'Verified Industry Leaders Only' }
        ])}

        ${renderButton('Accept Community Invite', `${CANONICAL_URL}/network/communities`)}
      `;

      plainText = `You're invited to join ${communityName}. Join here: ${CANONICAL_URL}/network/communities`;
      break;
    }

    case 'skill_swap_request': {
      category = 'engagement';
      const peerName = escapeHtml(vars.peerName || 'Ananya Sen');
      const offeringSkill = escapeHtml(vars.offeringSkill || 'Brand Strategy & Commercial Growth');
      const seekingSkill = escapeHtml(vars.seekingSkill || 'Executive Financial Modeling & Analytics');
      subject = `Skill Swap Request from ${peerName}: ${offeringSkill} ⇄ ${seekingSkill} 🔄`;
      preheader = `${peerName} wants to swap 1-on-1 professional knowledge sessions with you.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            New Skill Swap Request
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            <strong>${peerName}</strong> noticed your expertise in <strong>${seekingSkill}</strong> and would like to exchange professional insights.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Peer Member', value: peerName },
          { label: 'Offers Knowledge In', value: offeringSkill },
          { label: 'Interested in Learning', value: seekingSkill },
          { label: 'Format', value: '45-Min Peer Exchange Session' }
        ])}

        ${renderButton('Review Skill Swap Request', `${CANONICAL_URL}/network/skill-swap`)}
      `;

      plainText = `${peerName} wants to swap skills (${offeringSkill} for ${seekingSkill}). Review: ${CANONICAL_URL}/network/skill-swap`;
      break;
    }

    case 'post_trending': {
      category = 'engagement';
      const postTitle = escapeHtml(vars.postTitle || 'Frameworks for Scaling High-Performing Multi-Disciplinary Teams');
      const impressionCount = escapeHtml(vars.impressionCount || '8,920 Impressions');
      subject = `Your post is trending on TalentXcel! 🔥`;
      preheader = `"${postTitle}" just passed ${impressionCount} across the professional feed.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Your post is gaining traction!
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Your publication <strong>"${postTitle}"</strong> has been featured on the network homepage.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Publication', value: postTitle },
          { label: 'Total Reach', value: impressionCount },
          { label: 'Community Reactions', value: '430+ Endorsements & 84 Comments' },
          { label: 'New Followers Gained', value: '+38 Industry Peers' }
        ])}

        ${renderButton('View Post & Engage with Readers', `${CANONICAL_URL}/network/posts`)}
      `;

      plainText = `Your post "${postTitle}" is trending with ${impressionCount}. View analytics: ${CANONICAL_URL}/network/posts`;
      break;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 3. REELS & VIDEO INTROS (/reels) (14)
    // ═════════════════════════════════════════════════════════════════════════

    case 'reel_activity_alert': {
      category = 'engagement';
      const company = escapeHtml(vars.companyName || 'Atlassian India');
      const reelTitle = escapeHtml(vars.reelTitle || '30-Sec Pitch: Distributed Systems & Raft Consensus');
      const watchTime = escapeHtml(vars.watchTime || '100% Full Watch');
      subject = `A recruiter from ${company} watched your Video Reel 🎬`;
      preheader = `${company} reviewed your 30-second elevator pitch on TalentXcel Reels.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Recruiter Watched Your Reel
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            A verified hiring team from <strong>${company}</strong> watched your video elevator pitch: <strong>"${reelTitle}"</strong>.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Interested Company', value: company },
          { label: 'Reel Highlight', value: reelTitle },
          { label: 'Engagement Level', value: watchTime },
          { label: 'Recruiter Action', value: 'Saved to Candidate Shortlist' }
        ])}

        ${renderButton('Manage Your Reels & Pitches', `${CANONICAL_URL}/reels`)}
      `;

      plainText = `A recruiter from ${company} watched your video reel "${reelTitle}". Manage reels: ${CANONICAL_URL}/reels`;
      break;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 4. RESUME BUILDER & ATS DIAGNOSTICS (/resume) (15 - 17)
    // ═════════════════════════════════════════════════════════════════════════

    case 'resume_created': {
      category = 'transactional';
      const resumeTitle = escapeHtml(vars.resumeTitle || 'Senior Backend Engineer (Go/Distributed Systems)');
      subject = `Resume Created Successfully: ${resumeTitle} 📄`;
      preheader = 'Your ATS-optimized resume has been generated and is ready to download.';

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Resume Created Successfully
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Your resume <strong>${resumeTitle}</strong> is saved and formatted with clean parsing typography for company applicant tracking systems.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Resume Name', value: resumeTitle },
          { label: 'Format Compatibility', value: 'PDF & Clean Text Parsing' },
          { label: 'ATS Optimization Status', value: 'Scored & Ready' }
        ])}

        ${renderButton('Edit & Download Resume', `${CANONICAL_URL}/resume/builder`)}
      `;

      plainText = `Your resume "${resumeTitle}" is ready. Download it here: ${CANONICAL_URL}/resume/builder`;
      break;
    }

    case 'ats_score_ready':
    case 'resume_feedback': {
      category = 'transactional';
      const score = escapeHtml(vars.score || '88/100');
      const targetRole = escapeHtml(vars.targetRole || 'Senior Operations & Strategy Lead');
      subject = `ATS Resume Diagnostic Ready: ${score} Score for ${targetRole} 🎯`;
      preheader = `Detailed keyword parse analysis, formatting check, and suggestions are ready.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            ATS Diagnostic Score: ${score}
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Here is how your resume parsed against current hiring benchmarks for <strong>${targetRole}</strong>:
          </p>
        </div>

        ${renderActionTiles([
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-1.png`,
            title: 'Deep ATS Diagnostic & Keyword Optimizer',
            description: 'Review parsing integrity, skill gap analysis, and tailored recommendations for target roles.',
            url: `${CANONICAL_URL}/resume/ats-check`
          }
        ])}

        ${renderDataCard([
          { label: 'Overall Score', value: score },
          { label: 'Keyword Alignment', value: escapeHtml(vars.keywordAlignment || 'Strong (P&L Management, Strategic Planning, Operations)') },
          { label: 'Missing High-Value Tags', value: escapeHtml(vars.missingTags || 'Cross-Functional Governance, Financial Modeling, OKRs') },
          { label: 'Parse Integrity', value: '100% Machine-Readable' }
        ])}

        ${renderButton('View Full ATS Breakdown', `${CANONICAL_URL}/resume/ats-check`)}
      `;

      plainText = `Your ATS Resume score for ${targetRole} is ${score}. View diagnostic breakdown: ${CANONICAL_URL}/resume/ats-check`;
      break;
    }

    case 'resume_viewed':
    case 'resume_viewed_alert': {
      category = 'engagement';
      const company = escapeHtml(vars.companyName || 'PhonePe');
      const location = escapeHtml(vars.location || 'Bengaluru');
      const targetDomain = escapeHtml(vars.targetDomain || 'leadership & specialist');
      subject = `A recruiter from ${company} viewed your Career Profile 👀`;
      preheader = `Your resume appeared in a recruiter candidate search for senior ${targetDomain} roles.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Recruiter Profile View
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            A verified hiring team member from <strong>${company}</strong> (${location}) inspected your Career Passport and resume.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Interested Company', value: company },
          { label: 'Search Corridor', value: location },
          { label: 'Primary Match Domain', value: escapeHtml(vars.matchDomain || 'Commercial Growth & Operations Leadership') },
          { label: 'Activity Time', value: 'Today' }
        ])}

        ${renderButton('View Profile Insights & Analytics', `${CANONICAL_URL}/network/analytics`)}
      `;

      plainText = `A recruiter from ${company} viewed your Career Profile. View analytics: ${CANONICAL_URL}/network/analytics`;
      break;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 5. JOBS, GOVERNMENT & DIRECT APPLICATIONS (18 - 21)
    // ═════════════════════════════════════════════════════════════════════════

    case 'job_match_alert':
    case 'job_opening': {
      category = 'engagement';
      const role = escapeHtml(vars.role || 'Senior Growth & Commercial Director');
      const company = escapeHtml(vars.company || 'Razorpay');
      const salary = escapeHtml(vars.salary || '₹40L - ₹55L PA');
      subject = `New Job Match: ${role} at ${company} 💼`;
      preheader = `Matches 92% of your verified skills. View verified compensation benchmarks.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            ${role}
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            A new role matching your professional background and domain expertise was published by <strong>${company}</strong>.
          </p>
        </div>

        ${renderActionTiles([
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-3.png`,
            title: 'Curated Opportunity & Fast-Track Application',
            description: 'Direct recruiter pipeline with priority review for candidates with completed Career Passports.',
            url: `${CANONICAL_URL}/jobs`
          }
        ])}

        ${renderDataCard([
          { label: 'Company', value: company },
          { label: 'Compensation Band', value: salary },
          { label: 'Location', value: 'Bengaluru / Hybrid' },
          { label: 'Skill Match Score', value: '92% Compatibility' }
        ])}

        ${renderButton('View Job & Apply Directly', `${CANONICAL_URL}/jobs`)}
      `;

      plainText = `Job Match: ${role} at ${company} (${salary}). View and apply: ${CANONICAL_URL}/jobs`;
      break;
    }

    case 'gov_job_alert': {
      category = 'engagement';
      const org = escapeHtml(vars.org || 'ISRO / Department of Space');
      const post = escapeHtml(vars.post || 'Scientist / Engineer ‘SC’ (Computer Science)');
      const payScale = escapeHtml(vars.payScale || 'Level 10 (₹56,100 - ₹1,77,500)');
      const lastDate = escapeHtml(vars.lastDate || '28 Nov 2026');
      subject = `Government Job Alert: ${post} at ${org} 🏛️`;
      preheader = `New PSU / Central Technical notification released. Applications close ${lastDate}.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            ${post}
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            A new official technical recruitment notification has been published by <strong>${org}</strong>.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Organization', value: org },
          { label: 'Cadre / Role', value: post },
          { label: 'Pay Band / Scale', value: payScale },
          { label: 'Application Deadline', value: lastDate }
        ])}

        ${renderButton('View Official Notification & Syllabus', `${CANONICAL_URL}/government-jobs`)}
      `;

      plainText = `Government Job Alert: ${post} at ${org}. Deadline: ${lastDate}. View: ${CANONICAL_URL}/government-jobs`;
      break;
    }

    case 'application_confirmation':
    case 'application_received': {
      category = 'transactional';
      const role = escapeHtml(vars.role || 'Lead Frontend Architect');
      const company = escapeHtml(vars.company || 'CRED');
      const appId = escapeHtml(vars.applicationId || 'TXC-APP-99412');
      subject = `Application Submitted: ${role} at ${company} ✅`;
      preheader = `Application ID: ${appId}. Your profile has been sent to the hiring team.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Application Confirmed
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Your application for <strong>${role}</strong> at <strong>${company}</strong> was delivered directly to the employer workspace.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Role Applied', value: role },
          { label: 'Company', value: company },
          { label: 'Application ID', value: appId },
          { label: 'Status', value: 'Under Review by Hiring Team' }
        ])}

        ${renderButton('Track Your Applications', `${CANONICAL_URL}/jobs/my-applications`)}
      `;

      plainText = `Your application for ${role} at ${company} was submitted. Application ID: ${appId}. Track: ${CANONICAL_URL}/jobs/my-applications`;
      break;
    }

    case 'saved_job_reminder':
    case 'saved_job_closing_soon': {
      category = 'engagement';
      const role = escapeHtml(vars.role || 'Senior Growth & Commercial Director');
      const company = escapeHtml(vars.company || 'Groww');
      const deadline = escapeHtml(vars.deadline || '48 Hours');
      subject = `Saved Job Closing Soon: ${role} at ${company} ⏰`;
      preheader = `Applications close in ${deadline}. Don't miss this opportunity.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Application Closing Soon
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Your saved opening for <strong>${role}</strong> at <strong>${company}</strong> is closing soon.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Position', value: role },
          { label: 'Company', value: company },
          { label: 'Deadline Remaining', value: deadline },
          { label: 'Submission Mode', value: '1-Click Apply with Career Passport' }
        ])}

        ${renderButton('Submit Application Now', `${CANONICAL_URL}/jobs`)}
      `;

      plainText = `Your saved job ${role} at ${company} closes in ${deadline}. Apply here: ${CANONICAL_URL}/jobs`;
      break;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 6. SALARY INTELLIGENCE & BENCHMARKS (/salary) (22)
    // ═════════════════════════════════════════════════════════════════════════

    case 'salary_benchmark_digest': {
      category = 'engagement';
      const domain = escapeHtml(vars.domain || vars.techStack || 'Strategy, Product Operations & Commercial Leadership');
      const percentile = escapeHtml(vars.percentile || 'Top 15% (75th Percentile)');
      const medianBand = escapeHtml(vars.medianBand || '₹35L - ₹52L PA');
      subject = `Industry Salary Benchmark: Where Your Experience Ranks 📈`;
      preheader = `National median compensation benchmarks for ${domain} are updated.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Professional Salary Benchmark Digest
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Based on verified platform data, here is the updated salary band for <strong>${domain}</strong>:
          </p>
        </div>

        ${renderActionTiles([
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-5.png`,
            title: 'Real-Time Salary Insights & Percentile Simulator',
            description: 'Compare compensation percentiles, bonus structures, and market compensation corridors across industries.',
            url: `${CANONICAL_URL}/salary`
          }
        ])}

        ${renderDataCard([
          { label: 'Domain & Skill Focus', value: domain },
          { label: 'Your Estimated Bracket', value: percentile },
          { label: 'Market 75th Percentile', value: medianBand },
          { label: 'Highest Paying Corridor', value: 'Bengaluru / Mumbai / National Metros' }
        ])}

        ${renderButton('Explore Salary Analyzer & Simulator', `${CANONICAL_URL}/salary`)}
      `;

      plainText = `Salary Benchmark for ${domain}: 75th percentile is ${medianBand}. View analyzer: ${CANONICAL_URL}/salary`;
      break;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 7. COLLEGES & CAMPUS PLACEMENT DRIVES (/colleges) (23 - 24)
    // ═════════════════════════════════════════════════════════════════════════

    case 'college_placement_alert': {
      category = 'engagement';
      const driveRole = escapeHtml(vars.driveRole || 'Graduate Software Development Engineer');
      const hiringCompany = escapeHtml(vars.hiringCompany || 'Cisco Systems');
      const eligibility = escapeHtml(vars.eligibility || 'B.Tech / M.Tech 2026 Batch (CGPA 7.5+)');
      subject = `Campus Placement Drive Alert: ${driveRole} at ${hiringCompany} 🎓`;
      preheader = `Exclusive drive open for verified college candidates. Eligible: ${eligibility}.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Campus Hiring Drive: ${hiringCompany}
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            A direct campus recruitment drive is accepting applications through the TalentXcel College Network.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Hiring Company', value: hiringCompany },
          { label: 'Role Offered', value: driveRole },
          { label: 'Eligible Batches', value: eligibility },
          { label: 'Compensation Package', value: '₹18L - ₹24L CTC' }
        ])}

        ${renderButton('View College Placement Drive', `${CANONICAL_URL}/colleges`)}
      `;

      plainText = `Campus Drive: ${driveRole} at ${hiringCompany}. Eligible: ${eligibility}. Apply: ${CANONICAL_URL}/colleges`;
      break;
    }

    case 'college_partnership_welcome': {
      category = 'transactional';
      const collegeName = escapeHtml(vars.collegeName || 'National Institute of Technology');
      subject = `Welcome to TalentXcel Campus Portal, ${collegeName} 🎓`;
      preheader = 'Your institutional placement cell workspace is ready to connect students with verified corporate hiring partners & recruiters.';

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Welcome, ${collegeName}
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Your college placement director portal is active on the TalentXcel Institutional Network.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Institution', value: collegeName },
          { label: 'Verified Student Profiles', value: 'Ready for Onboarding' },
          { label: 'Corporate Sourcing Hub', value: 'Connected to 500+ Hiring Partners' }
        ])}

        ${renderButton('Open Placement Cell Portal', `${CANONICAL_URL}/colleges`)}
      `;

      plainText = `Welcome ${collegeName} to TalentXcel Campus Portal! Access: ${CANONICAL_URL}/colleges`;
      break;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 8. RECRUITER OS & TALENT DISCOVERY (/employer, /talent) (25 - 28)
    // ═════════════════════════════════════════════════════════════════════════

    case 'employer_welcome': {
      category = 'transactional';
      const companyName = escapeHtml(vars.companyName || 'FinTech Velocity');
      subject = `Welcome to TalentXcel Recruiter OS, ${companyName} 🚀`;
      preheader = 'Your company hiring workspace is active. Start sourcing verified professional talent.';

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 16px 0 10px 0; font-size: 24px; font-weight: 700; color: #111827;">
            Welcome to Recruiter OS, ${companyName}
          </h1>
          <p style="margin: 0; font-size: 15px; line-height: 24px; color: #4b5563;">
            Your employer workspace is configured. Post verified openings, search pre-vetted candidate profiles across industries, and receive qualified applicants.
          </p>
        </div>

        ${renderActionTiles([
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-6.png`,
            title: 'Search Pre-Vetted Talent Pool',
            description: 'Filter verified candidates by domain expertise, performance percentile, and availability.',
            url: `${CANONICAL_URL}/talent`
          },
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-3.png`,
            title: 'Post a Verified Opening',
            description: 'Publish open roles syndicated directly to 100,000+ verified professionals across sectors.',
            url: `${CANONICAL_URL}/employer/post-job`
          },
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-5.png`,
            title: 'Launch Pipeline Intelligence',
            description: 'Track candidate flow, scorecards, and team reviews in your employer ATS dashboard.',
            url: `${CANONICAL_URL}/employer/dashboard`
          }
        ])}

        ${renderButton('Open Employer Workspace', `${CANONICAL_URL}/employer/dashboard`)}
      `;

      plainText = `Welcome ${companyName} to TalentXcel Recruiter OS! Access your dashboard: ${CANONICAL_URL}/employer/dashboard`;
      break;
    }

    case 'talent_discovery_alert': {
      category = 'engagement';
      const searchCriteria = escapeHtml(vars.searchCriteria || 'Senior Strategy & Operations Directors (Bengaluru / Hybrid)');
      const candidateCount = escapeHtml(vars.candidateCount || '14 Verified Profiles');
      subject = `Talent Discovery Alert: ${candidateCount} matching your sourcing filter 🎯`;
      preheader = `New verified professionals matching "${searchCriteria}" joined the network this week.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            New Candidates Matching Your Sourcing Filter
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Our automated talent discovery engine found candidates matching your saved recruiter search:
          </p>
        </div>

        ${renderDataCard([
          { label: 'Saved Filter', value: searchCriteria },
          { label: 'New Matching Candidates', value: candidateCount },
          { label: 'Average ATS TalentScore', value: '91/100' },
          { label: 'Notice Period', value: 'Immediate to 30 Days' }
        ])}

        ${renderButton('Discover Candidates in Recruiter OS', `${CANONICAL_URL}/talent`)}
      `;

      plainText = `Talent Discovery: ${candidateCount} matching "${searchCriteria}". View candidate pool: ${CANONICAL_URL}/talent`;
      break;
    }

    case 'new_candidate_applied':
    case 'new_applicant': {
      category = 'transactional';
      const candidate = escapeHtml(vars.candidateName || 'Arjun Mehta');
      const role = escapeHtml(vars.role || 'Senior Growth & Commercial Director');
      const talentScore = escapeHtml(vars.talentScore || '94/100');
      subject = `New Application: ${candidate} applied for ${role} 📥`;
      preheader = `TalentScore Match: ${talentScore}. View verified credentials, achievements and resume.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            New Applicant: ${candidate}
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            A candidate submitted their verified application for your <strong>${role}</strong> opening.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Applicant', value: candidate },
          { label: 'Role', value: role },
          { label: 'ATS TalentScore', value: talentScore },
          { label: 'Verified Experience', value: escapeHtml(vars.experience || '8+ Years (Domain Leadership)') }
        ])}

        ${renderButton('Review Candidate in Dashboard', `${CANONICAL_URL}/employer/jobs`)}
      `;

      plainText = `${candidate} applied for ${role} (TalentScore: ${talentScore}). Review: ${CANONICAL_URL}/employer/jobs`;
      break;
    }

    case 'job_post_live': {
      category = 'transactional';
      const jobTitle = escapeHtml(vars.jobTitle || 'Commercial Operations Director');
      const location = escapeHtml(vars.location || 'Bengaluru');
      subject = `Job Listing is Live: ${jobTitle} 🌐`;
      preheader = `Your listing is published across TalentXcel and matching candidates are being notified.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            ${jobTitle} is Live
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Your opening is syndicated and active across the TalentXcel talent network.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Position', value: jobTitle },
          { label: 'Location', value: location },
          { label: 'Syndication', value: 'TalentXcel Hub & Google Jobs' },
          { label: 'Matching Candidates', value: 'Notification Batch Enqueued' }
        ])}

        ${renderButton('Manage Job Postings', `${CANONICAL_URL}/employer/jobs`)}
      `;

      plainText = `Your job listing "${jobTitle}" is live on TalentXcel. Manage: ${CANONICAL_URL}/employer/jobs`;
      break;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 9. LEARNING HUB & CREDENTIALS (/learning) (29 - 30)
    // ═════════════════════════════════════════════════════════════════════════

    case 'course_recommendation': {
      category = 'engagement';
      const course = escapeHtml(vars.courseTitle || 'Enterprise Leadership & High-Growth Strategy');
      const targetDelta = escapeHtml(vars.ctcDelta || '+₹8L PA Salary Potential');
      subject = `Recommended Skill Track: ${course} 📚`;
      preheader = `Bridge your strategic skill gap and unlock higher senior compensation bands.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Recommended Skill Track
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Based on your career roadmap, mastering <strong>${course}</strong> bridges your next career milestone.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Recommended Course', value: course },
          { label: 'Target Career Impact', value: targetDelta },
          { label: 'Curated Provider', value: 'TalentXcel Learning Hub' },
          { label: 'Format', value: 'Hands-on Lab & Capstone Project' }
        ])}

        ${renderButton('Explore Skill Course', `${CANONICAL_URL}/learning`)}
      `;

      plainText = `Recommended Course: ${course} (${targetDelta}). Explore: ${CANONICAL_URL}/learning`;
      break;
    }

    case 'certificate_ready': {
      category = 'transactional';
      const certTitle = escapeHtml(vars.certificateTitle || 'Strategic Leadership & Operations Management');
      const certId = escapeHtml(vars.certificateId || 'TXC-CERT-2026-8812');
      subject = `Verifiable Certificate Ready: ${certTitle} 🏅`;
      preheader = `Certificate ID: ${certId}. Add your verified credential to your Career Passport.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Certificate of Completion Ready
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Congratulations on completing your assessment in <strong>${certTitle}</strong>!
          </p>
        </div>

        ${renderActionTiles([
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-2.png`,
            title: 'Verifiable Digital Certificate',
            description: 'Authenticated completion credential added to your Career Passport and LinkedIn profile.',
            url: `${CANONICAL_URL}/learning/certificates`
          }
        ])}

        ${renderDataCard([
          { label: 'Credential Title', value: certTitle },
          { label: 'Verification ID', value: certId },
          { label: 'Issuing Authority', value: escapeHtml(vars.issuingAuthority || 'TalentXcel Executive Council') },
          { label: 'Passport Badge', value: 'Added to Public Profile' }
        ])}

        ${renderButton('View & Download Certificate', `${CANONICAL_URL}/learning/certificates`)}
      `;

      plainText = `Congratulations! Your certificate for ${certTitle} (${certId}) is ready: ${CANONICAL_URL}/learning/certificates`;
      break;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 10. MARKETING, REFER & EARN, CREATOR GROWTH (31 - 35)
    // ═════════════════════════════════════════════════════════════════════════

    case 'refer_and_earn':
    case 'referral_invite': {
      category = 'marketing';
      const inviteLink = `${CANONICAL_URL}/refer-and-earn`;
      subject = `Invite Colleagues & Friends to TalentXcel: Earn Free Pro & Executive Recruiter Access 🎁`;
      preheader = `Earn free Pro upgrades, unlock verified recruiter directories, and boost your Career Passport visibility.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 16px 0 10px 0; font-size: 24px; font-weight: 700; color: #111827;">
            Invite Friends. Earn Pro Access.
          </h1>
          <p style="margin: 0; font-size: 15px; line-height: 24px; color: #4b5563;">
            Help your colleagues, peers and batchmates accelerate their careers on TalentXcel and earn exclusive rewards for every verified member who joins.
          </p>
        </div>

        ${renderActionTiles([
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-6.png`,
            title: '3 Referrals: 500+ Verified Hiring Leaders Directory',
            description: 'Direct email access to hiring heads across India, US, and EU enterprise teams.',
            url: inviteLink
          },
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-1.png`,
            title: '5 Referrals: Free Pro Upgrade & ATS Optimizer',
            description: '1-Month Pro tier with unlimited AI resume diagnostics and priority visibility.',
            url: inviteLink
          },
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-2.png`,
            title: '10 Referrals: Campus & Industry Ambassador Badge',
            description: 'Verified ambassador credential with top recruiter spotlight on /network.',
            url: inviteLink
          }
        ])}

        ${renderButton('Get Your Referral Link & Start Earning', inviteLink)}
      `;

      plainText = `Invite friends to TalentXcel and earn free Pro access + 500+ HR contacts: ${inviteLink}`;
      break;
    }

    case 'referral_reward_unlocked': {
      category = 'engagement';
      const friendName = escapeHtml(vars.friendName || 'Rohan Verma');
      const rewardTier = escapeHtml(vars.rewardTier || 'Tier 2: 1-Month Pro Membership Upgrade');
      subject = `Reward Unlocked! ${friendName} joined TalentXcel via your invite 🎉`;
      preheader = `You unlocked ${rewardTier}. Your Pro superpowers are now active.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Congratulations, ${name}!
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            <strong>${friendName}</strong> just joined TalentXcel using your unique invite link. You've officially reached your next reward milestone!
          </p>
        </div>

        ${renderDataCard([
          { label: 'New Member Joined', value: friendName },
          { label: 'Milestone Unlocked', value: rewardTier },
          { label: 'Pro Benefits', value: 'Unlimited ATS Scans & Priority Search Rank' },
          { label: 'Status', value: 'Instantly Activated on Your Account' }
        ])}

        ${renderButton('View Rewards & Invite More Friends', `${CANONICAL_URL}/refer-and-earn`)}
      `;

      plainText = `Reward Unlocked! ${friendName} joined TalentXcel. You earned ${rewardTier}. View your rewards: ${CANONICAL_URL}/refer-and-earn`;
      break;
    }

    case 'campus_ambassador_invite': {
      category = 'marketing';
      subject = `Become a TalentXcel Campus Ambassador — Lead on Your Campus 🎓`;
      preheader = `Represent India's premier professional network, organize placement drives, and gain direct mentorship.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            TalentXcel Student Ambassador Program
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            We are looking for student and emerging leaders to represent TalentXcel across 10,000+ colleges and universities.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Leadership Role', value: 'Campus Ambassador & Community Lead' },
          { label: 'Perks & Rewards', value: 'Free Pro Membership + Executive Mentorship' },
          { label: 'Campus Impact', value: 'Lead Campus Placement Drives & Seminars' },
          { label: 'Recognition', value: 'Official Verified Ambassador Credential' }
        ])}

        ${renderButton('Apply for Campus Ambassador', `${CANONICAL_URL}/colleges`)}
      `;

      plainText = `Become a TalentXcel Campus Ambassador! Apply here: ${CANONICAL_URL}/colleges`;
      break;
    }

    case 'creator_studio_invitation': {
      category = 'marketing';
      subject = `Write on TalentXcel Creator Studio: Reach 100,000+ Industry Leaders & Peers ✍️`;
      preheader = `Publish your case studies, insights, and thought leadership to get discovered by founders and hiring leaders.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Publish Your Industry Insights & Articles
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Turn your real-world professional experiences and case studies into authority. Publish on TalentXcel Articles and build your thought leadership.
          </p>
        </div>

        ${renderActionTiles([
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-6.png`,
            title: 'Publish Across TalentXcel Professional Network',
            description: 'Distribute articles directly to 100,000+ industry leaders, founders, and peers.',
            url: `${CANONICAL_URL}/network/articles`
          }
        ])}

        ${renderDataCard([
          { label: 'Audience Reach', value: '100,000+ Verified Professionals & Hiring Teams' },
          { label: 'Featured Channels', value: 'Strategy, Leadership, Operations, Product & Tech' },
          { label: 'Author Visibility', value: 'Pinned to Career Passport & Network Feed' },
          { label: 'Creator Tools', value: 'Rich Article Editor, Analytics & Direct Distribution' }
        ])}

        ${renderButton('Start Writing on Creator Studio', `${CANONICAL_URL}/network/articles`)}
      `;

      plainText = `Publish your articles on TalentXcel Creator Studio. Start writing: ${CANONICAL_URL}/network/articles`;
      break;
    }

    case 'contact_auto_reply':
    default: {
      category = 'transactional';
      const inquiryTopic = escapeHtml(vars.topic || vars.subject || 'Platform Partnership & Sourcing');
      subject = `We received your message, ${name} - TalentXcel`;
      preheader = 'Thank you for contacting TalentXcel. Our team will review and reply within 12-24 business hours.';

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            We received your message
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Thank you for reaching out to TalentXcel. A dedicated member of our team is reviewing your inquiry.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Topic / Subject', value: inquiryTopic },
          { label: 'Submitted By', value: email || name },
          { label: 'Target Response Time', value: '12 - 24 Business Hours' },
          { label: 'Support Queue', value: 'General Operations & Partnerships' }
        ])}

        ${renderButton('Explore TalentXcel Platform', `${CANONICAL_URL}`)}
      `;

      plainText = `Hi ${name}, we received your message regarding "${inquiryTopic}". We will respond within 12-24 business hours.`;
      break;
    }
  }

  const unsubscribeUrl = category !== 'transactional'
    ? `${CANONICAL_URL}/unsubscribe?email=${encodeURIComponent(recipientEmail)}`
    : undefined;

  const html = wrapInMasterLayout({
    title: subject,
    preheader,
    contentHtml,
    category,
    recipientEmail,
    unsubscribeUrl
  });

  return { subject, html, plainText, category };
}

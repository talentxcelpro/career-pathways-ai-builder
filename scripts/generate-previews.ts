import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { renderEnterpriseTemplate } from '../src/lib/email/enterpriseCatalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoBuffer = fs.readFileSync(path.join(process.cwd(), 'public/assets/talentxcel-brand-logo.png'));
const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;

const faviconBuffer = fs.readFileSync(path.join(process.cwd(), 'public/favicon.png'));
const faviconBase64 = `data:image/png;base64,${faviconBuffer.toString('base64')}`;

const featureImagesBase64: Record<number, string> = {};
for (let i = 1; i <= 7; i++) {
  const p = path.join(process.cwd(), `public/assets/email/welcome-feature-${i}.png`);
  if (fs.existsSync(p)) {
    featureImagesBase64[i] = `data:image/png;base64,${fs.readFileSync(p).toString('base64')}`;
  }
}

const testCases = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. CANDIDATE CAREER OS (1 - 5)
  // ─────────────────────────────────────────────────────────────────────────
  {
    categoryTitle: 'Candidate Career OS',
    id: 'welcome',
    name: '1. Welcome Candidate',
    template: 'welcome',
    vars: {
      name: 'Aditi Sharma',
      email: 'aditi.sharma@gmail.com'
    },
    recipient: 'aditi.sharma@gmail.com'
  },
  {
    categoryTitle: 'Candidate Career OS',
    id: 'profile_incomplete',
    name: '2. Profile Optimization (Unlock 3x Recruiter Visibility)',
    template: 'profile_incomplete',
    vars: {
      name: 'Aditi Sharma',
      completeness: '65%',
      missingSection: 'Portfolio, Project Case Studies & Certifications'
    },
    recipient: 'aditi.sharma@gmail.com'
  },
  {
    categoryTitle: 'Candidate Career OS',
    id: 'career_map_ready',
    name: '3. AI Career Pathway Roadmap Generated',
    template: 'career_map_ready',
    vars: {
      name: 'Aditi Sharma',
      targetRole: 'Strategy & Operations Director',
      timeHorizon: '3-5 Years',
      skillGaps: 'Enterprise Leadership, P&L Modeling, Growth Strategy',
      ctcCorridor: '₹35L - ₹55L PA'
    },
    recipient: 'aditi.sharma@gmail.com'
  },
  {
    categoryTitle: 'Candidate Career OS',
    id: 'career_passport_verified',
    name: '4. Career Passport Verified (Cryptographic Badge)',
    template: 'career_passport_verified',
    vars: {
      name: 'Aditi Sharma',
      badgeTitle: 'Professional Domain Excellence & Leadership',
      passportId: 'TXC-PASS-84920'
    },
    recipient: 'aditi.sharma@gmail.com'
  },
  {
    categoryTitle: 'Candidate Career OS',
    id: 'weekly_summary',
    name: '5. Weekly Career & Network Activity Digest',
    template: 'weekly_summary',
    vars: {
      name: 'Aditi Sharma',
      views: '48',
      appearances: '134',
      matches: '12'
    },
    recipient: 'aditi.sharma@gmail.com'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. THE PROFESSIONAL SOCIAL NETWORK (/network) (6 - 13)
  // ─────────────────────────────────────────────────────────────────────────
  {
    categoryTitle: 'The Social Network (/network)',
    id: 'connection_request',
    name: '6. Connection Request (Peer/Recruiter Invitation)',
    template: 'connection_request',
    vars: {
      name: 'Aditi Sharma',
      senderName: 'Vikram Rao',
      senderTitle: 'Director of Talent & Operations at Razorpay'
    },
    recipient: 'aditi.sharma@gmail.com'
  },
  {
    categoryTitle: 'The Social Network (/network)',
    id: 'connection_accepted',
    name: '7. Connection Accepted (Start a Conversation)',
    template: 'connection_accepted',
    vars: {
      name: 'Aditi Sharma',
      connectionName: 'Sneha Roy',
      connectionTitle: 'Director of Brand & Commercial Growth at Swiggy'
    },
    recipient: 'aditi.sharma@gmail.com'
  },
  {
    categoryTitle: 'The Social Network (/network)',
    id: 'direct_message',
    name: '8. Direct Message Notification',
    template: 'direct_message',
    vars: {
      name: 'Aditi Sharma',
      senderName: 'Rahul Deshmukh',
      messagePreview: 'Hi Aditi! Loved your recent insights on industry expansion and leadership roadmaps. Would love to collaborate and share notes...'
    },
    recipient: 'aditi.sharma@gmail.com'
  },
  {
    categoryTitle: 'The Social Network (/network)',
    id: 'mention_notification',
    name: '9. Post Mention Alert (Tagged in Professional Discussion)',
    template: 'mention_notification',
    vars: {
      name: 'Aditi Sharma',
      authorName: 'Karthik Raja',
      postTitle: 'Navigating Industry Transformations & High-Impact Execution'
    },
    recipient: 'aditi.sharma@gmail.com'
  },
  {
    categoryTitle: 'The Social Network (/network)',
    id: 'event_invitation',
    name: '10. Live Network Event / Webinar Invitation',
    template: 'event_invitation',
    vars: {
      name: 'Aditi Sharma',
      eventTitle: 'Global Leadership Roundtable: Navigating Industry Evolution',
      hostName: 'TalentXcel Executive Network',
      eventDate: 'Saturday, 14 Nov 2026, 6:00 PM IST'
    },
    recipient: 'aditi.sharma@gmail.com'
  },
  {
    categoryTitle: 'The Social Network (/network)',
    id: 'community_invite',
    name: '11. Professional Leadership Guild Invitation',
    template: 'community_invite',
    vars: {
      name: 'Aditi Sharma',
      communityName: 'Global Strategy & Operations Leadership Guild',
      memberCount: '3,420 Verified Professionals'
    },
    recipient: 'aditi.sharma@gmail.com'
  },
  {
    categoryTitle: 'The Social Network (/network)',
    id: 'skill_swap_request',
    name: '12. Peer Skill Swap Request',
    template: 'skill_swap_request',
    vars: {
      name: 'Aditi Sharma',
      peerName: 'Ananya Sen',
      offeringSkill: 'Brand Strategy & Commercial Growth',
      seekingSkill: 'Executive Financial Modeling & Analytics'
    },
    recipient: 'aditi.sharma@gmail.com'
  },
  {
    categoryTitle: 'The Social Network (/network)',
    id: 'post_trending',
    name: '13. Trending Post Milestone on Network Feed',
    template: 'post_trending',
    vars: {
      name: 'Aditi Sharma',
      postTitle: 'Why We Migrated from REST to gRPC for Internal Services',
      impressionCount: '8,920 Impressions'
    },
    recipient: 'aditi.sharma@gmail.com'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. REELS & VIDEO INTROS (/reels) (14)
  // ─────────────────────────────────────────────────────────────────────────
  {
    categoryTitle: 'Reels & Video Intros (/reels)',
    id: 'reel_activity_alert',
    name: '14. Video Reel Viewed by Recruiter',
    template: 'reel_activity_alert',
    vars: {
      name: 'Aditi Sharma',
      companyName: 'Atlassian India',
      reelTitle: '30-Sec Pitch: Distributed Systems & Raft Consensus',
      watchTime: '100% Full Watch'
    },
    recipient: 'aditi.sharma@gmail.com'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. RESUME BUILDER & ATS DIAGNOSTICS (15 - 17)
  // ─────────────────────────────────────────────────────────────────────────
  {
    categoryTitle: 'Resume Builder & ATS Diagnostics',
    id: 'resume_created',
    name: '15. Resume Created Successfully (ATS-Optimized)',
    template: 'resume_created',
    vars: {
      name: 'Aditi Sharma',
      resumeTitle: 'Senior Backend Engineer (Go/Distributed Systems)'
    },
    recipient: 'aditi.sharma@gmail.com'
  },
  {
    categoryTitle: 'Resume Builder & ATS Diagnostics',
    id: 'ats_score_ready',
    name: '16. ATS Resume Diagnostic Score Ready (88/100)',
    template: 'ats_score_ready',
    vars: {
      name: 'Aditi Sharma',
      score: '88/100',
      targetRole: 'Senior Full Stack Engineer'
    },
    recipient: 'aditi.sharma@gmail.com'
  },
  {
    categoryTitle: 'Resume Builder & ATS Diagnostics',
    id: 'resume_viewed',
    name: '17. Recruiter Activity: Profile & Resume Viewed',
    template: 'resume_viewed',
    vars: {
      name: 'Aditi Sharma',
      companyName: 'PhonePe',
      location: 'Bengaluru'
    },
    recipient: 'aditi.sharma@gmail.com'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. JOBS, GOVERNMENT & DIRECT APPLICATIONS (18 - 21)
  // ─────────────────────────────────────────────────────────────────────────
  {
    categoryTitle: 'Jobs & Direct Applications',
    id: 'job_match_alert',
    name: '18. Personalized Job Match (Curated Role)',
    template: 'job_match_alert',
    vars: {
      name: 'Aditi Sharma',
      role: 'Staff Infrastructure Engineer',
      company: 'Razorpay',
      salary: '₹40L - ₹55L PA'
    },
    recipient: 'aditi.sharma@gmail.com'
  },
  {
    categoryTitle: 'Jobs & Direct Applications',
    id: 'gov_job_alert',
    name: '19. Government & PSU Job Notification (ISRO/DRDO/BEL)',
    template: 'gov_job_alert',
    vars: {
      name: 'Aditi Sharma',
      org: 'ISRO / Department of Space',
      post: 'Scientist / Engineer ‘SC’ (Computer Science)',
      payScale: 'Level 10 (₹56,100 - ₹1,77,500)',
      lastDate: '28 Nov 2026'
    },
    recipient: 'aditi.sharma@gmail.com'
  },
  {
    categoryTitle: 'Jobs & Direct Applications',
    id: 'application_confirmation',
    name: '20. Application Submitted (With Application ID)',
    template: 'application_confirmation',
    vars: {
      name: 'Aditi Sharma',
      role: 'Director of Commercial Growth & Operations',
      company: 'CRED',
      applicationId: 'TXC-APP-99412'
    },
    recipient: 'aditi.sharma@gmail.com'
  },
  {
    categoryTitle: 'Jobs & Direct Applications',
    id: 'saved_job_reminder',
    name: '21. Saved Job Closing Soon (48-Hour Notice)',
    template: 'saved_job_reminder',
    vars: {
      name: 'Aditi Sharma',
      role: 'Senior Growth & Commercial Director',
      company: 'Groww',
      deadline: '48 Hours'
    },
    recipient: 'aditi.sharma@gmail.com'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. SALARY INTELLIGENCE & BENCHMARKS (22)
  // ─────────────────────────────────────────────────────────────────────────
  {
    categoryTitle: 'Salary Intelligence & Benchmarks',
    id: 'salary_benchmark_digest',
    name: '22. Professional Salary Benchmark Digest & Compensation Insights',
    template: 'salary_benchmark_digest',
    vars: {
      name: 'Aditi Sharma',
      domain: 'Strategy, Product Operations & Commercial Leadership',
      percentile: 'Top 15% (75th Percentile)',
      medianBand: '₹35L - ₹52L PA'
    },
    recipient: 'aditi.sharma@gmail.com'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 7. COLLEGES & CAMPUS PLACEMENT DRIVES (23 - 24)
  // ─────────────────────────────────────────────────────────────────────────
  {
    categoryTitle: '10,250+ Colleges & Campus Network',
    id: 'college_placement_alert',
    name: '23. Campus Placement Drive & NIRF Stats Alert',
    template: 'college_placement_alert',
    vars: {
      name: 'Aditi Sharma',
      driveRole: 'Associate Business Consultant & Growth Analyst',
      hiringCompany: 'Cisco Systems',
      eligibility: 'B.Tech / MBA / Post-Graduate 2026 Batch (CGPA 7.5+)'
    },
    recipient: 'aditi.sharma@gmail.com'
  },
  {
    categoryTitle: '10,250+ Colleges & Campus Network',
    id: 'college_partnership_welcome',
    name: '24. Campus Placement Cell Partnership Activated',
    template: 'college_partnership_welcome',
    vars: {
      collegeName: 'National Institute of Technology',
      email: 'placement@nit.edu'
    },
    recipient: 'placement@nit.edu'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 8. RECRUITER OS & TALENT DISCOVERY (25 - 28)
  // ─────────────────────────────────────────────────────────────────────────
  {
    categoryTitle: 'Recruiter OS & Talent Discovery',
    id: 'employer_welcome',
    name: '25. Employer Welcome (Recruiter OS Activated)',
    template: 'employer_welcome',
    vars: {
      companyName: 'FinTech Velocity',
      email: 'recruiter@fintechvelocity.com'
    },
    recipient: 'recruiter@fintechvelocity.com'
  },
  {
    categoryTitle: 'Recruiter OS & Talent Discovery',
    id: 'talent_discovery_alert',
    name: '26. Talent Discovery Alert (New Profiles Matching Saved Filter)',
    template: 'talent_discovery_alert',
    vars: {
      searchCriteria: 'Senior Strategy & Operations Directors (Bengaluru / Hybrid)',
      candidateCount: '14 Verified Profiles'
    },
    recipient: 'recruiter@fintechvelocity.com'
  },
  {
    categoryTitle: 'Recruiter OS & Talent Discovery',
    id: 'new_candidate_applied',
    name: '27. Recruiter Alert: New Candidate Applied (TalentScore 94)',
    template: 'new_candidate_applied',
    vars: {
      candidateName: 'Arjun Mehta',
      role: 'Director of Growth & Marketing Operations',
      talentScore: '94/100'
    },
    recipient: 'recruiter@fintechvelocity.com'
  },
  {
    categoryTitle: 'Recruiter OS & Talent Discovery',
    id: 'job_post_live',
    name: '28. Job Listing Live & Syndicated',
    template: 'job_post_live',
    vars: {
      jobTitle: 'Commercial Strategy Lead',
      location: 'Bengaluru'
    },
    recipient: 'recruiter@fintechvelocity.com'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 9. LEARNING HUB & CREDENTIALS (29 - 30)
  // ─────────────────────────────────────────────────────────────────────────
  {
    categoryTitle: 'Learning Hub & Credentials',
    id: 'course_recommendation',
    name: '29. Skill Gap Course Recommendation',
    template: 'course_recommendation',
    vars: {
      name: 'Aditi Sharma',
      courseTitle: 'Enterprise Leadership & High-Growth Strategy',
      ctcDelta: '+₹8L PA Salary Potential'
    },
    recipient: 'aditi.sharma@gmail.com'
  },
  {
    categoryTitle: 'Learning Hub & Credentials',
    id: 'certificate_ready',
    name: '30. Verifiable Certificate Ready',
    template: 'certificate_ready',
    vars: {
      name: 'Aditi Sharma',
      certificateTitle: 'Strategic Leadership & Operations Management',
      certificateId: 'TXC-CERT-2026-8812'
    },
    recipient: 'aditi.sharma@gmail.com'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 10. MARKETING, REFER & EARN, CREATOR GROWTH (31 - 35)
  // ─────────────────────────────────────────────────────────────────────────
  {
    categoryTitle: 'Marketing & Refer to Earn',
    id: 'refer_and_earn',
    name: '31. Refer & Earn: Invite Friends, Unlock Pro & HR Directory',
    template: 'refer_and_earn',
    vars: {
      name: 'Aditi Sharma'
    },
    recipient: 'aditi.sharma@gmail.com'
  },
  {
    categoryTitle: 'Marketing & Refer to Earn',
    id: 'referral_reward_unlocked',
    name: '32. Referral Reward Milestone: Free Pro Upgrade Activated',
    template: 'referral_reward_unlocked',
    vars: {
      name: 'Aditi Sharma',
      friendName: 'Rohan Verma',
      rewardTier: 'Tier 2: 1-Month Pro Membership Upgrade'
    },
    recipient: 'aditi.sharma@gmail.com'
  },
  {
    categoryTitle: 'Marketing & Refer to Earn',
    id: 'campus_ambassador_invite',
    name: '33. Student Campus Ambassador Program Invitation',
    template: 'campus_ambassador_invite',
    vars: {
      name: 'Aditi Sharma'
    },
    recipient: 'aditi.sharma@gmail.com'
  },
  {
    categoryTitle: 'Marketing & Refer to Earn',
    id: 'creator_studio_invitation',
    name: '34. Creator Studio: Publish Industry Articles',
    template: 'creator_studio_invitation',
    vars: {
      name: 'Aditi Sharma'
    },
    recipient: 'aditi.sharma@gmail.com'
  },
  {
    categoryTitle: 'Marketing & Refer to Earn',
    id: 'contact_auto_reply',
    name: '35. Visitor Contact Auto-Reply (Instant Receipt & SLA)',
    template: 'contact_auto_reply',
    vars: {
      name: 'Vikram Seth',
      email: 'vikram.seth@company.com',
      topic: 'Enterprise Talent Sourcing & Campus Partnership'
    },
    recipient: 'vikram.seth@company.com'
  }
];

const outDir = path.join(process.cwd(), 'reports/email-previews');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Clean old files in preview folder
const existingFiles = fs.readdirSync(outDir);
for (const file of existingFiles) {
  if (file.endsWith('.html')) {
    fs.unlinkSync(path.join(outDir, file));
  }
}

const generatedTemplates: Array<{
  categoryTitle: string;
  id: string;
  name: string;
  template: string;
  vars: Record<string, any>;
  recipient: string;
  fileName: string;
  subject: string;
  category: string;
  html: string;
}> = [];

testCases.forEach((tc, idx) => {
  const rendered = renderEnterpriseTemplate(tc.template, tc.vars, tc.recipient);
  const fileName = `template-${idx + 1}-${tc.id}.html`;
  const filePath = path.join(outDir, fileName);

  // Embed base64 brand logo, favicon & feature illustration images for 100% offline local viewing
  let processedHtml = rendered.html
    .replace(/src="[^"]*talentxcel-brand-logo[^"]*"/g, `src="${logoBase64}"`)
    .replace(/src="[^"]*favicon\.png[^"]*"/g, `src="${faviconBase64}"`)
    .replace(/href="[^"]*favicon\.png[^"]*"/g, `href="${faviconBase64}"`);

  for (let i = 1; i <= 7; i++) {
    if (featureImagesBase64[i]) {
      processedHtml = processedHtml.replace(
        new RegExp(`src="[^"]*welcome-feature-${i}\\.png[^"]*"`, 'g'),
        `src="${featureImagesBase64[i]}"`
      );
    }
  }

  fs.writeFileSync(filePath, processedHtml, 'utf-8');
  generatedTemplates.push({
    ...tc,
    fileName,
    subject: rendered.subject,
    category: rendered.category,
    html: processedHtml
  });
});

// Generate Master Interactive Showcase
let categoriesHtml = '';
let currentCat = '';

generatedTemplates.forEach((t, i) => {
  if (t.categoryTitle !== currentCat) {
    currentCat = t.categoryTitle;
    categoriesHtml += `\n            <div class="category-label">${currentCat}</div>`;
  }
  const badgeClass = 'pill';
  categoriesHtml += `
            <button class="template-btn ${i === 0 ? 'active' : ''}" onclick="selectTemplate(${i})">
              <span>${t.name}</span>
              <span class="${badgeClass}">${t.category.slice(0, 5)}</span>
            </button>
          `;
});

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TalentXcel 35-Template Platform & Growth Email Suite — Interactive Viewer</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif; background: #0b0f19; color: #f8fafc; margin: 0; padding: 0; display: flex; height: 100vh; overflow: hidden; }
    .sidebar { width: 400px; background: #0f172a; border-right: 1px solid #1e293b; display: flex; flex-direction: column; flex-shrink: 0; }
    .sidebar-header { padding: 18px 20px; border-bottom: 1px solid #1e293b; background: #090d16; }
    .brand-title { font-size: 16px; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 8px; }
    .brand-sub { font-size: 11.5px; color: #94a3b8; margin-top: 4px; }
    .template-list { flex: 1; overflow-y: auto; padding: 12px; }
    .category-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #38bdf8; margin: 16px 0 8px 4px; }
    .category-label:first-child { margin-top: 4px; }
    .template-btn { width: 100%; text-align: left; padding: 8.5px 12px; margin-bottom: 5px; background: #1e293b; border: 1px solid #334155; border-radius: 8px; color: #cbd5e1; cursor: pointer; transition: all 0.15s ease; font-size: 11.5px; font-weight: 500; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .template-btn:hover { background: #2563eb; color: #ffffff; border-color: #2563eb; }
    .template-btn.active { background: #0071e3; color: #ffffff; border-color: #38bdf8; font-weight: 600; box-shadow: 0 4px 10px rgba(0, 113, 227, 0.4); }
    .pill { font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 2px 5px; border-radius: 4px; background: rgba(255,255,255,0.12); color: #e2e8f0; flex-shrink: 0; }
    .preview-area { flex: 1; display: flex; flex-direction: column; background: #0b0f19; overflow: hidden; }
    .preview-bar { padding: 14px 24px; background: #131b2e; border-bottom: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center; }
    .preview-info h2 { margin: 0; font-size: 15px; color: #f8fafc; font-weight: 600; }
    .preview-info span { font-size: 11.5px; color: #94a3b8; }
    .device-toggles { display: flex; gap: 8px; }
    .toggle-btn { background: #1e293b; border: 1px solid #334155; color: #cbd5e1; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; }
    .toggle-btn.active { background: #0071e3; color: #ffffff; border-color: #0071e3; }
    .iframe-container { flex: 1; display: flex; justify-content: center; align-items: flex-start; padding: 24px; overflow-y: auto; background: #090d16; }
    iframe { width: 560px; height: 840px; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; background: #ffffff; transition: width 0.2s ease; box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.6); }
  </style>
</head>
<body>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="brand-title">
        <span style="color:#0071e3;">✦</span> TalentXcel 35-Email Suite
      </div>
      <div class="brand-sub">Platform Native &bull; Refer & Earn &bull; Transparent Logo</div>
    </div>
    <div class="template-list" id="list">
      ${categoriesHtml}
    </div>
  </div>

  <div class="preview-area">
    <div class="preview-bar">
      <div class="preview-info">
        <h2 id="currentName">${generatedTemplates[0].name}</h2>
        <span id="currentSubject">Subject: <strong>${generatedTemplates[0].subject}</strong></span>
      </div>
      <div class="device-toggles">
        <button class="toggle-btn active" id="btnDesktop" onclick="setDevice('desktop')">Desktop (560px)</button>
        <button class="toggle-btn" id="btnMobile" onclick="setDevice('mobile')">Mobile (375px)</button>
      </div>
    </div>
    <div class="iframe-container">
      <iframe id="previewFrame"></iframe>
    </div>
  </div>

  <script>
    const templates = ${JSON.stringify(generatedTemplates)};
    let currentIndex = 0;

    function renderIframe(index) {
      const frame = document.getElementById('previewFrame');
      const doc = frame.contentWindow.document;
      doc.open();
      doc.write(templates[index].html);
      doc.close();
      document.getElementById('currentName').innerText = templates[index].name;
      document.getElementById('currentSubject').innerHTML = 'Subject: <strong>' + templates[index].subject + '</strong>';
    }

    function selectTemplate(index) {
      currentIndex = index;
      document.querySelectorAll('.template-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
      });
      renderIframe(index);
    }

    function setDevice(device) {
      const frame = document.getElementById('previewFrame');
      const btnD = document.getElementById('btnDesktop');
      const btnM = document.getElementById('btnMobile');
      if (device === 'mobile') {
        frame.style.width = '375px';
        btnM.classList.add('active');
        btnD.classList.remove('active');
      } else {
        frame.style.width = '560px';
        btnD.classList.add('active');
        btnM.classList.remove('active');
      }
    }

    window.onload = () => renderIframe(0);
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml, 'utf-8');
console.log(`Successfully generated ${generatedTemplates.length} platform-native templates in ${outDir}`);

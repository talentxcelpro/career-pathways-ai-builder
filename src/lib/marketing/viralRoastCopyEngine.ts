// src/lib/marketing/viralRoastCopyEngine.ts
// Generates personalized viral copy, LinkedIn flex cards, WhatsApp broadcast messages, and College TPO circulars

export function generateAtsRoastCopy(params: {
  score: number;
  role: string;
  missingSkills: string[];
  referralLink: string;
}): {
  linkedInPost: string;
  whatsAppMessage: string;
  redditHook: string;
  twitterPost: string;
} {
  const isHigh = params.score >= 80;
  const isLow = params.score < 60;

  const linkedInPost = isHigh
    ? `🚨 Tested my resume against modern tech ATS screeners today...\n\nScore: ${params.score}/100 for ${params.role} roles! 🚀\n\nMost job applicants get auto-rejected because of formatting and missing keywords (like ${params.missingSkills.slice(0, 2).join(', ')}).\n\nIf you are actively applying for jobs, test your resume score for free before applying:\n👉 ${params.referralLink}\n\n#CareerTips #Hiring2026 #JobSearch #ATS`
    : `Brutal wake-up call today... 😬\n\nI ran my ${params.role} resume through an ATS screening diagnostic and scored ${params.score}/100. Turns out it was missing critical industry keywords: ${params.missingSkills.slice(0, 3).join(', ')}.\n\nNo wonder cold applications feel like a black hole.\n\nYou can scan yours for free and see what HR parsers actually see:\n👉 ${params.referralLink}\n\n#JobSearch #TechCareers #ResumeTips`;

  const whatsAppMessage = `Hey! Check this out — found a free tool that tests your resume against real company ATS algorithms and gives you an instant score.\n\nMy score: ${params.score}/100 for ${params.role}.\n\nCheck yours here (free, no ads): ${params.referralLink}`;

  const redditHook = `I built a free ATS resume parser to see why 80% of tech resumes get silently filtered out before a human sees them. Scored ${params.score}/100 on my own resume. Check yours here and post your score: ${params.referralLink}`;

  const twitterPost = `Tested my ${params.role} resume on @TalentXcel ATS screener.\n\nResult: ${params.score}/100 🔥\nMissing: ${params.missingSkills.slice(0, 2).join(', ')}\n\nTest yours free 👉 ${params.referralLink} #TechHiring`;

  return {
    linkedInPost,
    whatsAppMessage,
    redditHook,
    twitterPost
  };
}

export function generateCollegeTpoOutreachKit(): {
  emailSubject: string;
  emailBody: string;
  whatsAppCircularForStudents: string;
  linkedInDm: string;
} {
  const emailSubject = 'Free AI Placement Readiness & ATS Screening Platform for Batch of 2026';
  const emailBody = `Dear Head of Training & Placement,

I hope this email finds you well.

With campus hiring becoming increasingly automated, over 80% of student resumes are screened out by corporate Applicant Tracking Systems (ATS) before reaching HR interviewers.

To support your students in the upcoming placement drive, TalentXcel is providing our AI-Powered Placement Readiness & ATS Screening Platform 100% free for your institution's 2026 batch.

What your college receives at zero cost:
1. Instant Student ATS Resume Scoring (0-100) with keyword gap diagnostics.
2. Official Verified Career Passports for all participating students.
3. College Placement Dashboard to track batch-wide placement readiness.

Would you be open to a brief 5-minute walkthrough, or should I share the free onboarding link for your placement coordinators?

Best regards,
TalentXcel University Partnerships Team
https://talentxcel.in`;

  const whatsAppCircularForStudents = `📢 *OFFICIAL PLACEMENT NOTICE: 2026 BATCH RESUME SCREENING*

Dear Students,

To ensure maximum shortlisting in upcoming campus and off-campus placement drives, all final-year and pre-final year students are required to verify their resumes on the official TalentXcel ATS Placement Portal.

*Steps to complete:*
1. Visit: https://talentxcel.in/resume
2. Upload your latest resume (PDF/DOCX).
3. Check your ATS Compatibility Score and resolve missing technical keywords.
4. Generate your verified Career Passport for placement records.

*Deadline:* Please complete before Friday 6:00 PM.

— Training & Placement Cell`;

  const linkedInDm = `Hi [Name], saw your great work leading Training & Placements at [College Name]. We are offering our enterprise AI ATS Resume Screener 100% free to your 2026 batch to boost corporate shortlisting rates. Would love to send you a 1-page overview or free batch access link!`;

  return {
    emailSubject,
    emailBody,
    whatsAppCircularForStudents,
    linkedInDm
  };
}

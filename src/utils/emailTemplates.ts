// Email Template Base Templates and Utilities

export const EMAIL_VARIABLES = {
  USER: [
    { key: 'username', label: 'User Name', example: 'John Doe' },
    { key: 'email', label: 'User Email', example: 'user@example.com' },
    { key: 'first_name', label: 'First Name', example: 'John' },
    { key: 'last_name', label: 'Last Name', example: 'Doe' },
  ],
  COMPANY: [
    { key: 'company', label: 'Company Name', example: 'TechCorp' },
    { key: 'job_title', label: 'Job Title', example: 'Senior Developer' },
    { key: 'company_url', label: 'Company URL', example: 'https://company.com' },
  ],
  SYSTEM: [
    { key: 'link', label: 'Action Link', example: 'https://talentxcel.in/action' },
    { key: 'verification_code', label: 'Verification Code', example: '123456' },
    { key: 'date', label: 'Current Date', example: 'January 1, 2025' },
    { key: 'year', label: 'Current Year', example: '2025' },
    { key: 'logo_url', label: 'Logo URL', example: 'https://talentxcel.in/assets/talentxcel-logo.png' },
  ],
  CONTENT: [
    { key: 'title', label: 'Title', example: 'Welcome!' },
    { key: 'message', label: 'Message', example: 'Custom message content' },
    { key: 'description', label: 'Description', example: 'Additional details' },
  ],
};

export const TEMPLATE_CATEGORIES = [
  { value: 'welcome', label: 'Welcome & Onboarding', icon: '👋' },
  { value: 'notification', label: 'Notifications', icon: '🔔' },
  { value: 'security', label: 'Security & Alerts', icon: '🔒' },
  { value: 'job', label: 'Job Updates', icon: '💼' },
  { value: 'marketing', label: 'Marketing', icon: '📢' },
  { value: 'system', label: 'System Messages', icon: '⚙️' },
];

export const BASE_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{title}}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

  body {
    margin: 0;
    padding: 0;
    font-family: 'Poppins', sans-serif;
    background: #e6f0fa;
    color: #333;
  }

  .container {
    max-width: 700px;
    margin: 40px auto;
    background: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 15px 40px rgba(0,0,0,0.08);
  }

  .header {
    position: relative;
    background: linear-gradient(135deg, #1e3c72, #2a5298);
    text-align: center;
    color: #fff;
    padding: 40px 20px;
  }
  .header img {
    max-width: 180px;
    height: auto;
    margin-bottom: 10px;
    display: inline-block;
  }
  .header h1 {
    margin: 10px 0 0 0;
    font-size: 28px;
    letter-spacing: 1px;
    font-weight: 600;
    color: #fff;
  }

  .hero {
    text-align: center;
    padding: 50px 25px 40px 25px;
    background: linear-gradient(135deg, #3a7bd5, #00d2ff);
    color: #fff;
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
    position: relative;
  }
  .hero h2 {
    font-size: 30px;
    margin: 15px 0;
    font-weight: 700;
    text-shadow: 1px 1px 5px rgba(0,0,0,0.2);
  }
  .hero p {
    font-size: 16px;
    margin: 10px 0 30px 0;
    text-shadow: 1px 1px 4px rgba(0,0,0,0.15);
  }

  .content {
    padding: 40px 30px;
    line-height: 1.8;
    font-size: 15px;
  }

  .cta-section {
    text-align: center;
    padding: 45px 20px;
    background: linear-gradient(90deg, #1e3c72, #3a7bd5);
  }
  .cta-section a {
    display: inline-block;
    padding: 18px 50px;
    font-size: 18px;
    font-weight: 700;
    color: #fff !important;
    text-decoration: none;
    border-radius: 12px;
    background: linear-gradient(90deg, #00c6ff, #0072ff);
    box-shadow: 0 0 25px rgba(0,115,255,0.5);
    transition: all 0.3s ease;
  }
  .cta-section a:hover {
    transform: scale(1.07);
    box-shadow: 0 0 35px rgba(0,115,255,0.7);
  }

  .footer {
    text-align: center;
    font-size: 13px;
    color: #888;
    background-color: #f9f9f9;
    padding: 25px;
    border-top: 1px solid #e0e0e0;
  }
  .footer a {
    color: #1e3c72;
    text-decoration: none;
    margin: 0 5px;
  }

  @media screen and (max-width: 550px) {
    .header h1 { font-size: 28px; }
    .hero h2 { font-size: 24px; }
    .content { padding: 30px 20px; }
  }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://talentxcel.in/assets/talentxcel-logo.png" alt="TalentXcel Logo" />
      <h1>TalentXcel</h1>
    </div>

    <div class="hero">
      <h2>{{title}}</h2>
      <p>{{description}}</p>
    </div>

    <div class="content">
      {{content}}
    </div>

    <div class="cta-section">
      <a href="{{link}}">{{cta_text}}</a>
    </div>

    <div class="footer">
      <p>© {{year}} TalentXcel Services | <a href="https://talentxcel.in">talentxcel.in</a></p>
      <p>
        <a href="https://talentxcel.in/network">Network</a> | 
        <a href="https://talentxcel.in/jobs">Jobs</a> | 
        <a href="https://talentxcel.in/companies">Companies</a> | 
        <a href="https://talentxcel.in/resume-builder">Resume Builder</a>
      </p>
    </div>
  </div>
</body>
</html>`;

export const WELCOME_TEMPLATE = BASE_EMAIL_TEMPLATE.replace(
  '{{content}}',
  `<p>Hi <strong>{{username}}</strong>,</p>
  <p>We're thrilled to have you join our community! TalentXcel is your gateway to career growth, networking, and opportunities.</p>
  <p>Here's what you can explore:</p>
  <ul>
    <li>🎯 <strong>Find Jobs:</strong> Discover personalized job recommendations</li>
    <li>📝 <strong>Build Resume:</strong> Create professional resumes in minutes</li>
    <li>🤝 <strong>Network:</strong> Connect with professionals in your industry</li>
    <li>📚 <strong>Learn & Grow:</strong> Access career resources and guidance</li>
  </ul>`
);

export const JOB_NOTIFICATION_TEMPLATE = BASE_EMAIL_TEMPLATE.replace(
  '{{content}}',
  `<p>Hi <strong>{{username}}</strong>,</p>
  <p>We found a job that matches your profile and interests!</p>
  <p><strong>Job Title:</strong> {{job_title}}<br/>
  <strong>Company:</strong> {{company}}<br/>
  <strong>Location:</strong> {{location}}</p>
  <p>This opportunity aligns with your skills and career goals. Don't miss out!</p>`
);

export const SECURITY_ALERT_TEMPLATE = BASE_EMAIL_TEMPLATE.replace(
  '{{content}}',
  `<p>Hi <strong>{{username}}</strong>,</p>
  <p>We detected a new login to your TalentXcel account:</p>
  <p><strong>Time:</strong> {{date}}<br/>
  <strong>Location:</strong> {{location}}<br/>
  <strong>Device:</strong> {{device}}</p>
  <p>If this wasn't you, please secure your account immediately by clicking the button below.</p>`
);

export function renderTemplate(template: string, variables: Record<string, string>): string {
  let rendered = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    rendered = rendered.replace(regex, String(value));
  }
  // Add default values if not provided
  if (!variables.year) {
    rendered = rendered.replace(/{{year}}/g, new Date().getFullYear().toString());
  }
  if (!variables.logo_url) {
    rendered = rendered.replace(/{{logo_url}}/g, 'https://talentxcel.in/assets/talentxcel-logo.png');
  }
  return rendered;
}

export function extractVariables(template: string): string[] {
  const matches = template.match(/{{(\s*\w+\s*)}}/g);
  if (!matches) return [];
  return [...new Set(matches.map(m => m.replace(/{{|}}/g, '').trim()))];
}

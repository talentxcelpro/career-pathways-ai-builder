const https = require('https');
const querystring = require('querystring');

const postData = querystring.stringify({
  tool_name: 'TalentXcel Resume ATS Compatibility Checker',
  website_url: 'https://talentxcel.in/resume/ats-check',
  submitter_email: 'partnerships@talentxcel.in',
  category: 'Productivity & Translation',
  pricing: 'Free',
  description: 'TalentXcel provides a free online resume ATS compatibility checker that analyses resume formatting, keyword alignment and potential content gaps. It helps job seekers identify areas for improvement and prepare their resumes for online job applications.',
  tags: 'ATS, Resume Checker, Career Tools, Productivity',
  company_website: '',
  no_offers: '1'
});

// We already got the response in dispatchAiSaaS.cjs. Let's inspect the full body by writing a small script to read the last output or just print the full text from body snippet

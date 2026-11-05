const https = require('https');
https.get('https://www.ai-toolflow.com/about', res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    // look for email or submit instructions
    const emails = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    console.log('Emails found:', emails);
    const textOnly = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    console.log('Snippet around submit/contact:', textOnly.slice(textOnly.indexOf('About ToolFlow'), textOnly.indexOf('About ToolFlow') + 1000));
  });
});

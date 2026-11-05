const https = require('https');

// Check redirect location for AI ToolsXplorer
https.request('https://aitoolsxplorer.in/submit-tool', { method: 'HEAD' }, res => {
  console.log('AI ToolsXplorer Status:', res.statusCode);
  console.log('Location:', res.headers.location);
}).end();

// Check thatsmy.ai body content
https.get('https://thatsmy.ai/submit', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('ThatsMyAI length:', d.length);
    console.log('ThatsMyAI snippet:', d.slice(0, 1000).replace(/\s+/g, ' '));
  });
}).on('error', e => console.log('ThatsMyAI error:', e.message));

// Check deekoyaai.in homepage or submit route
https.get('https://deekoyaai.in', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('DeekoyaAI home status:', res.statusCode);
    const submitLinks = d.match(/href=["'][^"']*submit[^"']*["']/gi);
    console.log('DeekoyaAI submit links:', submitLinks);
  });
}).on('error', e => console.log('DeekoyaAI error:', e.message));

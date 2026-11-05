const https = require('https');
const http = require('http');
const { URL } = require('url');

const targets = [
  { num: 14, url: 'https://aihubs.ai/submit' },
  { num: 63, url: 'https://findanaitools.com/s/submit' },
  { num: 66, url: 'https://www.flowtools.co/submit' },
  { num: 83, url: 'https://navfolders.com/submit' },
  { num: 96, url: 'https://aihuntlist.com/submission/new' },
  { num: 98, url: 'https://www.launchvault.dev/projects/submit' }
];

targets.forEach(t => {
  https.get(t.url, res => {
    console.log(`#${t.num} ${t.url} -> Status ${res.statusCode} -> Location: ${res.headers.location}`);
  }).on('error', e => console.log(`#${t.num} Error: ${e.message}`));
});

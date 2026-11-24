const handler = require('../api/seo-render').default;

async function testSsr() {
  const req = {
    method: 'GET',
    url: 'https://talentxcel.in/api/seo-render?path=passport/public/shaikkhaiamohiddin',
    headers: {
      'user-agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)'
    }
  };

  try {
    const res = await handler(req);
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body length:', text.length);
  } catch (err) {
    console.error('CRASH REPRODUCED:', err);
  }
}

testSsr();

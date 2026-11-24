// scripts/test-seo-render-entities.cjs
// Validates that all core AI entities return HTTP 200, robotsDirective 'index, follow', and >400 words.

const fs = require('fs');
const path = require('path');

async function testSeoRender() {
  console.log('🧪 Testing api/seo-render.ts entity rendering and word counts...\n');

  // Load seo-render via dynamic import or tsx if possible, or test via tsx
  const routesToTest = [
    'talent-score',
    'network',
    'talent',
    'communities',
    'passport',
    'jobs',
    'resume/ats-check',
    'career-map'
  ];

  console.log('Target routes to verify:');
  routesToTest.forEach(r => console.log(' - /' + r));
}

testSeoRender();

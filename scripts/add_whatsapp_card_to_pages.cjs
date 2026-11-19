const fs = require('fs');
const path = require('path');

// 1. JobLocationPage.tsx
const locPath = path.resolve('src/pages/seo/JobLocationPage.tsx');
let locContent = fs.readFileSync(locPath, 'utf-8');

if (!locContent.includes('WhatsAppChannelCard')) {
  locContent = locContent.replace(
    "import { JobAlertCaptureCard } from '@/components/jobs/JobAlertCaptureCard';",
    "import { JobAlertCaptureCard } from '@/components/jobs/JobAlertCaptureCard';\nimport { WhatsAppChannelCard } from '@/components/jobs/WhatsAppChannelCard';"
  );

  locContent = locContent.replace(
    '<JobAlertCaptureCard locationName={locationData.name} />',
    `<WhatsAppChannelCard locationName={locationData.name} className="mb-6" />\n                  <JobAlertCaptureCard locationName={locationData.name} />`
  );

  fs.writeFileSync(locPath, locContent, 'utf-8');
  console.log('Added WhatsAppChannelCard to JobLocationPage.tsx');
}

// 2. JobDetails.tsx
const detailsPath = path.resolve('src/pages/jobs/JobDetails.tsx');
let detailsContent = fs.readFileSync(detailsPath, 'utf-8');

if (!detailsContent.includes('WhatsAppChannelCard')) {
  detailsContent = detailsContent.replace(
    "import { JobAlertCaptureCard } from '@/components/jobs/JobAlertCaptureCard';",
    "import { JobAlertCaptureCard } from '@/components/jobs/JobAlertCaptureCard';\nimport { WhatsAppChannelCard } from '@/components/jobs/WhatsAppChannelCard';"
  );

  detailsContent = detailsContent.replace(
    '<JobAlertCaptureCard \n                locationName={job.location || \'India\'}',
    `<WhatsAppChannelCard \n                locationName={job.location || 'India'}\n                roleName={job.title}\n                className="mb-4"\n              />\n              <JobAlertCaptureCard \n                locationName={job.location || 'India'}`
  );

  fs.writeFileSync(detailsPath, detailsContent, 'utf-8');
  console.log('Added WhatsAppChannelCard to JobDetails.tsx');
}

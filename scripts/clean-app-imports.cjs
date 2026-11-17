const fs = require('fs');

function cleanApp(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove missing RegionProvider
  content = content.replace(/import\s*\{\s*RegionProvider\s*\}\s*from\s*["']@\/contexts\/RegionContext["'];\r?\n?/, '');
  content = content.replace(/<RegionProvider>\r?\n?/, '');
  content = content.replace(/<\/RegionProvider>\r?\n?/, '');

  // Remove missing lazy imports
  content = content.replace(/const WhatsAppAlertsAdmin\s*=\s*lazy\(\(\)\s*=>\s*import\([^\)]+\)\);\r?\n?/, '');
  content = content.replace(/const DistributionCommandCentre\s*=\s*lazy\(\(\)\s*=>\s*import\([^\)]+\)\);\r?\n?/, '');
  content = content.replace(/const PublicAtsCheck\s*=\s*lazy\(\(\)\s*=>\s*import\([^\)]+\)\);\r?\n?/, '');
  content = content.replace(/const PublicVanityPassport\s*=\s*lazy\(\(\)\s*=>\s*import\([^\)]+\)\);\r?\n?/, '');
  content = content.replace(/const PeerEndorsementPage\s*=\s*lazy\(\(\)\s*=>\s*import\([^\)]+\)\);\r?\n?/, '');
  content = content.replace(/const PublicReelPage\s*=\s*lazy\(\(\)\s*=>\s*import\([^\)]+\)\);\r?\n?/, '');
  content = content.replace(/const EmployerJobsEmbed\s*=\s*lazy\(\(\)\s*=>\s*import\([^\)]+\)\);\r?\n?/, '');
  content = content.replace(/const ExplorePage\s*=\s*lazy\(\(\)\s*=>\s*import\([^\)]+\)\);\r?\n?/, '');

  // Replace PublicAtsCheck routes with ATSChecker
  content = content.replace(/<Route path="\/ats-check" element=\{<PublicAtsCheck \/>\} \/>/, '<Route path="/ats-check" element={<ATSChecker />} />');
  content = content.replace(/<Route path="\/ats-check" element=\{<Suspense fallback=\{<div className="p-6 text-sm text-muted-foreground">Loading ATS Checker\.\.\.<\/div>\}>\{?<PublicAtsCheck \/>\}?<\/Suspense>\} \/>/, '<Route path="/ats-check" element={<Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading ATS Checker...</div>}><ATSChecker /></Suspense>} />');

  // Remove missing route elements
  content = content.replace(/<Route path="\/verify\/:username" element=\{<Suspense fallback=\{null\}><PeerEndorsementPage \/><\/Suspense>\} \/>\r?\n?/, '');
  content = content.replace(/<Route path="\/reels\/:id" element=\{<Suspense fallback=\{null\}><PublicReelPage \/><\/Suspense>\} \/>\r?\n?/, '');
  content = content.replace(/<Route path="\/embed\/jobs\/:employerSlug" element=\{<Suspense fallback=\{null\}><EmployerJobsEmbed \/><\/Suspense>\} \/>\r?\n?/, '');
  content = content.replace(/<Route path="\/explore" element=\{<Suspense fallback=\{null\}><ExplorePage \/><\/Suspense>\} \/>\r?\n?/, '');
  content = content.replace(/<Route path="\/admin\/whatsapp-alerts" element=\{<AdminLayout><WhatsAppAlertsAdmin \/><\/AdminLayout>\} \/>\r?\n?/, '');
  content = content.replace(/<Route path="\/admin\/distribution-command-centre" element=\{<AdminLayout><DistributionCommandCentre \/><\/AdminLayout>\} \/>\r?\n?/, '');
  content = content.replace(/<Route path="\/admin\/distribution" element=\{<AdminLayout><DistributionCommandCentre \/><\/AdminLayout>\} \/>\r?\n?/, '');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully cleaned', filePath);
}

cleanApp('c:/Users/Arshid.Wani/talentxcel-local/src/App.tsx');
cleanApp('c:/Users/Arshid.Wani/talentxcel-main/src/App.tsx');

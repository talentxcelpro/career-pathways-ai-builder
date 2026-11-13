const fs = require('fs');
const path = require('path');

const jobsFile = path.join(__dirname, '..', 'src', 'pages', 'Jobs.tsx');
let content = fs.readFileSync(jobsFile, 'utf8');

// Replace OptimizedJobCard in regularJobs with TalentSparkJobCard
const targetBlock = `                          ) : (
                            <OptimizedJobCard
                              key={job.id}
                              job={job}
                              onSave={handleSaveJob}
                            onApply={handleQuickApply}
                            isSaved={savedJobs.includes(job.id)}
                          />
                          )`;

const replacementBlock = `                          ) : (
                            <TalentSparkJobCard
                              key={job.id}
                              job={job}
                              onSave={handleSaveJob}
                              onQuickApply={handleQuickApply}
                              isSaved={savedJobs.includes(job.id)}
                              txcReward={15}
                              viewMode={viewMode}
                            />
                          )`;

// Normalize line endings to test
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTarget = targetBlock.replace(/\r\n/g, '\n');
const normalizedReplacement = replacementBlock.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedTarget)) {
  const isCRLF = content.includes('\r\n');
  const finalReplacement = isCRLF ? replacementBlock.replace(/\n/g, '\r\n') : normalizedReplacement;
  const finalTarget = isCRLF ? targetBlock.replace(/\n/g, '\r\n') : normalizedTarget;
  
  content = content.replace(finalTarget, finalReplacement);
  fs.writeFileSync(jobsFile, content, 'utf8');
  console.log('✅ Replaced OptimizedJobCard with TalentSparkJobCard in Jobs.tsx');
} else {
  console.error('❌ Could not find target block in Jobs.tsx');
}

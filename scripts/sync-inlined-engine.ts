import fs from 'fs';
import path from 'path';

const designSystemContent = fs.readFileSync('src/lib/email/designSystem.ts', 'utf-8');
const catalogContent = fs.readFileSync('src/lib/email/enterpriseCatalog.ts', 'utf-8');

// Strip imports from catalogContent that come from designSystem
const cleanedCatalog = catalogContent.replace(/import\s*\{[^}]*\}\s*from\s*['"]\.\/designSystem(\.js)?['"];?/g, '');

const inlinedEngineContent = `/**
 * Master Inlined 25-Template Platform Engine for TalentXcel Serverless Routes
 * Real Data Schema, Apple Clean Aesthetic, 100% Platform Aligned, Zero Phantoms.
 */

${designSystemContent}

${cleanedCatalog}

export const renderTemplate = renderEnterpriseTemplate;
export const baseEmailLayout = wrapInMasterLayout;
`;

fs.writeFileSync('src/lib/email/inlinedEngine.ts', inlinedEngineContent, 'utf-8');
console.log('Generated src/lib/email/inlinedEngine.ts');

function updateServerlessFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const current = fs.readFileSync(filePath, 'utf-8');
  const handlerIndex = current.indexOf('// MAIN SERVERLESS HANDLER');
  if (handlerIndex === -1) {
    console.error('Could not find handler in', filePath);
    return;
  }
  const handlerPart = current.slice(handlerIndex);
  const updated = `import type { VercelRequest, VercelResponse } from '@vercel/node';\n\n${inlinedEngineContent}\n\n// ─────────────────────────────────────────────────────────────────────────────\n${handlerPart}`;
  fs.writeFileSync(filePath, updated, 'utf-8');
  console.log('Updated', filePath);
}

updateServerlessFile('api/email/send.ts');
updateServerlessFile('api/email/process-queue.ts');

const mainRepoPath = 'C:\\Users\\Arshid.Wani\\talentxcel-main';
if (fs.existsSync(mainRepoPath)) {
  fs.copyFileSync('src/lib/email/designSystem.ts', path.join(mainRepoPath, 'src/lib/email/designSystem.ts'));
  fs.copyFileSync('src/lib/email/enterpriseCatalog.ts', path.join(mainRepoPath, 'src/lib/email/enterpriseCatalog.ts'));
  fs.copyFileSync('src/lib/email/inlinedEngine.ts', path.join(mainRepoPath, 'src/lib/email/inlinedEngine.ts'));
  updateServerlessFile(path.join(mainRepoPath, 'api/email/send.ts'));
  updateServerlessFile(path.join(mainRepoPath, 'api/email/process-queue.ts'));
  console.log('Mirrored to talentxcel-main');
}

const fs = require('fs');

let content = fs.readFileSync('src/services/indianEducationService.ts', 'utf8');

const addition = `
/**
 * Data-driven indexability check for Indian Colleges:
 * A college page is indexable only when authentic accreditation data exists for it,
 * or when an explicit config flag / DB check marks it as indexable.
 * This allows founders to re-enable institutions in bulk or individually via data/config without code changes.
 */
export function isCollegeIndexable(institution?: IndianInstitution | any): boolean {
  if (!institution) return false;
  if (typeof institution.isIndexable === 'boolean') return institution.isIndexable;
  if (typeof institution.is_indexable === 'boolean') return institution.is_indexable;
  if (typeof process !== 'undefined' && process.env?.INDEX_ALL_COLLEGES === 'true') return true;

  const hasNirf = Boolean(
    institution.accreditation?.nirfRank ||
    institution.nirfRank2024 ||
    institution.nirf_rank
  );
  const isEminence = Boolean(
    institution.accreditation?.isInstituteOfEminence ||
    institution.isInstituteOfEminence
  );
  return hasNirf || isEminence;
}
`;

if (!content.includes('isCollegeIndexable')) {
  content = content.replace('export const indianEducationService = new IndianEducationService();', addition + '\nexport const indianEducationService = new IndianEducationService();');
  fs.writeFileSync('src/services/indianEducationService.ts', content, 'utf8');
  console.log('Successfully added isCollegeIndexable to src/services/indianEducationService.ts');
} else {
  console.log('Already present');
}

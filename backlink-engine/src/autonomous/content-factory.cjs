const crypto = require('node:crypto');
const TYPE_AUDIENCE = { COMPANY_DESCRIPTION: 'business', PRODUCT_DESCRIPTION: 'product', FOUNDER_PROFILE: 'founder', BUSINESS_LISTING: 'directory', CAREER_PLATFORM: 'careers', EDUCATION_RECRUITMENT: 'education_recruitment' };
function textFor(type, facts) {
  const company = facts.companyName || 'TalentXcel'; const site = facts.website || 'https://talentxcel.in';
  const product = facts.productName || 'career and recruitment platform'; const focus = facts.focus || 'career discovery, recruitment, and employability resources';
  const bodies = {
    COMPANY_DESCRIPTION: `${company} is an India-focused ${product} that helps people and organisations access practical ${focus}. Learn more at ${site}.`,
    PRODUCT_DESCRIPTION: `${company} provides ${product} for users seeking credible tools and information around ${focus}. The platform is available at ${site}.`,
    FOUNDER_PROFILE: `${facts.founderName || 'The TalentXcel team'} develops ${company}'s ${product}, focused on useful, factual resources for ${focus}.`,
    BUSINESS_LISTING: `${company} — ${product}. Category focus: ${focus}. Official website: ${site}.`,
    CAREER_PLATFORM: `${company} supports job seekers and career teams with a ${product} centred on ${focus}. Official resource: ${site}.`,
    EDUCATION_RECRUITMENT: `${company} offers career and recruitment resources for education and talent ecosystems, with an emphasis on ${focus}. Details: ${site}.`
  };
  return bodies[type];
}
function generate(type, facts = {}) {
  if (!TYPE_AUDIENCE[type]) throw new Error(`Unsupported content type: ${type}`);
  const body = textFor(type, facts); return { contentType: type, audience: TYPE_AUDIENCE[type], body, facts, contentHash: crypto.createHash('sha256').update(`${type}:${body}`).digest('hex') };
}
function store(db, opportunityId, asset) {
  db.prepare('INSERT OR IGNORE INTO autonomous_content_assets(opportunity_id,content_type,audience,body,facts_json,content_hash,created_at) VALUES(?,?,?,?,?,?,?)').run(opportunityId, asset.contentType, asset.audience, asset.body, JSON.stringify(asset.facts), asset.contentHash, new Date().toISOString());
  return db.prepare('SELECT * FROM autonomous_content_assets WHERE opportunity_id=? AND content_type=? AND audience=?').get(opportunityId, asset.contentType, asset.audience);
}
module.exports = { TYPE_AUDIENCE, generate, store };

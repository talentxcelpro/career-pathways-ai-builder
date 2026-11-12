function analyze({ sourceUrl, fetchedUrl, httpStatus, html = '', targetUrl = 'https://talentxcel.in', redirectChain = [], canonicalUrl = null } = {}) {
  const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const matching = links.find(m => m[1].replace(/\/$/,'') === targetUrl.replace(/\/$/,''));
  const tag = matching?.[0] || ''; const rel = (tag.match(/\brel=["']([^"']+)["']/i)?.[1] || '').toLowerCase();
  const attributes = rel.split(/\s+/).filter(Boolean); const found = Boolean(matching);
  const destinationMismatch = links.length > 0 && !found; const lost = httpStatus >= 400 || (httpStatus === 200 && !found);
  return { sourceUrl, fetchedUrl: fetchedUrl || sourceUrl, httpStatus, canonicalUrl, redirectChain, foundLink:found, destinationUrl:matching?.[1] || null, anchorText:matching?.[2].replace(/<[^>]*>/g,'').trim() || null, relAttributes:attributes, destinationMismatch, outcome: found ? 'LINK_FOUND' : lost ? 'LOST_OR_NOT_FOUND' : 'UNVERIFIABLE' };
}
function record(db, observation, { opportunityId = null, backlinkId = null, simulation = true } = {}) {
  if (simulation && observation.outcome === 'LINK_FOUND') throw new Error('SIMULATION_CANNOT_MARK_LINK_LIVE');
  db.prepare('INSERT INTO autonomous_verification_observations(opportunity_id,backlink_id,source_url,fetched_url,http_status,canonical_url,redirect_chain_json,found_link,destination_url,anchor_text,rel_attributes,outcome,evidence_json,is_simulation,observed_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(opportunityId,backlinkId,observation.sourceUrl,observation.fetchedUrl,observation.httpStatus,observation.canonicalUrl,JSON.stringify(observation.redirectChain),Number(observation.foundLink),observation.destinationUrl,observation.anchorText,observation.relAttributes.join(' '),observation.outcome,JSON.stringify({ destinationMismatch: observation.destinationMismatch }),Number(simulation),new Date().toISOString());
}
module.exports = { analyze, record };

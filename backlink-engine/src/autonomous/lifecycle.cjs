const { adapterFor } = require('./adapters.cjs');
function now() { return new Date().toISOString(); }
const TRANSITIONS = { DISCOVERED:['QUALIFIED'], QUALIFIED:['READY','PENDING_APPROVAL','REJECTED'], READY:['SUBMITTED','PENDING_APPROVAL','FAILED'], SUBMITTED:['PUBLISHED','PENDING_APPROVAL','FAILED'], PUBLISHED:['VERIFIED_LIVE','LOST','FAILED'], VERIFIED_LIVE:['LOST'], LOST:['PENDING_APPROVAL','READY'], PENDING_APPROVAL:['READY','REJECTED'], REJECTED:[], FAILED:['READY','PENDING_APPROVAL'] };
function transition(db, opportunityId, to, { simulation = false } = {}) {
  const row = db.prepare('SELECT * FROM autonomous_opportunities WHERE id=?').get(opportunityId); if (!row) throw new Error('Opportunity not found');
  if (!(TRANSITIONS[row.status] || []).includes(to)) throw new Error(`Invalid lifecycle transition ${row.status} -> ${to}`);
  if (simulation && ['PUBLISHED','VERIFIED_LIVE'].includes(to)) throw new Error('SIMULATION_CANNOT_MARK_LIVE');
  db.prepare('UPDATE autonomous_opportunities SET status=?,updated_at=? WHERE id=?').run(to,now(),opportunityId); return { from: row.status, to };
}
function simulateSubmission(db, { opportunityId, method = 'HTTP_FORM', endpoint, payload = {} }) {
  const row = db.prepare('SELECT * FROM autonomous_opportunities WHERE id=?').get(opportunityId); if (!row) throw new Error('Opportunity not found');
  if (row.status === 'DISCOVERED') transition(db,opportunityId,'QUALIFIED',{simulation:true});
  const current = db.prepare('SELECT status FROM autonomous_opportunities WHERE id=?').get(opportunityId).status;
  if (current === 'QUALIFIED') transition(db,opportunityId,'READY',{simulation:true});
  const adapter = adapterFor(method,{mode:'SIMULATION'}); if (!adapter) throw new Error('Unknown adapter');
  const result = adapter.execute({ endpoint, payload }); transition(db,opportunityId,'SUBMITTED',{simulation:true});
  const key = `simulation:${opportunityId}:${method}:${endpoint || ''}`;
  db.prepare(`INSERT OR IGNORE INTO autonomous_submissions(opportunity_id,idempotency_key,method,endpoint,status,receipt_json,attempts,submitted_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)`).run(opportunityId,key,method,endpoint || null,'SUBMITTED',JSON.stringify(result.receipt),1,now(),now(),now());
  const simulation = { actualStatus:'SUBMITTED', expectedExternalPath:['PUBLISHED','VERIFIED_LIVE'], publicationApplied:false, verificationApplied:false, receipt:result.receipt };
  db.prepare('INSERT INTO autonomous_simulation_runs(opportunity_id,scenario,result_json,created_at) VALUES(?,?,?,?)').run(opportunityId,method,JSON.stringify(simulation),now());
  return simulation;
}
module.exports = { TRANSITIONS, transition, simulateSubmission };

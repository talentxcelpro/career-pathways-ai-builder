const crypto = require('node:crypto');

function now() { return new Date().toISOString(); }
function audit(db, type, entityType, entityId, event) {
  db.prepare('INSERT INTO autonomous_audit_log(event_type,entity_type,entity_id,event_json,created_at) VALUES(?,?,?,?,?)')
    .run(type, entityType, String(entityId ?? ''), JSON.stringify(event), now());
}
function enqueue(db, { jobType, payload = {}, idempotencyKey, maxAttempts = 3, availableAt = now() }) {
  const key = idempotencyKey || crypto.createHash('sha256').update(`${jobType}:${JSON.stringify(payload)}`).digest('hex');
  db.prepare(`INSERT OR IGNORE INTO autonomous_jobs(job_type,payload_json,idempotency_key,max_attempts,available_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?)`)
    .run(jobType, JSON.stringify(payload), key, maxAttempts, availableAt, now(), now());
  const row = db.prepare('SELECT * FROM autonomous_jobs WHERE idempotency_key=?').get(key);
  audit(db, 'JOB_ENQUEUED', 'job', row.id, { jobType, key });
  return row;
}
function lease(db, { workerId, leaseSeconds = 300 }) {
  const token = crypto.randomUUID(); const until = new Date(Date.now() + leaseSeconds * 1000).toISOString();
  const row = db.prepare(`SELECT * FROM autonomous_jobs WHERE (status='QUEUED' OR (status='LEASED' AND leased_until<?)) AND available_at<=? ORDER BY id LIMIT 1`).get(now(), now());
  if (!row) return null;
  db.prepare(`UPDATE autonomous_jobs SET status='LEASED',lease_token=?,leased_until=?,updated_at=? WHERE id=?`).run(`${workerId}:${token}`, until, now(), row.id);
  audit(db, 'JOB_LEASED', 'job', row.id, { workerId });
  return db.prepare('SELECT * FROM autonomous_jobs WHERE id=?').get(row.id);
}
function complete(db, jobId, leaseToken, result = {}) {
  const r = db.prepare(`UPDATE autonomous_jobs SET status='SUCCEEDED',lease_token=NULL,leased_until=NULL,updated_at=? WHERE id=? AND status='LEASED' AND lease_token=?`).run(now(), jobId, leaseToken);
  if (!r.changes) throw new Error('Invalid or expired lease'); audit(db, 'JOB_SUCCEEDED', 'job', jobId, result);
}
function fail(db, jobId, leaseToken, error, retryDelaySeconds = 60) {
  const job = db.prepare('SELECT * FROM autonomous_jobs WHERE id=? AND lease_token=?').get(jobId, leaseToken);
  if (!job) throw new Error('Invalid or expired lease');
  const attempts = job.attempts + 1; const retry = attempts < job.max_attempts;
  db.prepare(`UPDATE autonomous_jobs SET status=?,attempts=?,last_error=?,available_at=?,lease_token=NULL,leased_until=NULL,updated_at=? WHERE id=?`)
    .run(retry ? 'QUEUED' : 'FAILED', attempts, String(error), new Date(Date.now() + retryDelaySeconds * 1000).toISOString(), now(), jobId);
  audit(db, retry ? 'JOB_REQUEUED' : 'JOB_FAILED', 'job', jobId, { error: String(error), attempts });
}
module.exports = { enqueue, lease, complete, fail };

function consume(db, { domain, globalKey = 'global', domainLimit = 5, globalLimit = 50, windowSeconds = 86400, at = new Date() }) {
  const now = at.toISOString();
  const windowStart = new Date(at.getTime() - windowSeconds * 1000).toISOString();
  const get = key => db.prepare('SELECT * FROM autonomous_rate_buckets WHERE bucket_key=?').get(key);
  const use = (key, limit) => {
    const row = get(key);
    if (!row || row.window_started_at < windowStart) {
      db.prepare('INSERT OR REPLACE INTO autonomous_rate_buckets(bucket_key,window_started_at,used) VALUES(?,?,1)').run(key, now); return true;
    }
    if (row.used >= limit) return false;
    db.prepare('UPDATE autonomous_rate_buckets SET used=used+1 WHERE bucket_key=?').run(key); return true;
  };
  if (!use(`domain:${domain}`, domainLimit)) return { allowed: false, reason: 'DOMAIN_RATE_LIMIT' };
  if (!use(`global:${globalKey}`, globalLimit)) return { allowed: false, reason: 'GLOBAL_RATE_LIMIT' };
  return { allowed: true };
}
module.exports = { consume };

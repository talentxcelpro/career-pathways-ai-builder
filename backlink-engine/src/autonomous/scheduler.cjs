const { enqueue } = require('./queue.cjs');
function scheduleDaily(db, date = new Date().toISOString().slice(0, 10)) {
  return [
    enqueue(db, { jobType: 'DISCOVER', payload: { date }, idempotencyKey: `daily:discover:${date}` }),
    enqueue(db, { jobType: 'QUALIFY', payload: { date }, idempotencyKey: `daily:qualify:${date}` }),
    enqueue(db, { jobType: 'VERIFY', payload: { date }, idempotencyKey: `daily:verify:${date}` }),
    enqueue(db, { jobType: 'REPORT', payload: { date }, idempotencyKey: `daily:report:${date}` })
  ];
}
module.exports = { scheduleDaily };

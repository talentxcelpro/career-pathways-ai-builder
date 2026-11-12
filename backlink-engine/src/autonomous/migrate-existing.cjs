const { DatabaseSync } = require('node:sqlite');
const config = require('../config.cjs');
const { migrate } = require('./migration.cjs');
const db = new DatabaseSync(config.PATHS.DB);
const before = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().length;
migrate(db);
const after = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().length;
console.log(JSON.stringify({ beforeTables: before, afterTables: after, additiveTables: after - before, integrity: db.prepare('PRAGMA integrity_check').get() }, null, 2));
db.close();

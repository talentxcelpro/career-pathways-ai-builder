const { DatabaseSync } = require('node:sqlite');
const config = require('../config.cjs');
const { migrate } = require('./migration.cjs');
const { seedQualifiedDomains } = require('./intelligence.cjs');
const db = new DatabaseSync(config.PATHS.DB); migrate(db);
console.log(JSON.stringify({ ...seedQualifiedDomains(db), integrity: db.prepare('PRAGMA integrity_check').get() }, null, 2));
db.close();

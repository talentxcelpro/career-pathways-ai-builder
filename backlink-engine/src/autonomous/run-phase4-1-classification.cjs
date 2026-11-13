const { DatabaseSync } = require('node:sqlite');
const config = require('../config.cjs');
const { migrate } = require('./migration.cjs');
const { classify } = require('./phase4-1-classifier.cjs');
const db = new DatabaseSync(config.PATHS.DB);
migrate(db);
classify(db,{concurrency:64}).then(r => { console.log(JSON.stringify(r,null,2)); console.log(JSON.stringify(db.prepare('PRAGMA integrity_check').get())); db.close(); }).catch(e => { console.error(e); db.close(); process.exitCode=1; });

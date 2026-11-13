const { DatabaseSync } = require('node:sqlite');
const config = require('../config.cjs');
const { migrate } = require('./migration.cjs');
const { evaluateTopTen, exportExecutionReport } = require('./live-pilot.cjs');
const db = new DatabaseSync(config.PATHS.DB); migrate(db); const results=evaluateTopTen(db); console.log(JSON.stringify(exportExecutionReport(db,results),null,2)); db.close();

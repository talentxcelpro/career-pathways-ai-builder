const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../data/backlink_engine.db');
const db = new DatabaseSync(DB_PATH);

const b6 = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch6_dedup_initial.json'), 'utf8'));

// Check against all tables in sqlite
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Database tables:', tables.map(t => t.name));

const allDbStrings = new Map();
tables.forEach(t => {
  try {
    const rows = db.prepare(`SELECT * FROM ${t.name}`).all();
    rows.forEach(r => {
      const rowStr = JSON.stringify(r).toLowerCase();
      b6.forEach(c => {
        if (!c.isDuplicate && rowStr.includes(c.canonicalRoot)) {
          console.log(`Match found in table ${t.name} for #${c.num} ${c.name} (${c.canonicalRoot})`);
        }
      });
    });
  } catch (e) {}
});

console.log('Full DB search completed.');

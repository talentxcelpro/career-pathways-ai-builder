const path = require('path');
const { getDatabase } = require(path.join(__dirname, '../db/schema.cjs'));
const db = getDatabase();

console.log('backlinks for saashub:', db.prepare("SELECT * FROM backlinks WHERE referring_domain LIKE '%saashub%'").all());
console.log('b2b_directory_profiles for saashub:', db.prepare("SELECT * FROM b2b_directory_profiles WHERE domain LIKE '%saashub%'").all());

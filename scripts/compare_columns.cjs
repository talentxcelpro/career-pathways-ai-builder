const fs = require('fs');

const prodCols = JSON.parse(fs.readFileSync('prod_profiles_columns.json', 'utf8'));
const stagingCols = JSON.parse(fs.readFileSync('staging_profiles_columns.json', 'utf8'));

const prodNames = prodCols.map(c => c.column_name);
const stagingNames = stagingCols.map(c => c.column_name);

console.log('Total prod columns:', prodNames.length);
console.log('Total staging columns:', stagingNames.length);

const onlyProd = prodNames.filter(c => !stagingNames.includes(c));
const onlyStaging = stagingNames.filter(c => !prodNames.includes(c));

console.log('\nColumns only in Prod (', onlyProd.length, '):', onlyProd.join(', '));
console.log('\nColumns only in Staging (', onlyStaging.length, '):', onlyStaging.join(', '));

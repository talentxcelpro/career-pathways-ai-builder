const fs = require('fs');

let c = fs.readFileSync('src/App.tsx', 'utf8');
const badStr = 'return <Navigate to={${target}} replace />;';
const goodStr = 'return <Navigate to={target + location.search} replace />;';

if (!c.includes(badStr)) {
  console.error('badStr not found');
  process.exit(1);
}

c = c.replace(badStr, goodStr);
fs.writeFileSync('src/App.tsx', c);
console.log('Successfully replaced with goodStr in App.tsx');

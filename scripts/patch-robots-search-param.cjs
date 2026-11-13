const fs = require('fs');

function updateRobotsFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace Allow: /jobs?search= with Disallow: /*?*search=
  content = content.replace(/Allow:\s*\/jobs\?search=\r?\n/g, 'Disallow: /*?*search=\n');
  content = content.replace(/Allow:\s*\/colleges\?search=\r?\n/g, '');

  // Remove Disallow: /*?*page= to ensure pagination is never blocked
  content = content.replace(/Disallow:\s*\/\*\?\*page=\r?\n/g, '');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}

['public/robots.txt', 'public/robots-root.txt', 'public/robots-jobs.txt'].forEach(f => {
  if (fs.existsSync(f)) {
    updateRobotsFile(f);
  }
});

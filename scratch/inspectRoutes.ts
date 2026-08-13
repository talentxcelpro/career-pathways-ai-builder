import fs from 'fs';
import path from 'path';

function inspectNavigationRoutes() {
  const navDir = path.resolve('src', 'navigation');
  const files = fs.readdirSync(navDir);

  files.forEach((file) => {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(path.join(navDir, file), 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('to:')) {
          console.log(`${file}:${idx + 1} → ${line.trim()}`);
        }
      });
    }
  });
}

inspectNavigationRoutes();

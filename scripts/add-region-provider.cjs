const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

if (!content.includes('RegionProvider')) {
  content = content.replace(
    'import { OptimizedAuthProvider } from "./contexts/OptimizedAuthContext";',
    'import { OptimizedAuthProvider } from "./contexts/OptimizedAuthContext";\r\nimport { RegionProvider } from "@/contexts/RegionContext";'
  );
  content = content.replace(
    '<OptimizedAuthProvider>\r\n              <GoogleOneTapLogin',
    '<OptimizedAuthProvider>\r\n            <RegionProvider>\r\n              <GoogleOneTapLogin'
  );
  content = content.replace(
    '</OptimizedAuthProvider>\r\n              </BrowserRouter>',
    '</RegionProvider>\r\n                  </OptimizedAuthProvider>\r\n              </BrowserRouter>'
  );
  fs.writeFileSync(appPath, content, 'utf8');
  console.log('App.tsx successfully updated with RegionProvider!');
} else {
  console.log('RegionProvider already present');
}

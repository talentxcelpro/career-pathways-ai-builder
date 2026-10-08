const fs = require('fs');
const path = 'src/components/auth/LoginForm.tsx';
let content = fs.readFileSync(path, 'utf8');

// Just remove `: any` from catch
content = content.replace(/catch \(error: any\)/g, 'catch (error)');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed LoginForm catch syntax');

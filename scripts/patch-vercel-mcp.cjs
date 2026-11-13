const fs = require('fs');
let c = fs.readFileSync('vercel.json', 'utf8');

if (c.includes('"source": "/api/mcp"')) {
  console.log('Already patched!');
  process.exit(0);
}

const target = '"destination": "/api/badge"\n    },';
const targetCRLF = '"destination": "/api/badge"\r\n    },';

const addition = `
    {
      "source": "/api/mcp",
      "destination": "/api/mcp"
    },
    {
      "source": "/api/mcp/:path*",
      "destination": "/api/mcp/:path*"
    },`;

if (c.includes(targetCRLF)) {
  c = c.replace(targetCRLF, '"destination": "/api/badge"\r\n    },' + addition.replace(/\n/g, '\r\n'));
  fs.writeFileSync('vercel.json', c);
  console.log('Patched with CRLF!');
} else if (c.includes(target)) {
  c = c.replace(target, '"destination": "/api/badge"\n    },' + addition);
  fs.writeFileSync('vercel.json', c);
  console.log('Patched with LF!');
} else {
  console.error('Target not found!');
  process.exit(1);
}

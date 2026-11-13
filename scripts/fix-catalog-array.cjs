// scripts/fix-catalog-array.cjs
const fs = require('fs');
const path = require('path');

const targetFilePath = path.join(__dirname, '../src/data/careerPathwaysCatalog.ts');
let content = fs.readFileSync(targetFilePath, 'utf8');

// Find the premature ]; after the 45th transition
const prematureStr = "'Target CFO mandates on JobMatch OS executive network'\n        ]\n      }\n    ]\n  }\n];";
const fixedPrematureStr = "'Target CFO mandates on JobMatch OS executive network'\n        ]\n      }\n    ]\n  },";

if (content.includes(prematureStr)) {
  content = content.replace(prematureStr, fixedPrematureStr);
  console.log('Fixed premature closing with exact match!');
} else {
  // Try CRLF
  const prematureStrCRLF = "'Target CFO mandates on JobMatch OS executive network'\r\n        ]\r\n      }\r\n    ]\r\n  }\r\n];";
  const fixedPrematureStrCRLF = "'Target CFO mandates on JobMatch OS executive network'\r\n        ]\r\n      }\r\n    ]\r\n  },";
  if (content.includes(prematureStrCRLF)) {
    content = content.replace(prematureStrCRLF, fixedPrematureStrCRLF);
    console.log('Fixed premature closing with CRLF match!');
  } else {
    console.log('Searching via regex...');
    content = content.replace(/('Target CFO mandates on JobMatch OS executive network'[\s\S]*?\}\s*\]\s*\}\s*)\s*\];/, '$1},');
  }
}

// Ensure the array is properly closed right before export const generateCustomCareerTransition =
const genMarker = 'export const generateCustomCareerTransition =';
const idx = content.indexOf(genMarker);
if (idx !== -1) {
  const before = content.slice(idx - 60, idx);
  console.log('Before genMarker:', JSON.stringify(before));
  if (!before.includes('];')) {
    // replace trailing comma with ];
    content = content.slice(0, idx).replace(/,\s*$/, '\n];\n\n') + content.slice(idx);
    console.log('Added closing array bracket before generator!');
  }
}

fs.writeFileSync(targetFilePath, content, 'utf8');
console.log('Fix script complete!');

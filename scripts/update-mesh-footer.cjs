const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/components/navigation/SubdomainMeshFooter.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// Replace ATS links with apex canonical paths
code = code.replace(
  /<li>[\r\n\s]*<a href="https:\/\/resume\.talentxcel\.in\/resume\/ats-check"[\s\S]*?<\/li>/,
  `<li>
                <a href="https://talentxcel.in/ats-check" className="hover:text-white transition-colors">
                  Free In-Browser ATS Scanner
                </a>
              </li>
              <li>
                <a href="https://talentxcel.in/resume-builder" className="hover:text-white transition-colors">
                  Live AI Resume Builder & Studio
                </a>
              </li>`
);

// Under Passport Universe, ensure apex links
code = code.replace(
  /<li>[\r\n\s]*<a href="https:\/\/passport\.talentxcel\.in\/passport"[\s\S]*?<\/li>/,
  `<li>
                <a href="https://talentxcel.in/passport" className="hover:text-white transition-colors">
                  Claim Career Passport Handle
                </a>
              </li>
              <li>
                <a href="https://talentxcel.in/network" className="hover:text-white transition-colors">
                  Professional Member Directory
                </a>
              </li>`
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('✓ Successfully updated SubdomainMeshFooter with apex PLG routes');

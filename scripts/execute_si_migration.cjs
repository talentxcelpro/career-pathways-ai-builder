const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(path.join(dir, f));
        }
    });
}

const replacements = [
    { pattern: /\bTalentXcel AI\b/g, replacement: 'TalentXcel SI' },
    { pattern: /\bAI Resume Builder\b/g, replacement: 'SI Resume Builder' },
    { pattern: /\bAI Resume\b/g, replacement: 'SI Resume' },
    { pattern: /\bAI Job Matching\b/g, replacement: 'SI Job Matching' },
    { pattern: /\bAI Job Match\b/g, replacement: 'SI Job Match' },
    { pattern: /\bAI Career Coach\b/g, replacement: 'SI Career Coach' },
    { pattern: /\bAI Job Search\b/g, replacement: 'SI Job Search' },
    { pattern: /\bAI Career Assistant\b/g, replacement: 'TalentXcel SI Career Assistant' },
    { pattern: /\bAI Application Assistant\b/g, replacement: 'SI Application Assistant' },
    { pattern: /\bAI Score\b/g, replacement: 'TalentScore' },
    { pattern: /\bAI Education Intelligence\b/g, replacement: 'SI Education Intelligence' },
    { pattern: /\bAI Recruiter\b/g, replacement: 'TalentXcel SI Recruiter' },
    { pattern: /\bRecruiter AI\b/g, replacement: 'Recruiter SI' },
    { pattern: /\bAI-powered Career platform\b/gi, replacement: 'SI-powered Career & Talent Intelligence Platform' },
    { pattern: /\bAI-powered career platform\b/gi, replacement: 'SI-powered Career & Talent Intelligence Platform' },
    { pattern: /\bAI-powered\b/g, replacement: 'SI-powered' },
    { pattern: /\bAI Agent\b/g, replacement: 'SI Agent' },
    { pattern: /\bAI Career Agent\b/g, replacement: 'SI Career Agent' },
    { pattern: /\bAI Assistant\b/g, replacement: 'SI Assistant' },
    { pattern: /\bAI Intelligence\b/g, replacement: 'SI Intelligence' }
];

let filesModified = 0;

walkDir('./src', (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        replacements.forEach(({ pattern, replacement }) => {
            content = content.replace(pattern, replacement);
        });

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            filesModified++;
        }
    }
});

console.log(`Migration complete. Modified ${filesModified} files.`);

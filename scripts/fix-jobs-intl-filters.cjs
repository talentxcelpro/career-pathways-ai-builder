// Fix Jobs.tsx: add country/currency/applicant_eligibility to filtersSchema and initial state
const fs = require('fs');
const path = require('path');

const jobsFile = path.join(__dirname, '..', 'src', 'pages', 'Jobs.tsx');
let content = fs.readFileSync(jobsFile, 'utf8');

// 1. Add fields to filtersSchema (after company_id line, before }).passthrough())
const schemaTarget = "  company_id: z.string().optional(),\r\n}).passthrough();";
const schemaReplacement = `  company_id: z.string().optional(),\r\n  country: z.array(z.string()).optional(),\r\n  currency: z.array(z.string()).optional(),\r\n  applicant_eligibility: z.array(z.string()).optional(),\r\n}).passthrough();`;

if (content.includes(schemaTarget)) {
  content = content.replace(schemaTarget, schemaReplacement);
  console.log('✅ Added international fields to filtersSchema');
} else {
  // Try LF variant
  const schemaTargetLF = "  company_id: z.string().optional(),\n}).passthrough();";
  const schemaReplacementLF = `  company_id: z.string().optional(),\n  country: z.array(z.string()).optional(),\n  currency: z.array(z.string()).optional(),\n  applicant_eligibility: z.array(z.string()).optional(),\n}).passthrough();`;
  if (content.includes(schemaTargetLF)) {
    content = content.replace(schemaTargetLF, schemaReplacementLF);
    console.log('✅ Added international fields to filtersSchema (LF)');
  } else {
    console.error('❌ Could not find filtersSchema target');
  }
}

// 2. Add fields to initial filters state (after company_id: ... line in useState)
const stateTarget = "      company_id: searchParams.get('company') || '',\r\n    };\r\n  });";
const stateReplacement = `      company_id: searchParams.get('company') || '',\r\n      country: [],\r\n      currency: [],\r\n      applicant_eligibility: [],\r\n    };\r\n  });`;

if (content.includes(stateTarget)) {
  content = content.replace(stateTarget, stateReplacement);
  console.log('✅ Added international fields to initial filters state');
} else {
  const stateTargetLF = "      company_id: searchParams.get('company') || '',\n    };\n  });";
  const stateReplacementLF = `      company_id: searchParams.get('company') || '',\n      country: [],\n      currency: [],\n      applicant_eligibility: [],\n    };\n  });`;
  if (content.includes(stateTargetLF)) {
    content = content.replace(stateTargetLF, stateReplacementLF);
    console.log('✅ Added international fields to initial filters state (LF)');
  } else {
    console.error('❌ Could not find initial state target');
    // Show surrounding context for debugging
    const idx = content.indexOf("company_id: searchParams");
    if (idx !== -1) {
      console.log('Context around company_id:', JSON.stringify(content.slice(idx - 5, idx + 100)));
    }
  }
}

fs.writeFileSync(jobsFile, content, 'utf8');
console.log('✅ Jobs.tsx patched successfully');

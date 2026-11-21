/**
 * Candidate Deduplication & Data Integrity Engine Test Suite
 */

const assert = require('assert');

// 1. Email Normalization
function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  let cleaned = email.trim().toLowerCase();
  cleaned = cleaned.replace(/^[<"'\s]+|[>"'\s]+$/g, '');
  if (!cleaned.includes('@')) return '';
  const parts = cleaned.split('@');
  if (parts.length !== 2) return '';
  let [local, domain] = parts;
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    local = local.split('+')[0];
    local = local.replace(/\./g, '');
    domain = 'gmail.com';
  } else {
    local = local.split('+')[0];
  }
  return `${local}@${domain}`;
}

// 2. Phone Normalization
function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length < 8) return '';
  if (!hasPlus && digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    return `+91${digitsOnly.slice(1)}`;
  }
  if (!hasPlus && digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }
  if (!hasPlus && digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return `+${digitsOnly}`;
  }
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
}

// 3. Name Normalization
function normalizeName(name) {
  if (!name || typeof name !== 'string') return '';
  let cleaned = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  cleaned = cleaned.replace(/^(mr|mrs|ms|dr|prof|er|engr)\.?\s+/i, '');
  cleaned = cleaned.replace(/\.(pdf|docx?|txt)$/i, '');
  cleaned = cleaned.replace(/\b(cv|resume|curriculum vitae|profile)\b/gi, '');
  cleaned = cleaned.replace(/[^a-z\s]/g, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}

// 4. Levenshtein Distance
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
  }
  return matrix[b.length][a.length];
}

function calculateNameSimilarity(name1, name2) {
  const norm1 = normalizeName(name1);
  const norm2 = normalizeName(name2);
  if (!norm1 || !norm2) return 0;
  if (norm1 === norm2) return 1.0;
  const tokens1 = new Set(norm1.split(' ').filter(Boolean));
  const tokens2 = new Set(norm2.split(' ').filter(Boolean));
  let intersection = 0;
  for (const t of tokens1) if (tokens2.has(t)) intersection++;
  const union = new Set([...tokens1, ...tokens2]).size;
  const tokenSim = union > 0 ? intersection / union : 0;
  const maxLen = Math.max(norm1.length, norm2.length);
  const editDist = levenshteinDistance(norm1, norm2);
  const editSim = maxLen > 0 ? Math.max(0, 1 - editDist / maxLen) : 0;
  return Number((tokenSim * 0.6 + editSim * 0.4).toFixed(3));
}

function runTests() {
  console.log('Running Candidate Deduplication Engine Tests...\n');

  // Test 1: Email Normalization
  assert.strictEqual(normalizeEmail('  Vivek.Kumar+test@GMAIL.COM  '), 'vivekkumar@gmail.com');
  assert.strictEqual(normalizeEmail('john.doe@company.org'), 'john.doe@company.org');
  assert.strictEqual(normalizeEmail('invalid-email-format'), '');
  console.log('  ✓ Test 1 Passed: Email normalization & Gmail dot/plus stripping');

  // Test 2: Phone Normalization
  assert.strictEqual(normalizePhone('+91 98765-43210'), '+919876543210');
  assert.strictEqual(normalizePhone('(0) 9876543210'), '+919876543210');
  assert.strictEqual(normalizePhone('9876543210'), '+919876543210');
  assert.strictEqual(normalizePhone('123'), ''); // Too short
  console.log('  ✓ Test 2 Passed: Phone normalization & India country-code standardizer');

  // Test 3: Name Normalization & Fuzzy Similarity
  assert.strictEqual(normalizeName('Mr. Vivek Kumar  (CV)'), 'vivek kumar');
  assert.strictEqual(normalizeName('Dr. Rajesh Govardhan Data'), 'rajesh govardhan data');
  const simExact = calculateNameSimilarity('Vivek Kumar', 'vivek kumar');
  assert.strictEqual(simExact, 1.0);
  const simVariation = calculateNameSimilarity('Rajesh Govardhan Data', 'Rajesh Govardhan');
  assert(simVariation > 0.7, `Expected similarity > 0.7, got ${simVariation}`);
  console.log(`  ✓ Test 3 Passed: Name normalization & fuzzy similarity (${simVariation})`);

  // Test 4: Confirmed Duplicate Resolution
  const candA = {
    id: 'cand-1',
    name: 'Rajesh Govardhan',
    email: 'rajesh_og@aol.in',
    phone: '+919876543210',
    resume_url: 'https://storage.talentxcel.in/resumes/rajesh.pdf',
    skills: ['Python', 'SQL', 'Data Analytics']
  };

  const candB = {
    id: 'cand-2',
    name: 'Rajesh Govardhan Data',
    email: 'rajesh_og@aol.in',
    phone: null,
    resume_url: null,
    skills: ['Python', 'ETL']
  };

  const emailMatch = normalizeEmail(candA.email) === normalizeEmail(candB.email);
  assert.strictEqual(emailMatch, true);
  console.log('  ✓ Test 4 Passed: Exact email duplicate match confirmed');

  console.log('\nAll 4 Engine Unit Tests PASSED with 100% compliance!\n');
}

runTests();

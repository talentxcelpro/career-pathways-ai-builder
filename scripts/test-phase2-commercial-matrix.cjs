// scripts/test-phase2-commercial-matrix.cjs
// Automated Verification Suite for TalentXcel Phase 2: Central Revenue Pro & Commercial OS

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('='.repeat(70));
console.log('TALENTXCEL PHASE 2 COMMERCIAL OPERATING SYSTEM VERIFICATION');
console.log('='.repeat(70));

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// 1. Central Plan Catalogue Integrity
// ---------------------------------------------------------------------------
const planCataloguePath = path.join(__dirname, '..', 'src', 'services', 'billing', 'planCatalogue.ts');
const planCatalogueContent = fs.readFileSync(planCataloguePath, 'utf8');

test('Plan Catalogue file exists and is populated', () => {
  assert(fs.existsSync(planCataloguePath), 'planCatalogue.ts must exist');
  assert(planCatalogueContent.length > 5000, 'planCatalogue.ts must contain rich definitions');
});

test('All 5 approved tiers exist: free, starter, pro, max, business', () => {
  assert(planCatalogueContent.includes("id: 'free'"), "Free tier must exist");
  assert(planCatalogueContent.includes("id: 'starter'"), "Starter tier must exist");
  assert(planCatalogueContent.includes("id: 'pro'"), "Pro tier must exist");
  assert(planCatalogueContent.includes("id: 'max'"), "Max tier must exist");
  assert(planCatalogueContent.includes("id: 'business'"), "Business tier must exist");
});

test('Starter pricing is exactly ₹299 (29,900 paise)', () => {
  assert(planCatalogueContent.includes('monthlyPriceRupees: 299'), 'Starter monthlyPriceRupees must be 299');
  assert(planCatalogueContent.includes('monthlyPricePaise: 29900'), 'Starter monthlyPricePaise must be 29900');
});

test('Pro pricing is exactly ₹499 (49,900 paise)', () => {
  assert(planCatalogueContent.includes('monthlyPriceRupees: 499'), 'Pro monthlyPriceRupees must be 499');
  assert(planCatalogueContent.includes('monthlyPricePaise: 49900'), 'Pro monthlyPricePaise must be 49900');
});

test('Max pricing is exactly ₹999 (99,900 paise)', () => {
  assert(planCatalogueContent.includes('monthlyPriceRupees: 999'), 'Max monthlyPriceRupees must be 999');
  assert(planCatalogueContent.includes('monthlyPricePaise: 99900'), 'Max monthlyPricePaise must be 99900');
});

test('Business pricing is exactly ₹2,499 (249,900 paise)', () => {
  assert(planCatalogueContent.includes('monthlyPriceRupees: 2499'), 'Business monthlyPriceRupees must be 2499');
  assert(planCatalogueContent.includes('monthlyPricePaise: 249900'), 'Business monthlyPricePaise must be 249900');
});

test('Annual billing is unpublished pending separate approval', () => {
  assert(planCatalogueContent.includes('isAnnualPublished: false'), 'Annual pricing must remain unpublished');
});

test('All 3 approved AI Credit Packs exist with exact paise pricing', () => {
  assert(planCatalogueContent.includes("id: 'ai-pack-100'") && planCatalogueContent.includes('pricePaise: 19900'), '100 Credits pack must be 19900 paise');
  assert(planCatalogueContent.includes("id: 'ai-pack-300'") && planCatalogueContent.includes('pricePaise: 49900'), '300 Credits pack must be 49900 paise');
  assert(planCatalogueContent.includes("id: 'ai-pack-1000'") && planCatalogueContent.includes('pricePaise: 149900'), '1000 Credits pack must be 149900 paise');
});

// ---------------------------------------------------------------------------
// 2. Database Migration & Schema Invariants
// ---------------------------------------------------------------------------
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261112000000_central_revenue_pro_and_entitlements.sql');
const migrationContent = fs.readFileSync(migrationPath, 'utf8');

test('Migration creates payment_webhook_events table with unique event_id', () => {
  assert(migrationContent.includes('CREATE TABLE IF NOT EXISTS public.payment_webhook_events'), 'Must create payment_webhook_events');
  assert(migrationContent.includes('UNIQUE (event_id)'), 'Must enforce UNIQUE event_id for replay protection');
});

test('Migration creates user_credit_wallets and credit_transactions tables', () => {
  assert(migrationContent.includes('CREATE TABLE IF NOT EXISTS public.user_credit_wallets'), 'Must create user_credit_wallets');
  assert(migrationContent.includes('CREATE TABLE IF NOT EXISTS public.credit_transactions'), 'Must create credit_transactions');
});

test('Migration defines resolve_authoritative_plan RPC', () => {
  assert(migrationContent.includes('CREATE OR REPLACE FUNCTION public.resolve_authoritative_plan'), 'Must define resolve_authoritative_plan');
});

test('Migration defines atomic consume_feature_quota_v2 RPC', () => {
  assert(migrationContent.includes('CREATE OR REPLACE FUNCTION public.consume_feature_quota_v2'), 'Must define consume_feature_quota_v2');
  assert(migrationContent.includes('ON CONFLICT (user_id, usage_type, period_start)'), 'Must enforce atomic on-conflict row locking');
});

test('Migration defines atomic recharge_ai_credits RPC', () => {
  assert(migrationContent.includes('CREATE OR REPLACE FUNCTION public.recharge_ai_credits'), 'Must define recharge_ai_credits');
});

// ---------------------------------------------------------------------------
// 3. Edge Functions Security & Authoritative Pricing
// ---------------------------------------------------------------------------
const createOrderPath = path.join(__dirname, '..', 'supabase', 'functions', 'razorpay-create-order', 'index.ts');
const createOrderContent = fs.readFileSync(createOrderPath, 'utf8');

test('razorpay-create-order enforces canonical integer paise pricing', () => {
  assert(createOrderContent.includes('starter:  { tier: "starter",  planName: "TalentXcel Starter",  priceRupees: 299,  pricePaise: 29900 }'), 'Must enforce Starter canonical price');
  assert(createOrderContent.includes('pro:      { tier: "pro",      planName: "TalentXcel Pro",      priceRupees: 499,  pricePaise: 49900 }'), 'Must enforce Pro canonical price');
  assert(createOrderContent.includes('max:      { tier: "max",      planName: "TalentXcel Max",      priceRupees: 999,  pricePaise: 99900 }'), 'Must enforce Max canonical price');
  assert(createOrderContent.includes('business: { tier: "business", planName: "TalentXcel Business", priceRupees: 2499, pricePaise: 249900 }'), 'Must enforce Business canonical price');
});

test('razorpay-create-order enforces AI credit pack canonical pricing', () => {
  assert(createOrderContent.includes("'ai-pack-100':  { credits: 100,  priceRupees: 199,  pricePaise: 19900 }"), '100 credits pack canonical mapping');
  assert(createOrderContent.includes("'ai-pack-300':  { credits: 300,  priceRupees: 499,  pricePaise: 49900 }"), '300 credits pack canonical mapping');
  assert(createOrderContent.includes("'ai-pack-1000': { credits: 1000, priceRupees: 1499, pricePaise: 149900 }"), '1000 credits pack canonical mapping');
});

test('razorpay-create-order provides simulated mock order for sandbox', () => {
  assert(createOrderContent.includes('mockOrderId'), 'Must support local sandbox simulation');
});

const webhookPath = path.join(__dirname, '..', 'supabase', 'functions', 'razorpay-webhook', 'index.ts');
const webhookContent = fs.readFileSync(webhookPath, 'utf8');

test('razorpay-webhook enforces replay protection and idempotency ledger', () => {
  assert(webhookContent.includes('payment_webhook_events'), 'Must query and write to payment_webhook_events');
  assert(webhookContent.includes('event_id') || webhookContent.includes('eventId'), 'Must check event_id in ledger');
  assert(webhookContent.includes('already processed'), 'Must log duplicate acknowledgement');
});

test('razorpay-webhook enforces 5-day grace period on payment failure', () => {
  assert(webhookContent.includes('5 * 24 * 60 * 60 * 1000'), 'Must calculate exact 5-day grace period in ms');
  assert(webhookContent.includes("status: \"past_due\"") || webhookContent.includes("status: 'past_due'"), 'Must mark status as past_due during grace period');
});

test('razorpay-webhook enforces non-destructive cancellation at period end', () => {
  assert(webhookContent.includes('cancel_at_period_end: true'), 'Must set cancel_at_period_end on cancellation event');
});

// ---------------------------------------------------------------------------
// 4. Frontend Billing & Entitlements Engine
// ---------------------------------------------------------------------------
const entitlementEnginePath = path.join(__dirname, '..', 'src', 'services', 'billing', 'entitlementEngine.ts');
const entitlementEngineContent = fs.readFileSync(entitlementEnginePath, 'utf8');

test('EntitlementEngine handles 80% quota threshold warnings', () => {
  assert(entitlementEngineContent.includes('usagePercent >= entitlement.warningThresholdPercent'), 'Must compute warning threshold');
});

test('EntitlementEngine allows AI credit fallback for exhausted quotas', () => {
  assert(entitlementEngineContent.includes('canUseCredits'), 'Must allow AI credits fallback');
});

const hookPath = path.join(__dirname, '..', 'src', 'hooks', 'useCentralEntitlements.ts');
test('useCentralEntitlements hook exists and exports central state', () => {
  assert(fs.existsSync(hookPath), 'useCentralEntitlements.ts must exist');
  const content = fs.readFileSync(hookPath, 'utf8');
  assert(content.includes('export function useCentralEntitlements'), 'Must export useCentralEntitlements');
});

// ---------------------------------------------------------------------------
// 5. UI Billing Components & Routes
// ---------------------------------------------------------------------------
const upgradeModalPath = path.join(__dirname, '..', 'src', 'components', 'billing', 'UpgradeModal.tsx');
test('UpgradeModal presents all approved plans with Light SaaS design', () => {
  assert(fs.existsSync(upgradeModalPath), 'UpgradeModal.tsx must exist');
  const content = fs.readFileSync(upgradeModalPath, 'utf8');
  assert(content.includes("['starter', 'pro', 'max', 'business']"), 'Must render starter, pro, max, business');
  assert(content.includes('loadRazorpayScript'), 'Must use loadRazorpayScript');
});

const creditModalPath = path.join(__dirname, '..', 'src', 'components', 'billing', 'AiCreditPackModal.tsx');
test('AiCreditPackModal handles credit pack purchases', () => {
  assert(fs.existsSync(creditModalPath), 'AiCreditPackModal.tsx must exist');
});

const billingDashboardPath = path.join(__dirname, '..', 'src', 'pages', 'billing', 'CentralBillingDashboard.tsx');
test('CentralBillingDashboard exists and renders quota meters across products', () => {
  assert(fs.existsSync(billingDashboardPath), 'CentralBillingDashboard.tsx must exist');
  const content = fs.readFileSync(billingDashboardPath, 'utf8');
  assert(content.includes('Monthly Usage Quotas'), 'Must display quota meters');
  assert(content.includes('ResumeStudio'), 'Must meter ResumeStudio');
  assert(content.includes('JobMatch OS'), 'Must meter JobMatch OS');
  assert(content.includes('PayScale'), 'Must meter PayScale');
});

const commandCenterPath = path.join(__dirname, '..', 'src', 'pages', 'admin', 'RevenueCommandCenter.tsx');
test('RevenueCommandCenter exists and calculates MRR, ARR and 9-product breakdown', () => {
  assert(fs.existsSync(commandCenterPath), 'RevenueCommandCenter.tsx must exist');
  const content = fs.readFileSync(commandCenterPath, 'utf8');
  assert(content.includes('Monthly Recurring Revenue'), 'Must display MRR');
  assert(content.includes('arrInRupees = mrrInRupees * 12'), 'Must calculate ARR');
  assert(content.includes('Nine-Product Ecosystem Revenue Attribution'), 'Must attribute across all 9 products');
});

const appPath = path.join(__dirname, '..', 'src', 'App.tsx');
test('App.tsx mounts /billing and /admin/revenue-command-center routes', () => {
  const content = fs.readFileSync(appPath, 'utf8');
  assert(content.includes('path="/billing"'), 'Must mount /billing');
  assert(content.includes('path="/admin/revenue-command-center"'), 'Must mount /admin/revenue-command-center');
});

// ---------------------------------------------------------------------------
// 6. Nine Product Integration Coverage
// ---------------------------------------------------------------------------
const productsToCheck = [
  { file: 'src/components/products/ResumeStudioProduct.tsx', name: 'ResumeStudio' },
  { file: 'src/components/products/JobMatchProduct.tsx', name: 'JobMatch OS' },
  { file: 'src/components/products/PayScaleProduct.tsx', name: 'PayScale' },
  { file: 'src/components/products/CampusOSProduct.tsx', name: 'CampusOS' },
  { file: 'src/components/products/SarkariHubProduct.tsx', name: 'SarkariHub' },
  { file: 'src/components/products/CareerPathfinderProduct.tsx', name: 'Career Pathfinder' },
  { file: 'src/components/products/SkillPodsProduct.tsx', name: 'SkillPods' },
  { file: 'src/pages/passport/components/PassportAcquisitionLanding.tsx', name: 'Career Passport' },
  { file: 'src/pages/recruiters/RecruiterLandingPage.tsx', name: 'Recruiter Workspace' },
];

for (const p of productsToCheck) {
  test(`${p.name} integrates useCentralEntitlements and UpgradeModal`, () => {
    const fullPath = path.join(__dirname, '..', p.file);
    assert(fs.existsSync(fullPath), `${p.file} must exist`);
    const content = fs.readFileSync(fullPath, 'utf8');
    assert(content.includes('useCentralEntitlements'), `${p.name} must call useCentralEntitlements`);
    assert(content.includes('UpgradeModal'), `${p.name} must mount UpgradeModal`);
  });
}

console.log('='.repeat(70));
console.log(`TOTAL PHASE 2 TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
console.log('='.repeat(70));

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}

// scripts/fix-all-dropdowns.cjs
const fs = require('fs');
const path = require('path');

const targetFilePath = path.join(__dirname, '../src/components/products/CareerPathfinderProduct.tsx');
let content = fs.readFileSync(targetFilePath, 'utf8');

// 1. Fix Platform Dropdown (line 442)
// Old: <div className="absolute top-full left-0 w-76 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in-50 slide-in-from-top-2">
content = content.replace(
  /\{activeNavDropdown === 'platform' && \(\s*<div className="absolute top-full left-0 w-76 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50[^"]*">/,
  `{activeNavDropdown === 'platform' && (
                  <div 
                    style={{ width: '360px', minWidth: '360px', maxWidth: '90vw' }}
                    className="absolute top-full left-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in-50 slide-in-from-top-2"
                  >`
);

// 2. Fix Solutions Dropdown (line 505)
content = content.replace(
  /\{activeNavDropdown === 'solutions' && \(\s*<div className="absolute top-full left-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50[^"]*">/,
  `{activeNavDropdown === 'solutions' && (
                  <div 
                    style={{ width: '380px', minWidth: '380px', maxWidth: '90vw' }}
                    className="absolute top-full left-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in-50 slide-in-from-top-2"
                  >`
);

// 3. Fix Products Dropdown
content = content.replace(
  /\{activeNavDropdown === 'products' && \(\s*<div[^>]*style=\{\{\s*width:\s*'520px'[^>]*>[^<]*<div className="flex items-center justify-between/g,
  `{activeNavDropdown === 'products' && (
                  <div 
                    style={{ width: '520px', minWidth: '520px', maxWidth: '90vw' }}
                    className="absolute top-full left-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in-50 slide-in-from-top-2"
                  >
                    <div className="flex items-center justify-between`
);

// In case it's still with w-[440px]
content = content.replace(
  /\{activeNavDropdown === 'products' && \(\s*<div className="absolute top-full left-0 w-\[440px\][^"]*">/,
  `{activeNavDropdown === 'products' && (
                  <div 
                    style={{ width: '520px', minWidth: '520px', maxWidth: '90vw' }}
                    className="absolute top-full left-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in-50 slide-in-from-top-2"
                  >`
);

// 4. Fix Industries Dropdown (line 714)
content = content.replace(
  /\{activeNavDropdown === 'industries' && \(\s*<div className="absolute top-full -left-12 w-\[480px\][^"]*">/,
  `{activeNavDropdown === 'industries' && (
                  <div 
                    style={{ width: '520px', minWidth: '520px', maxWidth: '90vw' }}
                    className="absolute top-full -left-12 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in-50 slide-in-from-top-2"
                  >`
);

// 5. Fix Resources Dropdown (line 778)
content = content.replace(
  /\{activeNavDropdown === 'resources' && \(\s*<div className="absolute top-full left-0 w-76 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50[^"]*">/,
  `{activeNavDropdown === 'resources' && (
                  <div 
                    style={{ width: '360px', minWidth: '360px', maxWidth: '90vw' }}
                    className="absolute top-full left-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in-50 slide-in-from-top-2"
                  >`
);

// 6. Fix Services Dropdown (line 886)
content = content.replace(
  /\{activeNavDropdown === 'services' && \(\s*<div className="absolute top-full right-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50[^"]*">/,
  `{activeNavDropdown === 'services' && (
                  <div 
                    style={{ width: '300px', minWidth: '300px', maxWidth: '90vw' }}
                    className="absolute top-full right-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in-50"
                  >`
);

// 7. Fix spacing between Pricing PRO and right switcher tabs
const oldPricingSection = `<Link 
                to="/pricing" 
                className="hover:text-[#111827] transition-colors py-2 flex items-center gap-1 font-bold text-slate-700 mr-3"
              >
                <span>Pricing</span>
                <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-black tracking-wide">
                  PRO
                </span>
              </Link>
            </nav>
          </div>

          {/* Right Product Switcher Tabs & CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">`;

const newPricingSection = `<Link 
                to="/pricing" 
                className="hover:text-[#111827] transition-colors py-2 flex items-center gap-1.5 font-bold text-slate-700 mr-4"
              >
                <span>Pricing</span>
                <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-black tracking-wide shadow-2xs">
                  PRO
                </span>
              </Link>
            </nav>
          </div>

          {/* Right Product Switcher Tabs & CTAs */}
          <div className="flex items-center gap-2 sm:gap-3 pl-3 border-l border-slate-200/80">`;

content = content.replace(oldPricingSection, newPricingSection);

// 8. Fix Searchable Transition Selector Popover inside Transition Navigator Card
content = content.replace(
  /\{isDropdownOpen && \(\s*<div className="absolute top-full right-0 w-full sm:w-\[500px\][^"]*">/,
  `{isDropdownOpen && (
                    <div 
                      style={{ width: '540px', minWidth: '320px', maxWidth: '95vw' }}
                      className="absolute top-full right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in-50 slide-in-from-top-2"
                    >`
);

fs.writeFileSync(targetFilePath, content, 'utf8');
console.log('Successfully updated all dropdowns with explicit inline styles and generous widths!');

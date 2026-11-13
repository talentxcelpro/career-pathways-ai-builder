const fs = require('fs');
const path = require('path');

const jobMatchFile = path.join(__dirname, '..', 'src', 'components', 'products', 'JobMatchProduct.tsx');
let content = fs.readFileSync(jobMatchFile, 'utf8');

// 1. Make selectedCurrency default to 'INR'
content = content.replace(
  "const [selectedCurrency, setSelectedCurrency] = useState<string>('all');",
  "const [selectedCurrency, setSelectedCurrency] = useState<string>('INR');"
);

// 2. In resetAllFilters, reset selectedCurrency to 'INR'
content = content.replace(
  "setSelectedCurrency('all');",
  "setSelectedCurrency('INR');"
);

// 3. Update Currency select dropdown to have INR as first/default option
const currSelectTarget = `<select 
                        value={selectedCurrency}
                        onChange={(e) => {
                          setSelectedCurrency(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#334155] focus:outline-hidden cursor-pointer hover:border-slate-300"
                      >
                        <option value="all">Currency ▾</option>
                        <option value="INR">₹ INR (Indian Rupee)</option>
                        <option value="AED">AED (UAE Dirham)</option>
                        <option value="USD">$ USD (US Dollar)</option>
                        <option value="SAR">SAR (Saudi Riyal)</option>
                        <option value="QAR">QAR (Qatari Riyal)</option>
                        <option value="OMR">OMR (Omani Rial)</option>
                      </select>`;

const currSelectReplacement = `<select 
                        value={selectedCurrency}
                        onChange={(e) => {
                          setSelectedCurrency(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#334155] focus:outline-hidden cursor-pointer hover:border-slate-300"
                      >
                        <option value="INR">₹ INR (Indian Rupee) • Default</option>
                        <option value="all">🌍 All Currencies (Global)</option>
                        <option value="AED">AED (UAE Dirham)</option>
                        <option value="USD">$ USD (US Dollar)</option>
                        <option value="SAR">SAR (Saudi Riyal)</option>
                        <option value="QAR">QAR (Qatari Riyal)</option>
                        <option value="OMR">OMR (Omani Rial)</option>
                        <option value="GBP">£ GBP (British Pound)</option>
                        <option value="SGD">S$ SGD (Singapore Dollar)</option>
                        <option value="AUD">A$ AUD (Australian Dollar)</option>
                        <option value="EUR">€ EUR (Euro)</option>
                        <option value="CAD">C$ CAD (Canadian Dollar)</option>
                      </select>`;

const normContent = content.replace(/\r\n/g, '\n');
const normCurrSelectTarget = currSelectTarget.replace(/\r\n/g, '\n');
if (normContent.includes(normCurrSelectTarget)) {
  const isCRLF = content.includes('\r\n');
  const finalReplacement = isCRLF ? currSelectReplacement.replace(/\n/g, '\r\n') : currSelectReplacement;
  const finalTarget = isCRLF ? currSelectTarget.replace(/\n/g, '\r\n') : normCurrSelectTarget;
  content = content.replace(finalTarget, finalReplacement);
  console.log('✅ Updated Currency select dropdown to make INR default');
} else {
  console.log('⚠️ Could not match exact currSelectTarget, checking substring');
  content = content.replace(
    '<option value="all">Currency ▾</option>\n                        <option value="INR">₹ INR (Indian Rupee)</option>',
    '<option value="INR">₹ INR (Indian Rupee) • Default</option>\n                        <option value="all">🌍 All Currencies (Global)</option>'
  );
}

// 4. Refine mobile search box and theater pills inside search-hero
// Find the block from Global Region Theater Selector Strip to the Primary Search Bar
const searchBarMobileTarget = `                  {/* Global Region Theater Selector Strip */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs">
                    <span className="text-[#64748B] font-bold text-[11px] shrink-0 mr-1 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Global Theater:</span>
                    </span>
                    {GLOBAL_REGIONS.map(reg => {
                      const isActive = selectedRegion === reg.id;
                      return (
                        <button
                          key={reg.id}
                          type="button"
                          onClick={() => {
                            setSelectedRegion(reg.id);
                            setCurrentPage(1);
                          }}
                          className={\`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer \${
                            isActive
                              ? 'bg-[#2563EB] text-white shadow-xs'
                              : 'bg-white text-[#475569] hover:bg-slate-100 border border-[#E2E8F0]'
                          }\`}
                        >
                          <span>{reg.flag}</span>
                          <span>{reg.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Primary Search Bar */}
                  <div className="bg-white border border-[#E2E8F0] rounded-2xl p-2 shadow-xs flex flex-col md:flex-row items-center gap-2">
                    {/* Job Title & Skill Search */}
                    <div className="flex items-center gap-2.5 flex-1 px-3 w-full">
                      <Search className="w-4 h-4 text-slate-400 shrink-0" />
                      <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Job title, skills or company (e.g. Software Engineer, Marketing, TCS)"
                        className="w-full text-xs sm:text-sm text-[#111827] placeholder:text-slate-400 focus:outline-hidden bg-transparent"
                      />
                    </div>

                    <div className="h-6 w-px bg-slate-200 hidden md:block" />

                    {/* Location Dropdown */}
                    <div className="flex items-center gap-2 px-3 w-full md:w-[220px]">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <select 
                        value={selectedCity}
                        onChange={(e) => {
                          setSelectedCity(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full text-xs sm:text-sm text-[#334155] bg-transparent focus:outline-hidden cursor-pointer font-medium"
                      >`;

const searchBarMobileReplacement = `                  {/* Global Region Theater Selector Strip (Clean Horizontal Scroll) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                    <span className="text-[#64748B] font-bold text-[10px] sm:text-[11px] shrink-0 mr-1 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span className="hidden sm:inline">Global Theater:</span>
                    </span>
                    {GLOBAL_REGIONS.map(reg => {
                      const isActive = selectedRegion === reg.id;
                      return (
                        <button
                          key={reg.id}
                          type="button"
                          onClick={() => {
                            setSelectedRegion(reg.id);
                            if (reg.id === 'india') setSelectedCurrency('INR');
                            else if (reg.id === 'middle-east') setSelectedCurrency('AED');
                            else if (reg.id === 'americas') setSelectedCurrency('USD');
                            else if (reg.id === 'europe') setSelectedCurrency('GBP');
                            else if (reg.id === 'all') setSelectedCurrency('INR');
                            setCurrentPage(1);
                          }}
                          className={\`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer \${
                            isActive
                              ? 'bg-[#2563EB] text-white shadow-xs'
                              : 'bg-white text-[#475569] hover:bg-slate-100 border border-[#E2E8F0]'
                          }\`}
                        >
                          <span>{reg.flag}</span>
                          <span>{reg.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Primary Search Bar */}
                  <div className="bg-white border border-[#E2E8F0] rounded-2xl p-2 shadow-xs flex flex-col md:flex-row items-center gap-2">
                    {/* Job Title & Skill Search */}
                    <div className="flex items-center gap-2.5 flex-1 px-3 w-full">
                      <Search className="w-4 h-4 text-slate-400 shrink-0" />
                      <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Job title, skills or company (e.g. Software Engineer, TCS)"
                        className="w-full text-xs sm:text-sm text-[#111827] placeholder:text-slate-400 focus:outline-hidden bg-transparent font-medium"
                      />
                      {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600 p-0.5">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="h-6 w-px bg-slate-200 hidden md:block" />

                    {/* Location Dropdown */}
                    <div className="flex items-center gap-2 px-3 w-full md:w-[220px]">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <select 
                        value={selectedCity}
                        onChange={(e) => {
                          setSelectedCity(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full text-xs sm:text-sm text-[#334155] bg-transparent focus:outline-hidden cursor-pointer font-medium"
                      >`;

const normSearchTarget = searchBarMobileTarget.replace(/\r\n/g, '\n');
const normSearchReplacement = searchBarMobileReplacement.replace(/\r\n/g, '\n');
const normCurrentContent = content.replace(/\r\n/g, '\n');

if (normCurrentContent.includes(normSearchTarget)) {
  const isCRLF = content.includes('\r\n');
  const finalReplacement = isCRLF ? searchBarMobileReplacement.replace(/\n/g, '\r\n') : normSearchReplacement;
  const finalTarget = isCRLF ? searchBarMobileTarget.replace(/\n/g, '\r\n') : normSearchTarget;
  content = content.replace(finalTarget, finalReplacement);
  console.log('✅ Refined search bar and theater strip for mobile');
} else {
  console.error('❌ Could not find searchBarMobileTarget');
}

fs.writeFileSync(jobMatchFile, content, 'utf8');
console.log('✅ JobMatchProduct.tsx patched with INR default and refined mobile styling');

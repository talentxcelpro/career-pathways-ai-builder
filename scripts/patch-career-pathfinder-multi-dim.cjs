// scripts/patch-career-pathfinder-multi-dim.cjs
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/products/CareerPathfinderProduct.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Update imports
const oldImport = `import { 
  CAREER_TRANSITIONS_CATALOG, 
  TransitionPath, 
  getTransitionById,
  generateCustomCareerTransition 
} from '@/data/careerPathwaysCatalog';`;

const newImport = `import { 
  CAREER_TRANSITIONS_CATALOG, 
  TransitionPath, 
  getTransitionById,
  generateCustomCareerTransition,
  CAREER_INDUSTRIES,
  EXPERIENCE_LEVELS,
  LOCATION_TIERS,
  filterCareerTransitionsMultiDimensional
} from '@/data/careerPathwaysCatalog';`;

code = code.replace(oldImport, newImport);

// 2. Update default state
const oldStateBlock = `  const [selectedKey, setSelectedKey] = useState<string>('qa_to_sde');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');`;

const newStateBlock = `  const [selectedKey, setSelectedKey] = useState<string>('hr_manager_to_vp_people');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedExperience, setSelectedExperience] = useState<string>('all');
  const [selectedLocationTier, setSelectedLocationTier] = useState<string>('all');`;

code = code.replace(oldStateBlock, newStateBlock);

// 3. Update activeTransition and calculations
const oldMemoBlock = `  // Active Transition Data (Catalog vs Custom)
  const activeTransition: TransitionPath = useMemo(() => {
    if (navigatorMode === 'custom' && activeCustomTransition) {
      return activeCustomTransition;
    }
    return getTransitionById(selectedKey);
  }, [navigatorMode, activeCustomTransition, selectedKey]);

  const ctcUpsidePercent = Math.round(
    ((activeTransition.targetAvgCtcLakhs - activeTransition.currentAvgCtcLakhs) / activeTransition.currentAvgCtcLakhs) * 100
  );

  // Filtered transitions for the selector
  const filteredTransitions = useMemo(() => {
    return CAREER_TRANSITIONS_CATALOG.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || 
        item.industryCategory === selectedCategory || 
        item.industry.toLowerCase().includes(selectedCategory.toLowerCase());
      
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        item.currentRole.toLowerCase().includes(q) ||
        item.targetRole.toLowerCase().includes(q) ||
        item.industry.toLowerCase().includes(q) ||
        item.industryCategory.toLowerCase().includes(q) ||
        item.coreSkillGaps.some(s => s.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);`;

const newMemoBlock = `  // Resolve active Location configuration
  const activeLocationInfo = useMemo(() => {
    return LOCATION_TIERS.find(l => l.id === selectedLocationTier) || LOCATION_TIERS[0];
  }, [selectedLocationTier]);

  // Active Transition Data (Catalog vs Custom)
  const activeTransition: TransitionPath = useMemo(() => {
    if (navigatorMode === 'custom' && activeCustomTransition) {
      return activeCustomTransition;
    }
    return getTransitionById(selectedKey);
  }, [navigatorMode, activeCustomTransition, selectedKey]);

  // Location-adjusted CTC values
  const adjustedCurrentCtc = Math.round(activeTransition.currentAvgCtcLakhs * activeLocationInfo.multiplier * 10) / 10;
  const adjustedTargetCtc = Math.round(activeTransition.targetAvgCtcLakhs * activeLocationInfo.multiplier * 10) / 10;

  const ctcUpsidePercent = Math.round(
    ((adjustedTargetCtc - adjustedCurrentCtc) / adjustedCurrentCtc) * 100
  );

  // Multi-dimensional filtered transitions across all 152+ pathways
  const filteredTransitions = useMemo(() => {
    return filterCareerTransitionsMultiDimensional({
      query: searchQuery,
      category: selectedCategory,
      experienceLevel: selectedExperience,
      location: selectedLocationTier
    });
  }, [searchQuery, selectedCategory, selectedExperience, selectedLocationTier]);`;

code = code.replace(oldMemoBlock, newMemoBlock);

// 4. Fix Products dropdown sizing
const oldProductsDropdown = `<div className="absolute top-full left-0 w-[440px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in-50 slide-in-from-top-2">`;
const newProductsDropdown = `<div 
                    style={{ width: '520px', minWidth: '520px', maxWidth: '90vw' }}
                    className="absolute top-full left-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in-50 slide-in-from-top-2"
                  >`;

code = code.replace(oldProductsDropdown, newProductsDropdown);

// 5. Update CareerProUnlockModal invocation to pass all dimensions
const oldModalInvoke = `<CareerProUnlockModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        targetRole={activeTransition.targetRole}
        onSuccessUnlock={(tier) => {
          setIsProUnlocked(true);
          setProTierName(tier);
        }}
      />`;

const newModalInvoke = `<CareerProUnlockModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        targetRole={activeTransition.targetRole}
        currentRole={activeTransition.currentRole}
        targetCtc={adjustedTargetCtc}
        experienceLevel={activeTransition.experienceLevel}
        location={activeLocationInfo.label}
        onSuccessUnlock={(tier) => {
          setIsProUnlocked(true);
          setProTierName(tier);
        }}
      />`;

code = code.replace(oldModalInvoke, newModalInvoke);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully applied foundational patches to CareerPathfinderProduct.tsx!');

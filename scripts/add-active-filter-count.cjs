const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'src', 'components', 'products', 'JobMatchProduct.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

const target = `  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCity, selectedCountry, selectedCurrency, selectedEligibility, selectedWorkMode, selectedSalary, selectedExperience, selectedEmploymentType, selectedIndustry, selectedCategory8, selectedSubTab]);`;

const replacement = `  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCity, selectedCountry, selectedCurrency, selectedEligibility, selectedWorkMode, selectedSalary, selectedExperience, selectedEmploymentType, selectedIndustry, selectedCategory8, selectedSubTab]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCountry !== 'all') count++;
    if (selectedCurrency !== 'all') count++;
    if (selectedEligibility !== 'all') count++;
    if (selectedExperience !== 'all') count++;
    if (selectedSalary !== 'all') count++;
    if (selectedWorkMode !== 'all') count++;
    if (selectedEmploymentType !== 'all') count++;
    if (selectedIndustry !== 'all') count++;
    if (selectedCategory8 !== 'all') count++;
    if (selectedCity !== 'all') count++;
    return count;
  }, [selectedCountry, selectedCurrency, selectedEligibility, selectedExperience, selectedSalary, selectedWorkMode, selectedEmploymentType, selectedIndustry, selectedCategory8, selectedCity]);`;

const normContent = content.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');
const normReplacement = replacement.replace(/\r\n/g, '\n');

if (normContent.includes(normTarget)) {
  const isCRLF = content.includes('\r\n');
  const finalReplacement = isCRLF ? replacement.replace(/\n/g, '\r\n') : normReplacement;
  const finalTarget = isCRLF ? target.replace(/\n/g, '\r\n') : normTarget;
  content = content.replace(finalTarget, finalReplacement);
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('✅ Added activeFilterCount');
} else {
  console.error('❌ Could not find target');
}

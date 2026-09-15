import { supabase } from "@/integrations/supabase/client";
import { normalizeJobContent } from '@/lib/job/normalizeJobContent';
import { toJobsTablePayload } from '@/lib/job/toJobsTablePayload';


export interface JobValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  correctedData?: Partial<any>;
}

export class JobDataValidator {
  
  // Salary limits by experience level (INR annually)
  private static readonly SALARY_LIMITS = {
    'internship': { max: 500000, maxFreelance: 200000 },
    'fresher': { max: 1200000, maxFreelance: 800000 },
    'mid-level': { max: 3500000, maxFreelance: 2000000 },
    'senior-level': { max: 8000000, maxFreelance: 5000000 },
    'executive': { max: 15000000, maxFreelance: 10000000 }
  };

  // Role-based skill mappings for validation
  private static readonly ROLE_SKILL_MAPPING = {
    'developer': ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git'],
    'designer': ['Figma', 'Adobe', 'Sketch', 'UI/UX', 'Prototyping'],
    'sales': ['CRM', 'Negotiation', 'Lead Generation', 'Communication'],
    'marketing': ['SEO', 'SEM', 'Analytics', 'Content Marketing', 'Social Media'],
    'hr': ['Talent Acquisition', 'ATS', 'HR Policies', 'Recruitment'],
    'manager': ['Leadership', 'Project Management', 'Team Management', 'Strategy']
  };

  static validateJobData(jobData: any): JobValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    const correctedData: any = {};

    // 1. Required Fields Validation
    const requiredFields = ['title', 'location', 'employment_type', 'experience_level'];
    
    requiredFields.forEach(field => {
      if (!jobData[field] || (typeof jobData[field] === 'string' && jobData[field].trim() === '')) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // 2. Company Information Validation
    if (!jobData.company_name || jobData.company_name.trim() === '') {
      errors.push('Company name is required');
      suggestions.push('Add company name or use "Confidential Employer"');
    }

    // 3. Salary Validation
    const salaryValidation = this.validateSalary(jobData);
    if (salaryValidation.errors.length > 0) {
      errors.push(...salaryValidation.errors);
      if (salaryValidation.correctedSalary) {
        correctedData.salary_min = salaryValidation.correctedSalary.min;
        correctedData.salary_max = salaryValidation.correctedSalary.max;
        suggestions.push(`Suggested salary range: ₹${(salaryValidation.correctedSalary.min/100000).toFixed(1)}L - ₹${(salaryValidation.correctedSalary.max/100000).toFixed(1)}L`);
      }
    }

    // 4. Skills Validation
    const skillsValidation = this.validateSkills(jobData);
    if (skillsValidation.warnings.length > 0) {
      warnings.push(...skillsValidation.warnings);
    }
    if (skillsValidation.suggestedSkills) {
      correctedData.skills_required = skillsValidation.suggestedSkills;
      suggestions.push(`Suggested skills: ${skillsValidation.suggestedSkills.join(', ')}`);
    }

    // 5. Location Validation
    if (jobData.location && !this.isValidLocation(jobData.location)) {
      warnings.push('Location may not be recognized');
      suggestions.push('Use standard city names or "Remote"');
    }

    // 6. Description Quality Check
    if (!jobData.description || jobData.description.length < 100) {
      warnings.push('Job description is too short or missing');
      suggestions.push('Add detailed job description (minimum 100 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      correctedData: Object.keys(correctedData).length > 0 ? correctedData : undefined
    };
  }

  private static validateSalary(jobData: any) {
    const errors: string[] = [];
    let correctedSalary: { min: number; max: number } | undefined;

    const { salary_min, salary_max, employment_type, experience_level } = jobData;

    if (!salary_min && !salary_max) {
      errors.push('Salary information is required');
      return { errors, correctedSalary };
    }

    const limits = this.SALARY_LIMITS[experience_level as keyof typeof this.SALARY_LIMITS] || this.SALARY_LIMITS['mid-level'];
    const maxAllowed = employment_type === 'freelance' ? limits.maxFreelance : limits.max;

    // Check if salary exceeds realistic limits
    if (salary_max && salary_max > maxAllowed) {
      errors.push(`Salary ₹${(salary_max/100000).toFixed(1)}L exceeds realistic limit for ${experience_level} ${employment_type}`);
      
      // Generate corrected salary
      correctedSalary = {
        min: Math.round(maxAllowed * 0.7),
        max: Math.round(maxAllowed * 0.9)
      };
    }

    // Check for obviously wrong salaries (> 5 Cr)
    if (salary_max && salary_max > 50000000) {
      errors.push('Salary exceeds realistic CEO-level compensation');
      correctedSalary = {
        min: Math.round(limits.max * 0.6),
        max: Math.round(limits.max * 0.8)
      };
    }

    // Check min > max
    if (salary_min && salary_max && salary_min > salary_max) {
      errors.push('Minimum salary cannot be higher than maximum salary');
    }

    return { errors, correctedSalary };
  }

  private static validateSkills(jobData: any) {
    const warnings: string[] = [];
    let suggestedSkills: string[] | undefined;

    const { title, skills_required } = jobData;

    if (!skills_required || skills_required.length === 0) {
      warnings.push('No skills specified for the role');
      suggestedSkills = this.suggestSkillsForRole(title);
      return { warnings, suggestedSkills };
    }

    // Check for skill-role mismatch
    const roleType = this.detectRoleType(title);
    if (roleType) {
      const expectedSkills = this.ROLE_SKILL_MAPPING[roleType];
      const hasRelevantSkills = skills_required.some((skill: string) => 
        expectedSkills.some(expectedSkill => 
          skill.toLowerCase().includes(expectedSkill.toLowerCase()) ||
          expectedSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );

      if (!hasRelevantSkills) {
        warnings.push(`Skills don't match the role type (${roleType})`);
        suggestedSkills = expectedSkills.slice(0, 6); // Top 6 relevant skills
      }
    }

    return { warnings, suggestedSkills };
  }

  private static detectRoleType(title: string): keyof typeof JobDataValidator.ROLE_SKILL_MAPPING | null {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('developer') || titleLower.includes('engineer') || titleLower.includes('programmer')) {
      return 'developer';
    }
    if (titleLower.includes('designer') || titleLower.includes('ui') || titleLower.includes('ux')) {
      return 'designer';
    }
    if (titleLower.includes('sales') || titleLower.includes('business development')) {
      return 'sales';
    }
    if (titleLower.includes('marketing') || titleLower.includes('digital marketing')) {
      return 'marketing';
    }
    if (titleLower.includes('hr') || titleLower.includes('recruitment') || titleLower.includes('talent')) {
      return 'hr';
    }
    if (titleLower.includes('manager') || titleLower.includes('lead') || titleLower.includes('director')) {
      return 'manager';
    }
    
    return null;
  }

  private static suggestSkillsForRole(title: string): string[] {
    const roleType = this.detectRoleType(title);
    return roleType ? this.ROLE_SKILL_MAPPING[roleType].slice(0, 5) : [];
  }

  private static isValidLocation(location: string): boolean {
    const validLocations = [
      // Andhra Pradesh
      'adoni', 'amaravati', 'anantapur', 'chandragiri', 'chittoor', 'dowlaiswaram', 'eluru', 'guntur', 'kadapa', 'kakinada', 'kurnool', 'machilipatnam', 'nellore', 'ongole', 'rajahmundry', 'srikakulam', 'tirupati', 'visakhapatnam', 'vijayawada', 'vizianagaram',
      
      // Arunachal Pradesh
      'itanagar', 'naharlagun', 'tawang',
      
      // Assam
      'dibrugarh', 'guwahati', 'jorhat', 'nagaon', 'silchar', 'tezpur', 'tinsukia',
      
      // Bihar
      'ara', 'bhagalpur', 'bihar sharif', 'chapra', 'darbhanga', 'gaya', 'hajipur', 'madhubani', 'munger', 'muzaffarpur', 'patna', 'purnia', 'saharsa', 'samastipur', 'sasaram', 'siwan',
      
      // Chhattisgarh
      'ambikapur', 'bhilai', 'bilaspur', 'dhamtari', 'durg', 'korba', 'raigarh', 'raipur', 'rajnandgaon', 'ratanpur',
      
      // Goa
      'mapusa', 'margao', 'panaji', 'vasco da gama',
      
      // Gujarat
      'ahmedabad', 'anand', 'bharuch', 'bhavnagar', 'bhuj', 'gandhinagar', 'godhra', 'jamnagar', 'junagadh', 'kadi', 'kalol', 'mehsana', 'morbi', 'nadiad', 'navsari', 'porbandar', 'rajkot', 'surat', 'vadodara', 'valsad',
      
      // Haryana
      'ambala', 'bhiwani', 'faridabad', 'gurugram', 'gurgaon', 'hisar', 'karnal', 'kurukshetra', 'mahendragarh', 'narnaul', 'panipat', 'panchkula', 'rewari', 'rohtak', 'sirsa', 'sonipat', 'yamunanagar',
      
      // Himachal Pradesh
      'bilaspur', 'chamba', 'hamirpur', 'kangra', 'kullu', 'mandi', 'nahan', 'solan', 'una', 'shimla',
      
      // Jammu and Kashmir
      'anantnag', 'baramulla', 'jammu', 'kathua', 'kishtwar', 'kulgam', 'kupwara', 'poonch', 'rajouri', 'samba', 'shopian', 'srinagar', 'udhampur',
      
      // Jharkhand
      'bokaro steel city', 'bokaro', 'chaibasa', 'dhanbad', 'deoghar', 'dumka', 'giridih', 'hazaribagh', 'jamshedpur', 'jhumri telaiya', 'khunti', 'lohardaga', 'madhupur', 'pakur', 'ramgarh', 'ranchi', 'sahibganj', 'simdega', 'tata',
      
      // Karnataka
      'bagalkot', 'ballari', 'bengaluru', 'bangalore', 'bidar', 'chamarajanagar', 'chikkamagaluru', 'chitradurga', 'davanagere', 'dharwad', 'gadag', 'hassan', 'hubballi', 'hubli', 'kalaburagi', 'gulbarga', 'kodagu', 'kolar', 'koppal', 'mandya', 'mysuru', 'mysore', 'raichur', 'ramanagara', 'shivamogga', 'shimoga', 'tumakuru', 'tumkur', 'udupi', 'yadgir', 'mangalore', 'belgaum',
      
      // Kerala
      'alappuzha', 'alleppey', 'ernakulam', 'kochi', 'idukki', 'kannur', 'kasaragod', 'kottayam', 'kozhikode', 'calicut', 'malappuram', 'palakkad', 'palghat', 'pathanamthitta', 'thiruvananthapuram', 'trivandrum', 'thrissur', 'trichur', 'wayanad', 'kollam', 'quilon',
      
      // Madhya Pradesh
      'agar malwa', 'alirajpur', 'anuppur', 'ashok nagar', 'balaghat', 'barwani', 'betul', 'bhind', 'bhopal', 'burhanpur', 'chhatarpur', 'chhindwara', 'damoh', 'datia', 'dewas', 'dhar', 'dindori', 'guna', 'gwalior', 'hoshangabad', 'indore', 'jabalpur', 'jhabua', 'katni', 'khandwa', 'khargone', 'mandla', 'mandsaur', 'morena', 'narsinghpur', 'neemuch', 'panna', 'raisen', 'rajgarh', 'ratlam', 'rewa', 'sagar', 'satna', 'sehore', 'seoni', 'shahdol', 'shajapur', 'sheopur', 'shivpuri', 'sidhi', 'singrauli', 'tikamgarh', 'ujjain', 'umaria', 'vidisha',
      
      // Maharashtra
      'ahmednagar', 'akola', 'amravati', 'aurangabad', 'bhiwandi', 'chandrapur', 'dhule', 'gondia', 'jalgaon', 'jalna', 'kolhapur', 'latur', 'mumbai', 'nagpur', 'nashik', 'nanded', 'nandurbar', 'navi mumbai', 'osmanabad', 'parbhani', 'pimpri-chinchwad', 'pune', 'raigad', 'ratnagiri', 'sangli', 'satara', 'solapur', 'thane', 'ulhasnagar', 'wardha', 'washim', 'yavatmal',
      
      // Manipur
      'imphal',
      
      // Meghalaya
      'shillong',
      
      // Mizoram
      'aizawl',
      
      // Nagaland
      'kohima',
      
      // Odisha
      'berhampur', 'bhubaneswar', 'cuttack', 'dhenkanal', 'jeypore', 'rourkela', 'sambalpur', 'balasore', 'bhadrak', 'baripada', 'jharsuguda',
      
      // Punjab
      'amritsar', 'bhatinda', 'bathinda', 'fatehgarh sahib', 'firozpur', 'hoshiarpur', 'jalandhar', 'kapurthala', 'ludhiana', 'mansa', 'moga', 'mohali', 'pathankot', 'patiala', 'rupnagar', 'sangrur', 'sri muktsar sahib', 'muktsar', 'tarn taran', 'phagwara', 'batala', 'abohar', 'malerkotla', 'khanna',
      
      // Rajasthan
      'ajmer', 'alwar', 'baran', 'barmer', 'bharatpur', 'bhilwara', 'bikaner', 'bundi', 'chittorgarh', 'churu', 'dausa', 'dholpur', 'hanumangarh', 'jaipur', 'jaisalmer', 'jalore', 'jhalawar', 'jhunjhunu', 'jodhpur', 'karauli', 'kota', 'nagaur', 'pali', 'rajsamand', 'sawai madhopur', 'sikar', 'sirohi', 'sri ganganagar', 'tonk', 'udaipur',
      
      // Sikkim
      'gangtok',
      
      // Tamil Nadu
      'chennai', 'madras', 'coimbatore', 'dindigul', 'erode', 'madurai', 'salem', 'thanjavur', 'tanjore', 'thoothukudi', 'tuticorin', 'tiruchirappalli', 'trichy', 'tirunelveli', 'tiruppur', 'vellore', 'kanchipuram', 'cuddalore', 'karur',
      
      // Telangana
      'hyderabad', 'karimnagar', 'khammam', 'mahabubnagar', 'mahbubnagar', 'nalgonda', 'nizamabad', 'warangal',
      
      // Tripura
      'agartala',
      
      // Uttar Pradesh
      'agra', 'aligarh', 'allahabad', 'prayagraj', 'ambedkar nagar', 'amroha', 'auraiya', 'azamgarh', 'badaun', 'bagpat', 'bahraich', 'ballia', 'banda', 'barabanki', 'bareilly', 'basti', 'bhadohi', 'bijnor', 'budaun', 'bulandshahar', 'chandausi', 'chitrakoot', 'deoria', 'etah', 'etawah', 'farrukhabad', 'fatehpur', 'firozabad', 'gautam buddh nagar', 'noida', 'ghaziabad', 'gonda', 'gorakhpur', 'hamirpur', 'hapur', 'hardoi', 'hathras', 'jalaun', 'jaunpur', 'jhansi', 'kannauj', 'kanpur', 'kasganj', 'kaushambi', 'kushinagar', 'lakhimpur kheri', 'lalitpur', 'lucknow', 'maharajganj', 'mahoba', 'mainpuri', 'mathura', 'mau', 'meerut', 'mirzapur', 'moradabad', 'muzaffarnagar', 'pilibhit', 'raebareli', 'rampur', 'saharanpur', 'sambhal', 'sant kabir nagar', 'shahjahanpur', 'shamli', 'shravasti', 'siddharthnagar', 'sitapur', 'sonbhadra', 'sultanpur', 'unnao', 'varanasi',
      
      // Uttarakhand
      'almora', 'dehradun', 'haridwar', 'haldwani', 'kashipur', 'nainital', 'rishikesh', 'roorkee', 'rudrapur', 'udhamsingh nagar', 'pithoragarh', 'mussoorie',
      
      // West Bengal
      'asansol', 'baharampur', 'bally', 'bardhaman', 'burdwan', 'baruipur', 'berhampore', 'bidhannagar', 'salt lake', 'bishnupur', 'chandannagar', 'chinsurah', 'durgapur', 'haldia', 'howrah', 'jalpaiguri', 'kolkata', 'calcutta', 'krishnanagar', 'malda', 'medinipur', 'murarai', 'nabadwip', 'naihati', 'purulia', 'raiganj', 'siliguri', 'srirampur', 'tamluk', 'uluberia', 'uttarpara', 'kharagpur',
      
      // Union Territories
      'port blair', 'chandigarh', 'daman', 'diu', 'kavaratti', 'delhi', 'new delhi', 'puducherry', 'pondicherry',
      
      // Additional Maharashtra cities
      'akot', 'baramati', 'dahanu', 'ichalkaranji', 'jalgaon jamod', 'kalyan', 'lonavala', 'malegaon', 'nandgaon', 'pandharpur', 'parli', 'sangamner', 'shirdi', 'udgir', 'yeotmal',
      
      // Additional Tamil Nadu cities
      'karaikudi', 'kumbakonam', 'nagercoil', 'namakkal', 'pollachi', 'ramanathapuram', 'sivakasi', 'theni', 'thiruvarur', 'tirupattur', 'vaniyambadi', 'viluppuram',
      
      // Additional Karnataka cities
      'chikballapur', 'hospet', 'gudibanda', 'manipal', 'ranebennur', 'puttur', 'kundapura',
      
      // Additional Rajasthan cities
      'banswara', 'baran', 'bundi', 'dungarpur', 'jhalawar', 'sirohi', 'tonk', 'chittorgarh', 'rajsamand',
      
      // Additional Gujarat cities
      'vyara', 'mandvi', 'narmada', 'deesa', 'patan', 'wankaner',
      
      // Additional Uttar Pradesh cities
      'amethi', 'bijnor', 'etah', 'firozabad', 'hathras', 'kasganj', 'mau', 'rampur', 'shahjahanpur',
      
      // Common location formats
      'remote', 'work from home', 'wfh', 'hybrid', 'remote - india', 'remote - global', 'flexible location', 'multi-city', 'travel required',
      
      // Major cities with state names (common format)
      'mumbai, maharashtra', 'delhi, delhi', 'bangalore, karnataka', 'bengaluru, karnataka', 'chennai, tamil nadu', 'kolkata, west bengal', 'pune, maharashtra', 'hyderabad, telangana', 'ahmedabad, gujarat', 'surat, gujarat', 'jaipur, rajasthan', 'lucknow, uttar pradesh', 'kanpur, uttar pradesh', 'nagpur, maharashtra', 'indore, madhya pradesh', 'kochi, kerala', 'thiruvananthapuram, kerala', 'bhubaneswar, odisha', 'chandigarh, punjab', 'coimbatore, tamil nadu', 'mysore, karnataka', 'mangalore, karnataka', 'vizag, andhra pradesh', 'patna, bihar', 'bhopal, madhya pradesh', 'aurangabad, maharashtra', 'rajkot, gujarat', 'madurai, tamil nadu', 'agra, uttar pradesh', 'varanasi, uttar pradesh', 'meerut, uttar pradesh', 'faridabad, haryana', 'ghaziabad, uttar pradesh', 'ludhiana, punjab', 'amritsar, punjab', 'jalandhar, punjab', 'dehradun, uttarakhand', 'udaipur, rajasthan', 'pathankot, punjab', 'munger, bihar', 'malappuram, kerala', 'shimla, himachal pradesh', 'panipat, haryana', 'ambala, haryana', 'yamunanagar, haryana', 'rohtak, haryana', 'hisar, haryana', 'karnal, haryana', 'sonipat, haryana', 'sirsa, haryana', 'kurukshetra, haryana', 'bhiwani, haryana', 'rewari, haryana', 'mahendragarh, haryana', 'narnaul, haryana', 'panchkula, haryana', 'jodhpur, rajasthan', 'kota, rajasthan', 'bikaner, rajasthan', 'ajmer, rajasthan', 'bhilwara, rajasthan', 'alwar, rajasthan', 'bharatpur, rajasthan', 'sikar, rajasthan', 'pali, rajasthan', 'hanumangarh, rajasthan', 'churu, rajasthan', 'jhunjhunu, rajasthan', 'nagaur, rajasthan', 'tonk, rajasthan', 'bundi, rajasthan', 'chittorgarh, rajasthan', 'banswara, rajasthan', 'dungarpur, rajasthan', 'jhalawar, rajasthan', 'rajsamand, rajasthan', 'sirohi, rajasthan', 'jalore, rajasthan', 'barmer, rajasthan', 'jaisalmer, rajasthan', 'sri ganganagar, rajasthan', 'dausa, rajasthan', 'dholpur, rajasthan', 'karauli, rajasthan', 'sawai madhopur, rajasthan', 
      
      // West Bengal cities with state
      'howrah, west bengal', 'asansol, west bengal', 'durgapur, west bengal', 'siliguri, west bengal', 'bardhaman, west bengal', 'burdwan, west bengal', 'malda, west bengal', 'jalpaiguri, west bengal', 'kharagpur, west bengal', 'baharampur, west bengal', 'bally, west bengal', 'baruipur, west bengal', 'berhampore, west bengal', 'bidhannagar, west bengal', 'salt lake, west bengal', 'bishnupur, west bengal', 'chandannagar, west bengal', 'chinsurah, west bengal', 'haldia, west bengal', 'krishnanagar, west bengal', 'medinipur, west bengal', 'murarai, west bengal', 'nabadwip, west bengal', 'naihati, west bengal', 'purulia, west bengal', 'raiganj, west bengal', 'srirampur, west bengal', 'tamluk, west bengal', 'uluberia, west bengal', 'uttarpara, west bengal',
      
      // Tamil Nadu cities with state
      'erode, tamil nadu', 'salem, tamil nadu', 'tirupur, tamil nadu', 'vellore, tamil nadu', 'tirunelveli, tamil nadu', 'thanjavur, tamil nadu', 'tanjore, tamil nadu', 'dindigul, tamil nadu', 'cuddalore, tamil nadu', 'karur, tamil nadu', 'kanchipuram, tamil nadu', 'karaikudi, tamil nadu', 'kumbakonam, tamil nadu', 'nagercoil, tamil nadu', 'namakkal, tamil nadu', 'pollachi, tamil nadu', 'ramanathapuram, tamil nadu', 'sivakasi, tamil nadu', 'theni, tamil nadu', 'thiruvarur, tamil nadu', 'tirupattur, tamil nadu', 'vaniyambadi, tamil nadu', 'viluppuram, tamil nadu', 'thoothukudi, tamil nadu', 'tuticorin, tamil nadu', 'tiruchirappalli, tamil nadu', 'trichy, tamil nadu',
      
      // Arunachal Pradesh cities with state
      'itanagar, arunachal pradesh', 'naharlagun, arunachal pradesh', 'tawang, arunachal pradesh',
      
      // Assam cities with state
      'dibrugarh, assam', 'guwahati, assam', 'jorhat, assam', 'nagaon, assam', 'silchar, assam', 'tezpur, assam', 'tinsukia, assam', 'dispur, assam',
      
      // Bihar cities with state
      'ara, bihar', 'arrah, bihar', 'bhagalpur, bihar', 'bihar sharif, bihar', 'chapra, bihar', 'chhapra, bihar', 'darbhanga, bihar', 'gaya, bihar', 'hajipur, bihar', 'madhubani, bihar', 'muzaffarpur, bihar', 'purnia, bihar', 'saharsa, bihar', 'samastipur, bihar', 'sasaram, bihar', 'siwan, bihar', 'begusarai, bihar', 'katihar, bihar',
      
      // Chhattisgarh cities with state
      'ambikapur, chhattisgarh', 'bhilai, chhattisgarh', 'bilaspur, chhattisgarh', 'dhamtari, chhattisgarh', 'durg, chhattisgarh', 'korba, chhattisgarh', 'raigarh, chhattisgarh', 'raipur, chhattisgarh', 'rajnandgaon, chhattisgarh', 'ratanpur, chhattisgarh', 'jagdalpur, chhattisgarh', 'mahasamund, chhattisgarh',
      
      // Goa cities with state
      'mapusa, goa', 'margao, goa', 'panaji, goa', 'vasco da gama, goa',
      
      // Gujarat cities with state
      'gandhinagar, gujarat', 'anand, gujarat', 'bharuch, gujarat', 'bhavnagar, gujarat', 'bhuj, gujarat', 'godhra, gujarat', 'jamnagar, gujarat', 'junagadh, gujarat', 'kadi, gujarat', 'kalol, gujarat', 'mehsana, gujarat', 'morbi, gujarat', 'nadiad, gujarat', 'navsari, gujarat', 'porbandar, gujarat', 'vadodara, gujarat', 'valsad, gujarat', 'vyara, gujarat', 'mandvi, gujarat', 'narmada, gujarat', 'deesa, gujarat', 'patan, gujarat', 'wankaner, gujarat',
      
      // Himachal Pradesh cities with state
      'bilaspur, himachal pradesh', 'chamba, himachal pradesh', 'hamirpur, himachal pradesh', 'kangra, himachal pradesh', 'kullu, himachal pradesh', 'mandi, himachal pradesh', 'nahan, himachal pradesh', 'solan, himachal pradesh', 'una, himachal pradesh',
      
      // Jammu and Kashmir cities with state
      'anantnag, jammu and kashmir', 'baramulla, jammu and kashmir', 'jammu, jammu and kashmir', 'kathua, jammu and kashmir', 'kishtwar, jammu and kashmir', 'kulgam, jammu and kashmir', 'kupwara, jammu and kashmir', 'poonch, jammu and kashmir', 'rajouri, jammu and kashmir', 'samba, jammu and kashmir', 'shopian, jammu and kashmir', 'srinagar, jammu and kashmir', 'udhampur, jammu and kashmir',
      
      // Jharkhand cities with state
      'bokaro steel city, jharkhand', 'bokaro, jharkhand', 'chaibasa, jharkhand', 'dhanbad, jharkhand', 'deoghar, jharkhand', 'dumka, jharkhand', 'giridih, jharkhand', 'hazaribagh, jharkhand', 'jamshedpur, jharkhand', 'jhumri telaiya, jharkhand', 'khunti, jharkhand', 'lohardaga, jharkhand', 'madhupur, jharkhand', 'pakur, jharkhand', 'ramgarh, jharkhand', 'ranchi, jharkhand', 'sahibganj, jharkhand', 'simdega, jharkhand', 'tata, jharkhand', 'medininagar, jharkhand', 'phusro, jharkhand',
      
      // Karnataka cities with state
      'bagalkot, karnataka', 'ballari, karnataka', 'bidar, karnataka', 'chamarajanagar, karnataka', 'chikkamagaluru, karnataka', 'chitradurga, karnataka', 'davanagere, karnataka', 'dharwad, karnataka', 'gadag, karnataka', 'hassan, karnataka', 'hubballi, karnataka', 'hubli, karnataka', 'kalaburagi, karnataka', 'gulbarga, karnataka', 'kodagu, karnataka', 'kolar, karnataka', 'koppal, karnataka', 'mandya, karnataka', 'mysuru, karnataka', 'raichur, karnataka', 'ramanagara, karnataka', 'shivamogga, karnataka', 'shimoga, karnataka', 'tumakuru, karnataka', 'tumkur, karnataka', 'udupi, karnataka', 'yadgir, karnataka', 'belgaum, karnataka', 'bellary, karnataka', 'bijapur, karnataka', 'davangere, karnataka', 'chikballapur, karnataka', 'hospet, karnataka', 'gudibanda, karnataka', 'manipal, karnataka', 'ranebennur, karnataka', 'puttur, karnataka', 'kundapura, karnataka',
      
      // Kerala cities with state
      'alappuzha, kerala', 'alleppey, kerala', 'ernakulam, kerala', 'idukki, kerala', 'kannur, kerala', 'kasaragod, kerala', 'kottayam, kerala', 'kozhikode, kerala', 'calicut, kerala', 'pathanamthitta, kerala', 'thrissur, kerala', 'trichur, kerala', 'wayanad, kerala', 'kollam, kerala', 'quilon, kerala', 'palakkad, kerala', 'palghat, kerala',
      
      // Madhya Pradesh cities with state
      'agar malwa, madhya pradesh', 'alirajpur, madhya pradesh', 'anuppur, madhya pradesh', 'ashok nagar, madhya pradesh', 'balaghat, madhya pradesh', 'barwani, madhya pradesh', 'betul, madhya pradesh', 'bhind, madhya pradesh', 'burhanpur, madhya pradesh', 'chhatarpur, madhya pradesh', 'chhindwara, madhya pradesh', 'damoh, madhya pradesh', 'datia, madhya pradesh', 'dewas, madhya pradesh', 'dhar, madhya pradesh', 'dindori, madhya pradesh', 'guna, madhya pradesh', 'gwalior, madhya pradesh', 'hoshangabad, madhya pradesh', 'jabalpur, madhya pradesh', 'jhabua, madhya pradesh', 'katni, madhya pradesh', 'khandwa, madhya pradesh', 'khargone, madhya pradesh', 'mandla, madhya pradesh', 'mandsaur, madhya pradesh', 'morena, madhya pradesh', 'narsinghpur, madhya pradesh', 'neemuch, madhya pradesh', 'panna, madhya pradesh', 'raisen, madhya pradesh', 'rajgarh, madhya pradesh', 'ratlam, madhya pradesh', 'rewa, madhya pradesh', 'sagar, madhya pradesh', 'satna, madhya pradesh', 'sehore, madhya pradesh', 'seoni, madhya pradesh', 'shahdol, madhya pradesh', 'shajapur, madhya pradesh', 'sheopur, madhya pradesh', 'shivpuri, madhya pradesh', 'sidhi, madhya pradesh', 'singrauli, madhya pradesh', 'tikamgarh, madhya pradesh', 'ujjain, madhya pradesh', 'umaria, madhya pradesh', 'vidisha, madhya pradesh',
      
      // Maharashtra cities with state
      'ahmednagar, maharashtra', 'akola, maharashtra', 'amravati, maharashtra', 'bhiwandi, maharashtra', 'chandrapur, maharashtra', 'dhule, maharashtra', 'gondia, maharashtra', 'jalgaon, maharashtra', 'jalna, maharashtra', 'kolhapur, maharashtra', 'latur, maharashtra', 'nanded, maharashtra', 'nandurbar, maharashtra', 'navi mumbai, maharashtra', 'osmanabad, maharashtra', 'parbhani, maharashtra', 'pimpri-chinchwad, maharashtra', 'raigad, maharashtra', 'ratnagiri, maharashtra', 'sangli, maharashtra', 'satara, maharashtra', 'solapur, maharashtra', 'thane, maharashtra', 'ulhasnagar, maharashtra', 'wardha, maharashtra', 'washim, maharashtra', 'yavatmal, maharashtra', 'akot, maharashtra', 'baramati, maharashtra', 'dahanu, maharashtra', 'ichalkaranji, maharashtra', 'jalgaon jamod, maharashtra', 'kalyan, maharashtra', 'lonavala, maharashtra', 'malegaon, maharashtra', 'nandgaon, maharashtra', 'pandharpur, maharashtra', 'parli, maharashtra', 'sangamner, maharashtra', 'shirdi, maharashtra', 'udgir, maharashtra', 'yeotmal, maharashtra',
      
      // All other states continue with their city-state combinations...
      'manipur, manipur', 'imphal, manipur', 'meghalaya, meghalaya', 'shillong, meghalaya', 'mizoram, mizoram', 'aizawl, mizoram', 'nagaland, nagaland', 'kohima, nagaland',
      
      // Odisha cities with state
      'berhampur, odisha', 'cuttack, odisha', 'dhenkanal, odisha', 'jeypore, odisha', 'rourkela, odisha', 'sambalpur, odisha', 'balasore, odisha', 'bhadrak, odisha', 'baripada, odisha', 'jharsuguda, odisha', 'brahmapur, odisha', 'puri, odisha',
      
      // Punjab cities with state  
      'amritsar, punjab', 'bhatinda, punjab', 'bathinda, punjab', 'fatehgarh sahib, punjab', 'firozpur, punjab', 'hoshiarpur, punjab', 'kapurthala, punjab', 'ludhiana, punjab', 'mansa, punjab', 'moga, punjab', 'mohali, punjab', 'patiala, punjab', 'rupnagar, punjab', 'sangrur, punjab', 'sri muktsar sahib, punjab', 'muktsar, punjab', 'tarn taran, punjab', 'phagwara, punjab', 'batala, punjab', 'abohar, punjab', 'malerkotla, punjab', 'khanna, punjab',
      
      // Telangana cities with state
      'karimnagar, telangana', 'khammam, telangana', 'mahabubnagar, telangana', 'mahbubnagar, telangana', 'nalgonda, telangana', 'nizamabad, telangana', 'warangal, telangana',
      
      // Tripura, Sikkim with state
      'agartala, tripura', 'gangtok, sikkim',
      
      // Uttar Pradesh cities with state (add all missing ones)
      'aligarh, uttar pradesh', 'allahabad, uttar pradesh', 'prayagraj, uttar pradesh', 'ambedkar nagar, uttar pradesh', 'amroha, uttar pradesh', 'auraiya, uttar pradesh', 'azamgarh, uttar pradesh', 'badaun, uttar pradesh', 'bagpat, uttar pradesh', 'bahraich, uttar pradesh', 'ballia, uttar pradesh', 'banda, uttar pradesh', 'barabanki, uttar pradesh', 'bareilly, uttar pradesh', 'basti, uttar pradesh', 'bhadohi, uttar pradesh', 'bijnor, uttar pradesh', 'budaun, uttar pradesh', 'bulandshahar, uttar pradesh', 'chandausi, uttar pradesh', 'chitrakoot, uttar pradesh', 'deoria, uttar pradesh', 'etah, uttar pradesh', 'etawah, uttar pradesh', 'farrukhabad, uttar pradesh', 'fatehpur, uttar pradesh', 'firozabad, uttar pradesh', 'gautam buddh nagar, uttar pradesh', 'noida, uttar pradesh', 'gonda, uttar pradesh', 'gorakhpur, uttar pradesh', 'hamirpur, uttar pradesh', 'hapur, uttar pradesh', 'hardoi, uttar pradesh', 'hathras, uttar pradesh', 'jalaun, uttar pradesh', 'jaunpur, uttar pradesh', 'jhansi, uttar pradesh', 'kannauj, uttar pradesh', 'kanpur, uttar pradesh', 'kasganj, uttar pradesh', 'kaushambi, uttar pradesh', 'kushinagar, uttar pradesh', 'lakhimpur kheri, uttar pradesh', 'lalitpur, uttar pradesh', 'maharajganj, uttar pradesh', 'mahoba, uttar pradesh', 'mainpuri, uttar pradesh', 'mathura, uttar pradesh', 'mau, uttar pradesh', 'mirzapur, uttar pradesh', 'moradabad, uttar pradesh', 'muzaffarnagar, uttar pradesh', 'pilibhit, uttar pradesh', 'raebareli, uttar pradesh', 'rampur, uttar pradesh', 'saharanpur, uttar pradesh', 'sambhal, uttar pradesh', 'sant kabir nagar, uttar pradesh', 'shamli, uttar pradesh', 'shravasti, uttar pradesh', 'siddharthnagar, uttar pradesh', 'sitapur, uttar pradesh', 'sonbhadra, uttar pradesh', 'sultanpur, uttar pradesh', 'unnao, uttar pradesh', 'amethi, uttar pradesh',
      
      // Uttarakhand cities with state
      'almora, uttarakhand', 'haridwar, uttarakhand', 'haldwani, uttarakhand', 'kashipur, uttarakhand', 'nainital, uttarakhand', 'rishikesh, uttarakhand', 'roorkee, uttarakhand', 'rudrapur, uttarakhand', 'udhamsingh nagar, uttarakhand', 'pithoragarh, uttarakhand', 'mussoorie, uttarakhand',
      
      // Union Territories with proper names
      'port blair, andaman and nicobar islands', 'chandigarh, chandigarh', 'daman, dadra and nagar haveli and daman and diu', 'diu, dadra and nagar haveli and daman and diu', 'kavaratti, lakshadweep', 'delhi, delhi', 'new delhi, delhi', 'puducherry, puducherry', 'pondicherry, puducherry'
    ];
    
    return validLocations.some(valid => 
      location.toLowerCase().includes(valid) || valid.includes(location.toLowerCase())
    );
  }

  // Auto-fix function that applies corrections and Gate 2D canonical normalization
  static autoFixJobData(jobData: any): any {
    // ── Gate 2D: Run canonical normalization ──────────
    const normResult = normalizeJobContent(jobData);
    const canonicalPayload = toJobsTablePayload(normResult.normalized);

    const validation = this.validateJobData({
      ...jobData,
      ...canonicalPayload,
    });
    
    const base = {
      ...jobData,
      ...canonicalPayload,
      ...(validation.correctedData || {}),
    };

    if (!validation.correctedData && normResult.status === 'OK') {
      return base;
    }

    return {
      ...base,
      // Add metadata about the fixes
      _auto_fixed: true,
      _fixes_applied: Object.keys(validation.correctedData || {}),
      _validation_warnings: validation.warnings,
      _validation_suggestions: validation.suggestions
    };
  }

  // Batch validation for multiple jobs
  static async validateJobsBatch(jobs: any[]): Promise<{
    validJobs: any[];
    invalidJobs: any[];
    fixedJobs: any[];
    summary: {
      total: number;
      valid: number;
      invalid: number;
      fixed: number;
    };
  }> {
    const validJobs: any[] = [];
    const invalidJobs: any[] = [];
    const fixedJobs: any[] = [];

    for (const job of jobs) {
      const validation = this.validateJobData(job);
      
      if (validation.isValid) {
        validJobs.push(job);
      } else if (validation.correctedData) {
        const fixedJob = this.autoFixJobData(job);
        fixedJobs.push(fixedJob);
      } else {
        invalidJobs.push({ ...job, _validation_errors: validation.errors });
      }
    }

    return {
      validJobs,
      invalidJobs,
      fixedJobs,
      summary: {
        total: jobs.length,
        valid: validJobs.length,
        invalid: invalidJobs.length,
        fixed: fixedJobs.length
      }
    };
  }
}

// Helper function for real-time validation during form input
export const validateJobField = (fieldName: string, value: any, jobData: any) => {
  const tempJobData = { ...jobData, [fieldName]: value };
  const validation = JobDataValidator.validateJobData(tempJobData);
  
  const fieldErrors = validation.errors.filter(error => 
    error.toLowerCase().includes(fieldName.toLowerCase())
  );
  const fieldWarnings = validation.warnings.filter(warning => 
    warning.toLowerCase().includes(fieldName.toLowerCase())
  );

  return {
    isValid: fieldErrors.length === 0,
    errors: fieldErrors,
    warnings: fieldWarnings,
    suggestions: validation.suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(fieldName.toLowerCase())
    )
  };
};
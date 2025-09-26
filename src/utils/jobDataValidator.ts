import { supabase } from "@/integrations/supabase/client";

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
      'mumbai, maharashtra', 'delhi, delhi', 'bangalore, karnataka', 'bengaluru, karnataka', 'chennai, tamil nadu', 'kolkata, west bengal', 'pune, maharashtra', 'hyderabad, telangana', 'ahmedabad, gujarat', 'surat, gujarat', 'jaipur, rajasthan', 'lucknow, uttar pradesh', 'kanpur, uttar pradesh', 'nagpur, maharashtra', 'indore, madhya pradesh', 'kochi, kerala', 'thiruvananthapuram, kerala', 'bhubaneswar, odisha', 'chandigarh, punjab', 'coimbatore, tamil nadu', 'mysore, karnataka', 'mangalore, karnataka', 'vizag, andhra pradesh', 'patna, bihar', 'bhopal, madhya pradesh', 'aurangabad, maharashtra', 'rajkot, gujarat', 'madurai, tamil nadu', 'agra, uttar pradesh', 'varanasi, uttar pradesh', 'meerut, uttar pradesh', 'faridabad, haryana', 'ghaziabad, uttar pradesh', 'ludhiana, punjab', 'amritsar, punjab', 'jalandhar, punjab', 'dehradun, uttarakhand', 'udaipur, rajasthan', 'pathankot, punjab', 'munger, bihar', 'malappuram, kerala'
    ];
    
    return validLocations.some(valid => 
      location.toLowerCase().includes(valid) || valid.includes(location.toLowerCase())
    );
  }

  // Auto-fix function that applies corrections
  static autoFixJobData(jobData: any): any {
    const validation = this.validateJobData(jobData);
    
    if (!validation.correctedData) {
      return jobData;
    }

    return {
      ...jobData,
      ...validation.correctedData,
      // Add metadata about the fixes
      _auto_fixed: true,
      _fixes_applied: Object.keys(validation.correctedData),
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
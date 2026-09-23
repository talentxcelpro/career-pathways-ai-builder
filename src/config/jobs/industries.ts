/**
 * TalentXcel 3-Level Industry Taxonomy
 * Level 1: 50+ Industry Families
 * Level 2: Standardized Occupations per family
 * Level 3: Normalized Skills per occupation
 */

export interface IndustrySkill { id: string; name: string; }
export interface IndustryOccupation {
  id: string; title: string; schemaOccupation?: string;
  fresherEligible: boolean; skills: IndustrySkill[];
}
export interface IndustryFamily {
  id: string; name: string; icon: string; description: string;
  fresherEligible: boolean; occupations: IndustryOccupation[];
}

export const INDUSTRY_FAMILIES: readonly IndustryFamily[] = [
  { id: 'technology', name: 'Technology & IT', icon: '💻', fresherEligible: true, description: 'Software, IT, cloud, cybersecurity, AI/ML, data engineering', occupations: [
    { id: 'software-engineer', title: 'Software Engineer', fresherEligible: true, schemaOccupation: '15-1252.00', skills: [{ id: 'js', name: 'JavaScript' }, { id: 'py', name: 'Python' }, { id: 'java', name: 'Java' }, { id: 'react', name: 'React' }, { id: 'node', name: 'Node.js' }] },
    { id: 'frontend-developer', title: 'Frontend Developer', fresherEligible: true, skills: [{ id: 'html', name: 'HTML/CSS' }, { id: 'react', name: 'React' }, { id: 'ts', name: 'TypeScript' }] },
    { id: 'backend-developer', title: 'Backend Developer', fresherEligible: true, skills: [{ id: 'api', name: 'REST APIs' }, { id: 'py', name: 'Python' }, { id: 'java', name: 'Java' }] },
    { id: 'fullstack-developer', title: 'Full Stack Developer', fresherEligible: true, skills: [{ id: 'react', name: 'React' }, { id: 'node', name: 'Node.js' }, { id: 'sql', name: 'SQL' }] },
    { id: 'mobile-developer', title: 'Mobile Developer', fresherEligible: true, skills: [{ id: 'flutter', name: 'Flutter' }, { id: 'rn', name: 'React Native' }, { id: 'android', name: 'Android' }] },
    { id: 'data-analyst', title: 'Data Analyst', fresherEligible: true, skills: [{ id: 'excel', name: 'Excel' }, { id: 'sql', name: 'SQL' }, { id: 'tableau', name: 'Tableau' }, { id: 'power-bi', name: 'Power BI' }] },
    { id: 'data-scientist', title: 'Data Scientist', fresherEligible: true, skills: [{ id: 'ml', name: 'Machine Learning' }, { id: 'py', name: 'Python' }, { id: 'stats', name: 'Statistics' }] },
    { id: 'ml-engineer', title: 'ML/AI Engineer', fresherEligible: false, skills: [{ id: 'deep-learning', name: 'Deep Learning' }, { id: 'pytorch', name: 'PyTorch' }, { id: 'nlp', name: 'NLP' }] },
    { id: 'devops-engineer', title: 'DevOps Engineer', fresherEligible: false, skills: [{ id: 'docker', name: 'Docker' }, { id: 'k8s', name: 'Kubernetes' }, { id: 'ci-cd', name: 'CI/CD' }, { id: 'aws', name: 'AWS' }] },
    { id: 'cloud-engineer', title: 'Cloud Engineer', fresherEligible: false, skills: [{ id: 'aws', name: 'AWS' }, { id: 'azure', name: 'Azure' }, { id: 'gcp', name: 'GCP' }, { id: 'terraform', name: 'Terraform' }] },
    { id: 'cybersecurity-analyst', title: 'Cybersecurity Analyst', fresherEligible: true, skills: [{ id: 'soc', name: 'SOC Operations' }, { id: 'pentest', name: 'Penetration Testing' }] },
    { id: 'qa-engineer', title: 'QA/Test Engineer', fresherEligible: true, skills: [{ id: 'selenium', name: 'Selenium' }, { id: 'manual-testing', name: 'Manual Testing' }] },
    { id: 'it-support', title: 'IT Support / Helpdesk', fresherEligible: true, skills: [{ id: 'windows', name: 'Windows Admin' }, { id: 'networking', name: 'Networking' }] },
    { id: 'system-admin', title: 'System Administrator', fresherEligible: false, skills: [{ id: 'linux', name: 'Linux' }, { id: 'windows-server', name: 'Windows Server' }] },
    { id: 'ui-ux-designer', title: 'UI/UX Designer', fresherEligible: true, skills: [{ id: 'figma', name: 'Figma' }, { id: 'user-research', name: 'User Research' }, { id: 'prototyping', name: 'Prototyping' }] },
    { id: 'product-manager-tech', title: 'Product Manager (Tech)', fresherEligible: false, skills: [{ id: 'agile', name: 'Agile' }, { id: 'jira', name: 'JIRA' }] },
    { id: 'blockchain-developer', title: 'Blockchain Developer', fresherEligible: false, skills: [{ id: 'solidity', name: 'Solidity' }, { id: 'web3', name: 'Web3' }] },
  ] },
  { id: 'finance', name: 'Finance & Banking', icon: '🏦', fresherEligible: true, description: 'Banking, accounting, investment, insurance, fintech', occupations: [
    { id: 'accountant', title: 'Accountant', fresherEligible: true, skills: [{ id: 'tally', name: 'Tally' }, { id: 'gst', name: 'GST' }, { id: 'excel', name: 'MS Excel' }] },
    { id: 'financial-analyst', title: 'Financial Analyst', fresherEligible: true, skills: [{ id: 'financial-modelling', name: 'Financial Modelling' }, { id: 'excel', name: 'Excel' }] },
    { id: 'bank-officer', title: 'Bank Officer / PO', fresherEligible: true, skills: [{ id: 'banking-ops', name: 'Banking Operations' }, { id: 'kyc', name: 'KYC/AML' }] },
    { id: 'ca', title: 'Chartered Accountant (CA)', fresherEligible: true, skills: [{ id: 'audit', name: 'Audit' }, { id: 'ifrs', name: 'IFRS/GAAP' }] },
    { id: 'compliance-officer', title: 'Compliance Officer', fresherEligible: false, skills: [{ id: 'regulatory', name: 'Regulatory Compliance' }] },
    { id: 'insurance-advisor', title: 'Insurance Advisor', fresherEligible: true, skills: [{ id: 'sales', name: 'Sales' }, { id: 'insurance-products', name: 'Insurance Products' }] },
    { id: 'fintech-developer', title: 'FinTech Developer', fresherEligible: true, skills: [{ id: 'payment-apis', name: 'Payment APIs' }, { id: 'py', name: 'Python' }] },
    { id: 'tax-consultant', title: 'Tax Consultant', fresherEligible: false, skills: [{ id: 'income-tax', name: 'Income Tax' }, { id: 'gst', name: 'GST' }] },
  ] },
  { id: 'healthcare', name: 'Healthcare & Life Sciences', icon: '🏥', fresherEligible: true, description: 'Hospitals, clinics, pharma, biotech, nursing', occupations: [
    { id: 'mbbs-doctor', title: 'MBBS Doctor / Medical Officer', fresherEligible: true, skills: [{ id: 'patient-care', name: 'Patient Care' }, { id: 'diagnostics', name: 'Diagnostics' }] },
    { id: 'staff-nurse', title: 'Staff Nurse / RN', fresherEligible: true, skills: [{ id: 'nursing-care', name: 'Nursing Care' }, { id: 'icu', name: 'ICU/CCU' }] },
    { id: 'pharmacist', title: 'Pharmacist', fresherEligible: true, skills: [{ id: 'drug-dispensing', name: 'Drug Dispensing' }] },
    { id: 'medical-lab-tech', title: 'Medical Lab Technician', fresherEligible: true, skills: [{ id: 'lab-tests', name: 'Lab Tests' }, { id: 'pathology', name: 'Pathology' }] },
    { id: 'physiotherapist', title: 'Physiotherapist', fresherEligible: true, skills: [{ id: 'rehabilitation', name: 'Rehabilitation' }] },
    { id: 'clinical-research', title: 'Clinical Research Associate', fresherEligible: true, skills: [{ id: 'gcp', name: 'GCP' }, { id: 'clinical-trials', name: 'Clinical Trials' }] },
    { id: 'pharma-sales', title: 'Pharma Sales Representative', fresherEligible: true, skills: [{ id: 'detailing', name: 'Medical Detailing' }] },
    { id: 'dentist', title: 'Dentist', fresherEligible: true, skills: [{ id: 'dental-procedures', name: 'Dental Procedures' }] },
    { id: 'healthcare-it', title: 'Healthcare IT Specialist', fresherEligible: true, skills: [{ id: 'ehr', name: 'EHR Systems' }, { id: 'hl7', name: 'HL7/FHIR' }] },
  ] },
  { id: 'education', name: 'Education & Training', icon: '🎓', fresherEligible: true, description: 'Schools, colleges, EdTech, tutoring, e-learning', occupations: [
    { id: 'teacher', title: 'Teacher / Faculty', fresherEligible: true, skills: [{ id: 'curriculum', name: 'Curriculum Design' }, { id: 'classroom-mgmt', name: 'Classroom Management' }] },
    { id: 'edtech-content', title: 'EdTech Content Creator', fresherEligible: true, skills: [{ id: 'course-design', name: 'Course Design' }, { id: 'lms', name: 'LMS Platforms' }] },
    { id: 'academic-counsellor', title: 'Academic Counsellor', fresherEligible: true, skills: [{ id: 'counselling', name: 'Counselling' }] },
    { id: 'corporate-trainer', title: 'Corporate Trainer / L&D', fresherEligible: false, skills: [{ id: 'training-delivery', name: 'Training Delivery' }] },
    { id: 'tutor', title: 'Private Tutor / Online Tutor', fresherEligible: true, skills: [{ id: 'subject-expertise', name: 'Subject Expertise' }] },
  ] },
  { id: 'marketing', name: 'Marketing & Advertising', icon: '📢', fresherEligible: true, description: 'Digital marketing, SEO, content, social media', occupations: [
    { id: 'digital-marketer', title: 'Digital Marketing Executive', fresherEligible: true, skills: [{ id: 'seo', name: 'SEO' }, { id: 'sem', name: 'SEM/Google Ads' }, { id: 'social-media', name: 'Social Media' }] },
    { id: 'content-writer', title: 'Content Writer / Copywriter', fresherEligible: true, skills: [{ id: 'writing', name: 'Writing' }, { id: 'seo-writing', name: 'SEO Writing' }] },
    { id: 'social-media-manager', title: 'Social Media Manager', fresherEligible: true, skills: [{ id: 'meta-ads', name: 'Meta Ads' }, { id: 'content-calendar', name: 'Content Calendar' }] },
    { id: 'seo-specialist', title: 'SEO Specialist', fresherEligible: true, skills: [{ id: 'on-page-seo', name: 'On-Page SEO' }, { id: 'link-building', name: 'Link Building' }] },
    { id: 'performance-marketer', title: 'Performance Marketer', fresherEligible: true, skills: [{ id: 'google-ads', name: 'Google Ads' }, { id: 'facebook-ads', name: 'Facebook Ads' }] },
    { id: 'graphic-designer', title: 'Graphic Designer', fresherEligible: true, skills: [{ id: 'photoshop', name: 'Photoshop' }, { id: 'illustrator', name: 'Illustrator' }] },
    { id: 'video-producer', title: 'Video Producer / Editor', fresherEligible: true, skills: [{ id: 'premiere', name: 'Premiere Pro' }, { id: 'after-effects', name: 'After Effects' }] },
    { id: 'brand-manager', title: 'Brand Manager', fresherEligible: false, skills: [{ id: 'brand-strategy', name: 'Brand Strategy' }] },
    { id: 'email-marketer', title: 'Email Marketing Specialist', fresherEligible: true, skills: [{ id: 'mailchimp', name: 'Mailchimp' }] },
  ] },
  { id: 'sales', name: 'Sales & Business Development', icon: '🤝', fresherEligible: true, description: 'B2B/B2C sales, inside sales, field sales, BD', occupations: [
    { id: 'sales-executive', title: 'Sales Executive', fresherEligible: true, skills: [{ id: 'b2b-sales', name: 'B2B Sales' }, { id: 'crm', name: 'CRM' }] },
    { id: 'bde', title: 'Business Development Executive', fresherEligible: true, skills: [{ id: 'lead-gen', name: 'Lead Generation' }] },
    { id: 'inside-sales', title: 'Inside Sales Representative', fresherEligible: true, skills: [{ id: 'telesales', name: 'Telesales' }, { id: 'salesforce', name: 'Salesforce' }] },
    { id: 'field-sales', title: 'Field Sales Officer', fresherEligible: true, skills: [{ id: 'territory-sales', name: 'Territory Sales' }] },
    { id: 'key-account-manager', title: 'Key Account Manager', fresherEligible: false, skills: [{ id: 'account-management', name: 'Account Management' }] },
  ] },
  { id: 'hr', name: 'Human Resources & Recruitment', icon: '👥', fresherEligible: true, description: 'Talent acquisition, HR operations, payroll, L&D', occupations: [
    { id: 'recruiter', title: 'Recruiter / Talent Acquisition', fresherEligible: true, skills: [{ id: 'sourcing', name: 'Sourcing' }, { id: 'ats', name: 'ATS' }] },
    { id: 'hr-generalist', title: 'HR Generalist', fresherEligible: true, skills: [{ id: 'onboarding', name: 'Onboarding' }, { id: 'payroll', name: 'Payroll' }] },
    { id: 'hr-manager', title: 'HR Manager / HRBP', fresherEligible: false, skills: [{ id: 'hr-strategy', name: 'HR Strategy' }] },
    { id: 'payroll-specialist', title: 'Payroll Specialist', fresherEligible: true, skills: [{ id: 'payroll-processing', name: 'Payroll Processing' }, { id: 'pf-esi', name: 'PF/ESI' }] },
  ] },
  { id: 'engineering', name: 'Engineering & Manufacturing', icon: '⚙️', fresherEligible: true, description: 'Mechanical, electrical, civil, chemical, production', occupations: [
    { id: 'mechanical-engineer', title: 'Mechanical Engineer', fresherEligible: true, skills: [{ id: 'autocad', name: 'AutoCAD' }, { id: 'solidworks', name: 'SolidWorks' }] },
    { id: 'electrical-engineer', title: 'Electrical Engineer', fresherEligible: true, skills: [{ id: 'plc', name: 'PLC Programming' }, { id: 'scada', name: 'SCADA' }] },
    { id: 'civil-engineer', title: 'Civil Engineer', fresherEligible: true, skills: [{ id: 'autocad', name: 'AutoCAD' }, { id: 'site-management', name: 'Site Management' }] },
    { id: 'production-engineer', title: 'Production Engineer', fresherEligible: true, skills: [{ id: 'lean', name: 'Lean Manufacturing' }, { id: 'six-sigma', name: 'Six Sigma' }] },
    { id: 'quality-engineer', title: 'Quality Engineer / QC Inspector', fresherEligible: true, skills: [{ id: 'iso', name: 'ISO Standards' }, { id: 'fmea', name: 'FMEA' }] },
    { id: 'electronics-engineer', title: 'Electronics Engineer', fresherEligible: true, skills: [{ id: 'embedded', name: 'Embedded Systems' }, { id: 'pcb', name: 'PCB Design' }] },
    { id: 'chemical-engineer', title: 'Chemical Engineer', fresherEligible: true, skills: [{ id: 'process-engineering', name: 'Process Engineering' }] },
  ] },
  { id: 'construction', name: 'Construction & Real Estate', icon: '🏗️', fresherEligible: true, description: 'Construction, architecture, real estate', occupations: [
    { id: 'architect', title: 'Architect', fresherEligible: true, skills: [{ id: 'revit', name: 'Revit' }, { id: 'autocad', name: 'AutoCAD' }] },
    { id: 'site-engineer', title: 'Site Engineer', fresherEligible: true, skills: [{ id: 'site-supervision', name: 'Site Supervision' }] },
    { id: 'real-estate-agent', title: 'Real Estate Agent', fresherEligible: true, skills: [{ id: 'property-sales', name: 'Property Sales' }] },
    { id: 'quantity-surveyor', title: 'Quantity Surveyor', fresherEligible: true, skills: [{ id: 'estimation', name: 'Cost Estimation' }] },
    { id: 'interior-designer', title: 'Interior Designer', fresherEligible: true, skills: [{ id: '3d-design', name: '3D Design' }, { id: 'autocad', name: 'AutoCAD' }] },
  ] },
  { id: 'retail-fmcg', name: 'Retail & FMCG', icon: '🛒', fresherEligible: true, description: 'Retail operations, merchandising, FMCG sales', occupations: [
    { id: 'store-manager', title: 'Store Manager', fresherEligible: false, skills: [{ id: 'retail-ops', name: 'Retail Operations' }] },
    { id: 'merchandiser', title: 'Merchandiser / Visual Merchandiser', fresherEligible: true, skills: [{ id: 'visual-merchandising', name: 'Visual Merchandising' }] },
    { id: 'fmcg-sales', title: 'FMCG Sales Executive', fresherEligible: true, skills: [{ id: 'channel-sales', name: 'Channel Sales' }] },
    { id: 'ecommerce-manager', title: 'E-Commerce Manager', fresherEligible: true, skills: [{ id: 'marketplace', name: 'Marketplace Management' }, { id: 'amazon', name: 'Amazon/Flipkart' }] },
  ] },
  { id: 'logistics', name: 'Logistics & Supply Chain', icon: '🚚', fresherEligible: true, description: 'Supply chain, warehouse, freight, procurement', occupations: [
    { id: 'supply-chain-analyst', title: 'Supply Chain Analyst', fresherEligible: true, skills: [{ id: 'sap', name: 'SAP' }, { id: 'demand-planning', name: 'Demand Planning' }] },
    { id: 'warehouse-manager', title: 'Warehouse Manager', fresherEligible: true, skills: [{ id: 'wms', name: 'WMS' }, { id: 'inventory', name: 'Inventory Control' }] },
    { id: 'procurement', title: 'Purchase / Procurement Officer', fresherEligible: true, skills: [{ id: 'vendor-negotiations', name: 'Vendor Negotiations' }] },
    { id: 'freight-coordinator', title: 'Freight Coordinator', fresherEligible: true, skills: [{ id: 'freight', name: 'Freight Management' }] },
  ] },
  { id: 'hospitality', name: 'Hospitality & Tourism', icon: '🏨', fresherEligible: true, description: 'Hotels, restaurants, travel, aviation, events', occupations: [
    { id: 'chef', title: 'Chef / Cook', fresherEligible: true, skills: [{ id: 'culinary', name: 'Culinary Arts' }, { id: 'haccp', name: 'HACCP' }] },
    { id: 'travel-consultant', title: 'Travel Consultant', fresherEligible: true, skills: [{ id: 'gds', name: 'GDS (Amadeus/Galileo)' }] },
    { id: 'cabin-crew', title: 'Cabin Crew / Flight Attendant', fresherEligible: true, skills: [{ id: 'safety-training', name: 'Safety Training' }] },
    { id: 'event-manager', title: 'Event Manager', fresherEligible: true, skills: [{ id: 'event-planning', name: 'Event Planning' }] },
    { id: 'hotel-manager', title: 'Hotel / Front Office Manager', fresherEligible: false, skills: [{ id: 'pms', name: 'PMS Software' }] },
  ] },
  { id: 'bpo-kpo', name: 'BPO / KPO / Shared Services', icon: '📞', fresherEligible: true, description: 'Customer support, voice/non-voice, data entry, KPO', occupations: [
    { id: 'customer-support', title: 'Customer Support Executive', fresherEligible: true, skills: [{ id: 'communication', name: 'Communication' }, { id: 'crm', name: 'CRM Tools' }] },
    { id: 'data-entry', title: 'Data Entry Operator', fresherEligible: true, skills: [{ id: 'typing', name: 'Typing Speed' }, { id: 'ms-office', name: 'MS Office' }] },
    { id: 'technical-support', title: 'Technical Support Engineer', fresherEligible: true, skills: [{ id: 'troubleshooting', name: 'Troubleshooting' }] },
    { id: 'chat-support', title: 'Chat / Non-Voice Support Executive', fresherEligible: true, skills: [{ id: 'written-comm', name: 'Written Communication' }] },
  ] },
  { id: 'legal', name: 'Legal & Compliance', icon: '⚖️', fresherEligible: true, description: 'Corporate law, litigation, contracts, IP, compliance', occupations: [
    { id: 'advocate', title: 'Advocate / Lawyer', fresherEligible: true, skills: [{ id: 'legal-research', name: 'Legal Research' }, { id: 'litigation', name: 'Litigation' }] },
    { id: 'legal-intern', title: 'Legal Intern / Trainee', fresherEligible: true, skills: [{ id: 'legal-drafting', name: 'Legal Drafting' }] },
    { id: 'company-secretary', title: 'Company Secretary (CS)', fresherEligible: true, skills: [{ id: 'mca-filings', name: 'MCA Filings' }] },
    { id: 'compliance-manager', title: 'Compliance Manager', fresherEligible: false, skills: [{ id: 'regulatory-compliance', name: 'Regulatory Compliance' }] },
  ] },
  { id: 'media-entertainment', name: 'Media & Entertainment', icon: '🎬', fresherEligible: true, description: 'Film, OTT, gaming, journalism, publishing', occupations: [
    { id: 'journalist', title: 'Journalist / Reporter', fresherEligible: true, skills: [{ id: 'writing', name: 'Writing' }] },
    { id: 'video-editor', title: 'Video Editor', fresherEligible: true, skills: [{ id: 'premiere', name: 'Premiere Pro' }, { id: 'davinci', name: 'DaVinci Resolve' }] },
    { id: 'game-developer', title: 'Game Developer', fresherEligible: true, skills: [{ id: 'unity', name: 'Unity' }, { id: 'unreal', name: 'Unreal Engine' }] },
    { id: 'animator', title: '2D/3D Animator', fresherEligible: true, skills: [{ id: 'maya', name: 'Maya' }, { id: 'blender', name: 'Blender' }] },
  ] },
  { id: 'automobile', name: 'Automobile & EV', icon: '🚗', fresherEligible: true, description: 'Automotive engineering, EV, dealership, aftermarket', occupations: [
    { id: 'automotive-engineer', title: 'Automotive Engineer', fresherEligible: true, skills: [{ id: 'catia', name: 'CATIA' }, { id: 'autocad', name: 'AutoCAD' }] },
    { id: 'ev-engineer', title: 'EV / Electric Vehicle Engineer', fresherEligible: true, skills: [{ id: 'battery-mgmt', name: 'Battery Management' }] },
    { id: 'service-advisor', title: 'Service Advisor / Workshop Manager', fresherEligible: true, skills: [{ id: 'service-ops', name: 'Service Operations' }] },
    { id: 'automobile-sales', title: 'Automobile Sales Consultant', fresherEligible: true, skills: [{ id: 'negotiation', name: 'Negotiation' }] },
  ] },
  { id: 'telecom', name: 'Telecom & Networking', icon: '📡', fresherEligible: true, description: 'Telecom, 5G, network engineering, ISP, fiber optics', occupations: [
    { id: 'network-engineer', title: 'Network Engineer', fresherEligible: true, skills: [{ id: 'cisco', name: 'Cisco' }, { id: 'ccna', name: 'CCNA' }] },
    { id: 'telecom-engineer', title: 'Telecom Engineer', fresherEligible: true, skills: [{ id: '4g-5g', name: '4G/5G' }, { id: 'rf-planning', name: 'RF Planning' }] },
    { id: 'field-tech-telecom', title: 'Field Technician (Telecom)', fresherEligible: true, skills: [{ id: 'fiber', name: 'Fiber Splicing' }] },
  ] },
  { id: 'energy-power', name: 'Energy & Power', icon: '⚡', fresherEligible: true, description: 'Oil & gas, renewable energy, solar, wind, power plants', occupations: [
    { id: 'solar-engineer', title: 'Solar Energy Engineer', fresherEligible: true, skills: [{ id: 'solar-design', name: 'Solar System Design' }] },
    { id: 'power-plant-engineer', title: 'Power Plant Engineer / Operator', fresherEligible: false, skills: [{ id: 'dcs-scada', name: 'DCS/SCADA' }] },
    { id: 'oil-gas-engineer', title: 'Oil & Gas Engineer', fresherEligible: false, skills: [{ id: 'upstream', name: 'Upstream Operations' }] },
    { id: 'wind-energy', title: 'Wind Energy Technician', fresherEligible: true, skills: [{ id: 'turbine-maintenance', name: 'Turbine Maintenance' }] },
  ] },
  { id: 'agriculture', name: 'Agriculture & AgriTech', icon: '🌾', fresherEligible: true, description: 'Farming, agri-input, food processing, agritech', occupations: [
    { id: 'agronomist', title: 'Agronomist / Agriculture Officer', fresherEligible: true, skills: [{ id: 'crop-science', name: 'Crop Science' }] },
    { id: 'agri-sales', title: 'Agri Sales / Crop Advisor', fresherEligible: true, skills: [{ id: 'agri-products', name: 'Agri Products' }] },
    { id: 'food-technologist', title: 'Food Technologist / R&D', fresherEligible: true, skills: [{ id: 'fssai', name: 'FSSAI Regulations' }] },
  ] },
  { id: 'government-psu', name: 'Government & PSU', icon: '🏛️', fresherEligible: true, description: 'Central/state govt, PSU, defence, railways', occupations: [
    { id: 'ias-civil-service', title: 'Civil Services (IAS/IPS/IFS)', fresherEligible: true, skills: [{ id: 'upsc-prep', name: 'UPSC Preparation' }] },
    { id: 'psu-engineer', title: 'PSU Engineer (GATE)', fresherEligible: true, skills: [{ id: 'gate', name: 'GATE' }] },
    { id: 'bank-exam', title: 'Bank PO / Clerk (IBPS/SBI)', fresherEligible: true, skills: [{ id: 'banking-exams', name: 'Banking Exams' }] },
    { id: 'ssc-staff', title: 'SSC / Staff Selection', fresherEligible: true, skills: [{ id: 'reasoning', name: 'Reasoning' }] },
    { id: 'defence-forces', title: 'Defence Forces (Army/Navy/Air Force)', fresherEligible: true, skills: [{ id: 'physical-fitness', name: 'Physical Fitness' }] },
  ] },
  { id: 'startups', name: 'Startups & Entrepreneurship', icon: '🚀', fresherEligible: true, description: 'VC-backed startups, bootstrapped ventures, product/growth', occupations: [
    { id: 'growth-hacker', title: 'Growth Hacker / Growth Manager', fresherEligible: true, skills: [{ id: 'growth-marketing', name: 'Growth Marketing' }] },
    { id: 'product-manager-startup', title: 'Product Manager (Startup)', fresherEligible: false, skills: [{ id: 'product-thinking', name: 'Product Thinking' }] },
    { id: 'founder-associate', title: "Founder's Office / Chief of Staff", fresherEligible: false, skills: [{ id: 'strategic-planning', name: 'Strategic Planning' }] },
  ] },
  { id: 'research', name: 'Research & Development', icon: '🔬', fresherEligible: true, description: 'Scientific research, lab sciences, biotech', occupations: [
    { id: 'research-scientist', title: 'Research Scientist', fresherEligible: true, skills: [{ id: 'experimental-design', name: 'Experimental Design' }] },
    { id: 'biotech-researcher', title: 'Biotechnology Researcher', fresherEligible: true, skills: [{ id: 'pcr', name: 'PCR' }, { id: 'cell-culture', name: 'Cell Culture' }] },
    { id: 'material-scientist', title: 'Material Scientist / Metallurgist', fresherEligible: true, skills: [{ id: 'xrd', name: 'XRD Analysis' }] },
  ] },
  { id: 'consulting', name: 'Consulting & Strategy', icon: '📊', fresherEligible: false, description: 'Management consulting, strategy, business transformation', occupations: [
    { id: 'management-consultant', title: 'Management Consultant', fresherEligible: false, skills: [{ id: 'problem-solving', name: 'Problem Solving' }, { id: 'deck-making', name: 'Deck Making' }] },
    { id: 'strategy-analyst', title: 'Strategy Analyst', fresherEligible: true, skills: [{ id: 'market-analysis', name: 'Market Analysis' }] },
    { id: 'it-consultant', title: 'IT Consultant / Implementation Consultant', fresherEligible: false, skills: [{ id: 'sap-consulting', name: 'SAP Consulting' }] },
  ] },
  { id: 'insurance', name: 'Insurance', icon: '🛡️', fresherEligible: true, description: 'Life, general, health insurance, reinsurance', occupations: [
    { id: 'insurance-agent', title: 'Insurance Agent / Advisor', fresherEligible: true, skills: [{ id: 'sales', name: 'Sales' }, { id: 'irda-certification', name: 'IRDA Certification' }] },
    { id: 'underwriter', title: 'Underwriter', fresherEligible: false, skills: [{ id: 'risk-assessment', name: 'Risk Assessment' }] },
    { id: 'claims-executive', title: 'Claims Executive / Officer', fresherEligible: true, skills: [{ id: 'claims-processing', name: 'Claims Processing' }] },
  ] },
  { id: 'nonprofit', name: 'Non-Profit & Social Impact', icon: '💚', fresherEligible: true, description: 'NGOs, CSR, development sector, public health', occupations: [
    { id: 'program-officer', title: 'Program Officer / Development Professional', fresherEligible: true, skills: [{ id: 'project-mgmt', name: 'Project Management' }] },
    { id: 'csr-manager', title: 'CSR Manager', fresherEligible: false, skills: [{ id: 'csr-reporting', name: 'CSR Reporting' }] },
    { id: 'field-coordinator', title: 'Field Coordinator / Community Mobilizer', fresherEligible: true, skills: [{ id: 'community-outreach', name: 'Community Outreach' }] },
  ] },
  { id: 'aviation', name: 'Aviation & Aerospace', icon: '✈️', fresherEligible: true, description: 'Pilots, cabin crew, airport operations, aerospace', occupations: [
    { id: 'cabin-crew-aviation', title: 'Cabin Crew / Flight Attendant', fresherEligible: true, skills: [{ id: 'grooming', name: 'Grooming' }, { id: 'emergency-procedures', name: 'Emergency Procedures' }] },
    { id: 'airport-operations', title: 'Airport Operations Executive', fresherEligible: true, skills: [{ id: 'ramp-ops', name: 'Ramp Operations' }] },
    { id: 'aerospace-engineer', title: 'Aerospace Engineer', fresherEligible: true, skills: [{ id: 'aerodynamics', name: 'Aerodynamics' }] },
  ] },
  { id: 'environment', name: 'Environment & Sustainability', icon: '🌿', fresherEligible: true, description: 'Environmental engineering, ESG, climate, waste', occupations: [
    { id: 'env-engineer', title: 'Environmental Engineer', fresherEligible: true, skills: [{ id: 'eia', name: 'EIA/EMP' }] },
    { id: 'esg-analyst', title: 'ESG Analyst / Sustainability Manager', fresherEligible: false, skills: [{ id: 'esg-reporting', name: 'ESG Reporting' }] },
  ] },
  { id: 'security', name: 'Security & Safety', icon: '🔒', fresherEligible: true, description: 'Physical security, industrial safety, fire & safety', occupations: [
    { id: 'safety-officer', title: 'Safety Officer / EHS Officer', fresherEligible: true, skills: [{ id: 'nebosh', name: 'NEBOSH/IOSH' }] },
    { id: 'fire-safety', title: 'Fire Safety Officer', fresherEligible: true, skills: [{ id: 'fire-prevention', name: 'Fire Prevention' }] },
  ] },
  { id: 'sports-fitness', name: 'Sports, Fitness & Wellness', icon: '🏋️', fresherEligible: true, description: 'Sports coaching, fitness training, yoga, wellness', occupations: [
    { id: 'fitness-trainer', title: 'Fitness Trainer / Personal Trainer', fresherEligible: true, skills: [{ id: 'strength-training', name: 'Strength Training' }] },
    { id: 'yoga-instructor', title: 'Yoga Instructor', fresherEligible: true, skills: [{ id: 'yoga-techniques', name: 'Yoga Techniques' }] },
  ] },
  { id: 'beauty-wellness', name: 'Beauty & Personal Care', icon: '💄', fresherEligible: true, description: 'Salons, spas, skincare, cosmetology', occupations: [
    { id: 'cosmetologist', title: 'Cosmetologist / Hair Stylist', fresherEligible: true, skills: [{ id: 'hair-care', name: 'Hair Care' }] },
    { id: 'beauty-therapist', title: 'Beauty Therapist / Esthetician', fresherEligible: true, skills: [{ id: 'facials', name: 'Facials' }] },
  ] },
  { id: 'gig-delivery', name: 'Gig, Delivery & Last-Mile', icon: '🛵', fresherEligible: true, description: 'Delivery partners, last-mile logistics, gig platforms', occupations: [
    { id: 'delivery-executive', title: 'Delivery Executive / Partner', fresherEligible: true, skills: [{ id: 'navigation', name: 'Navigation Apps' }] },
    { id: 'driver', title: 'Driver / Chauffeur', fresherEligible: true, skills: [{ id: 'driving', name: 'Driving License' }] },
  ] },
  { id: 'pharmaceuticals', name: 'Pharmaceuticals & Biotech', icon: '💊', fresherEligible: true, description: 'Drug manufacturing, pharma sales, regulatory affairs', occupations: [
    { id: 'regulatory-affairs', title: 'Regulatory Affairs Specialist', fresherEligible: true, skills: [{ id: 'dossier', name: 'Dossier Preparation' }] },
    { id: 'medical-rep', title: 'Medical Representative', fresherEligible: true, skills: [{ id: 'detailing', name: 'Medical Detailing' }] },
    { id: 'production-pharma', title: 'Production Officer (Pharma)', fresherEligible: true, skills: [{ id: 'gmp', name: 'GMP' }] },
  ] },
  { id: 'textile-apparel', name: 'Textile & Apparel', icon: '👗', fresherEligible: true, description: 'Garment manufacturing, fashion design, textile', occupations: [
    { id: 'fashion-designer', title: 'Fashion Designer', fresherEligible: true, skills: [{ id: 'pattern-making', name: 'Pattern Making' }] },
    { id: 'garment-merchandiser', title: 'Garment Merchandiser', fresherEligible: true, skills: [{ id: 'costing', name: 'Costing' }] },
  ] },
  { id: 'public-administration', name: 'Public Administration & Policy', icon: '📋', fresherEligible: true, description: 'Policy analysis, urban planning, public health admin', occupations: [
    { id: 'policy-analyst', title: 'Policy Analyst / Researcher', fresherEligible: true, skills: [{ id: 'policy-research', name: 'Policy Research' }] },
    { id: 'urban-planner', title: 'Urban Planner / Town Planner', fresherEligible: true, skills: [{ id: 'gis', name: 'GIS' }] },
  ] },
  { id: 'mental-health', name: 'Mental Health & Psychology', icon: '🧠', fresherEligible: true, description: 'Clinical psychology, counselling, occupational therapy', occupations: [
    { id: 'psychologist', title: 'Psychologist / Clinical Psychologist', fresherEligible: true, skills: [{ id: 'psychotherapy', name: 'Psychotherapy' }] },
    { id: 'counsellor', title: 'Counsellor / Therapist', fresherEligible: true, skills: [{ id: 'cbt', name: 'CBT' }] },
  ] },
  { id: 'food-beverage', name: 'Food & Beverage', icon: '🍽️', fresherEligible: true, description: 'Food production, FSSAI, catering, QSR', occupations: [
    { id: 'restaurant-manager', title: 'Restaurant Manager / F&B Manager', fresherEligible: false, skills: [{ id: 'fb-operations', name: 'F&B Operations' }] },
    { id: 'qa-food', title: 'QA Executive (Food)', fresherEligible: true, skills: [{ id: 'haccp', name: 'HACCP' }, { id: 'fssai', name: 'FSSAI' }] },
  ] },
  { id: 'journalism-media', name: 'Journalism & Mass Communication', icon: '📰', fresherEligible: true, description: 'Print, digital, broadcast journalism, PR', occupations: [
    { id: 'digital-journalist', title: 'Digital Journalist / Online Reporter', fresherEligible: true, skills: [{ id: 'seo-writing', name: 'SEO Writing' }, { id: 'cms', name: 'CMS' }] },
    { id: 'journalist-reporter', title: 'Journalist / News Reporter', fresherEligible: true, skills: [{ id: 'reporting', name: 'Reporting' }] },
  ] },
  { id: 'accounting-audit', name: 'Accounting & Audit', icon: '🧾', fresherEligible: true, description: 'Statutory audit, internal audit, accounts payable', occupations: [
    { id: 'auditor', title: 'Auditor (Statutory / Internal)', fresherEligible: true, skills: [{ id: 'audit-procedures', name: 'Audit Procedures' }, { id: 'ind-as', name: 'Ind AS/GAAP' }] },
    { id: 'accounts-executive', title: 'Accounts Executive', fresherEligible: true, skills: [{ id: 'tally', name: 'Tally' }, { id: 'reconciliation', name: 'Bank Reconciliation' }] },
  ] },
  { id: 'mining', name: 'Mining & Minerals', icon: '⛏️', fresherEligible: false, description: 'Mining engineering, geology, mineral processing', occupations: [
    { id: 'mining-engineer', title: 'Mining Engineer', fresherEligible: false, skills: [{ id: 'mine-planning', name: 'Mine Planning' }] },
    { id: 'geologist', title: 'Geologist / Geological Surveyor', fresherEligible: true, skills: [{ id: 'gis', name: 'GIS' }, { id: 'field-mapping', name: 'Field Mapping' }] },
  ] },
  { id: 'marine-shipping', name: 'Marine & Shipping', icon: '⛴️', fresherEligible: false, description: 'Merchant navy, port operations, logistics shipping', occupations: [
    { id: 'marine-engineer', title: 'Marine Engineer', fresherEligible: false, skills: [{ id: 'stcw', name: 'STCW Certification' }] },
    { id: 'nautical-officer', title: 'Deck Officer / Nautical Officer', fresherEligible: false, skills: [{ id: 'navigation', name: 'Navigation' }, { id: 'ecdis', name: 'ECDIS' }] },
  ] },
  { id: 'events-pr', name: 'Events, Exhibitions & PR', icon: '🎪', fresherEligible: true, description: 'Event management, conference production, PR', occupations: [
    { id: 'event-coordinator', title: 'Event Coordinator / Producer', fresherEligible: true, skills: [{ id: 'venue-management', name: 'Venue Management' }] },
    { id: 'pr-executive', title: 'PR Executive / Media Relations', fresherEligible: true, skills: [{ id: 'media-pitching', name: 'Media Pitching' }] },
  ] },
  { id: 'social-work', name: 'Social Work & Community Development', icon: '🤲', fresherEligible: true, description: 'Social workers, community health workers, child welfare', occupations: [
    { id: 'social-worker', title: 'Social Worker / Case Worker', fresherEligible: true, skills: [{ id: 'case-management', name: 'Case Management' }] },
    { id: 'anganwadi-worker', title: 'Anganwadi / Community Health Worker', fresherEligible: true, skills: [{ id: 'community-outreach', name: 'Community Outreach' }] },
  ] },
  { id: 'printing-packaging', name: 'Printing & Packaging', icon: '📦', fresherEligible: true, description: 'Packaging design, printing industry, label manufacturing', occupations: [
    { id: 'packaging-designer', title: 'Packaging Designer', fresherEligible: true, skills: [{ id: 'adobe-suite', name: 'Adobe Suite' }] },
    { id: 'printing-operator', title: 'Printing Operator / Machine Operator', fresherEligible: true, skills: [{ id: 'offset-printing', name: 'Offset Printing' }] },
  ] }
] as const;

export const INDUSTRY_FAMILY_MAP: Readonly<Record<string, IndustryFamily>> =
  Object.fromEntries(INDUSTRY_FAMILIES.map((f) => [f.id, f]));

export const INDUSTRY_IDS = INDUSTRY_FAMILIES.map((f) => f.id);
export const FRESHER_ELIGIBLE_INDUSTRIES = INDUSTRY_FAMILIES.filter((f) => f.fresherEligible);

export function searchIndustries(query: string): IndustryFamily[] {
  const q = query.toLowerCase().trim();
  if (!q) return [...INDUSTRY_FAMILIES];
  return INDUSTRY_FAMILIES.filter((family) => {
    if (family.name.toLowerCase().includes(q)) return true;
    if (family.description.toLowerCase().includes(q)) return true;
    return family.occupations.some((occ) =>
      occ.title.toLowerCase().includes(q) ||
      occ.skills.some((s) => s.name.toLowerCase().includes(q))
    );
  });
}

export function getAllOccupations(fresherOnly = false): Array<IndustryOccupation & { familyId: string; familyName: string }> {
  const result: Array<IndustryOccupation & { familyId: string; familyName: string }> = [];
  for (const family of INDUSTRY_FAMILIES) {
    for (const occ of family.occupations) {
      if (fresherOnly && !occ.fresherEligible) continue;
      result.push({ ...occ, familyId: family.id, familyName: family.name });
    }
  }
  return result;
}

export function getAllSkills(): IndustrySkill[] {
  const seen = new Set<string>();
  const skills: IndustrySkill[] = [];
  for (const family of INDUSTRY_FAMILIES) {
    for (const occ of family.occupations) {
      for (const skill of occ.skills) {
        if (!seen.has(skill.id)) { seen.add(skill.id); skills.push(skill); }
      }
    }
  }
  return skills;
}

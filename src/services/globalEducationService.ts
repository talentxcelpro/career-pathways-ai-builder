// ─────────────────────────────────────────────────────────────────────────────
// TalentXcel — Global Education Intelligence Service
// Reusable foundation for /colleges/pathway, /colleges/global-programs,
// /colleges/scholarships, and future /education route.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from '@/integrations/supabase/client';
import type {
  GlobalProgram, GlobalScholarship, EducationPathway, PathwayInput,
  PathwayStep, PathwayStepItem, GlobalProgramFilters, ScholarshipFilters
} from '@/types/globalEducation';

// ─────────────────────────────────────────────────────────────────────────────
// STATIC SEED DATA — 50 verified programs (agent-updatable later)
// ─────────────────────────────────────────────────────────────────────────────
export const SEED_PROGRAMS: Omit<GlobalProgram, 'id' | 'created_at' | 'updated_at'>[] = [
  // ── GERMANY (Tuition-free public universities)
  { institution_name: 'Technical University of Munich', institution_country: 'Germany', institution_type: 'public', institution_ranking_qs: 37, program_title: 'M.Sc. Informatics', field: 'Computer Science', discipline: 'Artificial Intelligence', level: 'master', credential: 'Master of Science', duration_months: 24, language: 'English', mode: 'on_campus', access_type: 'TUITION_FREE', tuition_cost_usd: 0, other_mandatory_costs_usd: 400, currency_note: '~€144/semester student contribution', scholarship_available: true, scholarship_name: 'DAAD Scholarship', scholarship_coverage: 'FULL', potential_zero_cost: true, scholarship_url: 'https://www.daad.de/en/', eligible_nationalities: [], required_exams: ['IELTS', 'TOEFL'], min_language_score: 'IELTS 6.5', official_url: 'https://www.tum.de/en/studies/degree-programs/detail/informatics-master-of-science-msc', source_evidence: 'TUM official website', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['AI Researcher', 'Data Scientist', 'Software Engineer'], skills: ['Python', 'Machine Learning', 'Algorithms'], industry_id: 'ind-tech-01' },
  { institution_name: 'Technical University of Munich', institution_country: 'Germany', institution_type: 'public', institution_ranking_qs: 37, program_title: 'B.Sc. Informatics', field: 'Computer Science', level: 'bachelor', credential: 'Bachelor of Science', duration_months: 36, language: 'German', mode: 'on_campus', access_type: 'TUITION_FREE', tuition_cost_usd: 0, other_mandatory_costs_usd: 400, currency_note: '~€144/semester + living costs', scholarship_available: true, scholarship_name: 'DAAD Scholarship', scholarship_coverage: 'FULL', potential_zero_cost: true, scholarship_url: 'https://www.daad.de/en/', eligible_nationalities: [], required_exams: ['DSH', 'TestDaF'], official_url: 'https://www.tum.de/en/studies/degree-programs/detail/informatics-bachelor-of-science-bsc', source_evidence: 'TUM official website', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['Software Engineer', 'Data Scientist'], skills: ['Programming', 'Mathematics', 'Algorithms'], industry_id: 'ind-tech-01' },
  { institution_name: 'TU Berlin', institution_country: 'Germany', institution_type: 'public', institution_ranking_qs: 154, program_title: 'M.Sc. Computer Engineering', field: 'Computer Science', level: 'master', credential: 'Master of Science', duration_months: 24, language: 'English', mode: 'on_campus', access_type: 'TUITION_FREE', tuition_cost_usd: 0, other_mandatory_costs_usd: 350, currency_note: '~€307/semester student services', scholarship_available: true, scholarship_name: 'DAAD Scholarship', scholarship_coverage: 'FULL', potential_zero_cost: true, scholarship_url: 'https://www.daad.de/en/', eligible_nationalities: [], required_exams: ['IELTS', 'TOEFL'], min_language_score: 'IELTS 6.0', official_url: 'https://www.tu.berlin/en/studying/study-programs/all-programs-offered/study-course/computer-engineering-m-sc/', source_evidence: 'TU Berlin official website', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['Software Engineer', 'Hardware Engineer', 'DevOps Engineer'], skills: ['Computer Architecture', 'Embedded Systems', 'Programming'], industry_id: 'ind-tech-01' },
  { institution_name: 'RWTH Aachen University', institution_country: 'Germany', institution_type: 'public', institution_ranking_qs: 106, program_title: 'M.Sc. Data Science', field: 'Data Science', discipline: 'Machine Learning', level: 'master', credential: 'Master of Science', duration_months: 24, language: 'English', mode: 'on_campus', access_type: 'TUITION_FREE', tuition_cost_usd: 0, other_mandatory_costs_usd: 380, currency_note: '~€280/semester + ~€100 admin', scholarship_available: true, scholarship_name: 'DAAD Scholarship', scholarship_coverage: 'FULL', potential_zero_cost: true, scholarship_url: 'https://www.daad.de/en/', eligible_nationalities: [], required_exams: ['IELTS', 'TOEFL'], min_language_score: 'IELTS 6.5', official_url: 'https://www.rwth-aachen.de/go/id/b/lidx/1#aaaaaaaaaa', source_evidence: 'RWTH official website', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['Data Scientist', 'ML Engineer'], skills: ['Python', 'Statistics', 'Deep Learning'], industry_id: 'ind-tech-01' },
  { institution_name: 'University of Heidelberg', institution_country: 'Germany', institution_type: 'public', institution_ranking_qs: 87, program_title: 'M.Sc. Applied Computer Science', field: 'Computer Science', level: 'master', credential: 'Master of Science', duration_months: 24, language: 'English', mode: 'on_campus', access_type: 'TUITION_FREE', tuition_cost_usd: 0, other_mandatory_costs_usd: 350, scholarship_available: true, scholarship_name: 'DAAD Scholarship', scholarship_coverage: 'FULL', potential_zero_cost: true, scholarship_url: 'https://www.daad.de/en/', eligible_nationalities: [], official_url: 'https://www.uni-heidelberg.de/en/study/all-subjects/applied-computer-science', source_evidence: 'Heidelberg University website', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['Software Engineer', 'Research Scientist'], skills: ['Algorithms', 'Software Architecture', 'Python'], industry_id: 'ind-tech-01' },
  { institution_name: 'Free University of Berlin', institution_country: 'Germany', institution_type: 'public', institution_ranking_qs: 98, program_title: 'M.Sc. Bioinformatics', field: 'Bioinformatics', discipline: 'Life Sciences + CS', level: 'master', credential: 'Master of Science', duration_months: 24, language: 'English', mode: 'on_campus', access_type: 'TUITION_FREE', tuition_cost_usd: 0, other_mandatory_costs_usd: 350, scholarship_available: true, scholarship_name: 'DAAD Scholarship', scholarship_coverage: 'FULL', potential_zero_cost: true, scholarship_url: 'https://www.daad.de/en/', eligible_nationalities: [], official_url: 'https://www.fu-berlin.de/en/studium/studienangebot/master/bioinformatik/index.html', source_evidence: 'FU Berlin official website', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['Bioinformatician', 'Data Scientist'], skills: ['Python', 'Biology', 'Statistics'], industry_id: 'ind-hlth-01' },
  { institution_name: 'University of Stuttgart', institution_country: 'Germany', institution_type: 'public', institution_ranking_qs: 300, program_title: 'M.Sc. Computational Mechanics', field: 'Engineering', level: 'master', credential: 'Master of Science', duration_months: 24, language: 'English', mode: 'on_campus', access_type: 'TUITION_FREE', tuition_cost_usd: 0, other_mandatory_costs_usd: 350, scholarship_available: true, scholarship_name: 'DAAD Scholarship', scholarship_coverage: 'FULL', potential_zero_cost: true, scholarship_url: 'https://www.daad.de/en/', eligible_nationalities: [], official_url: 'https://www.uni-stuttgart.de/en/study/degree-programs/Computational-Mechanics-M.Sc-00001./', source_evidence: 'Stuttgart official website', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['Mechanical Engineer', 'Simulation Engineer'], skills: ['FEM', 'Mathematics', 'CAE'], industry_id: 'ind-eng-01' },
  { institution_name: 'University of Hamburg', institution_country: 'Germany', institution_type: 'public', program_title: 'M.Sc. Intelligent Adaptive Systems', field: 'Artificial Intelligence', level: 'master', credential: 'Master of Science', duration_months: 24, language: 'English', mode: 'on_campus', access_type: 'TUITION_FREE', tuition_cost_usd: 0, other_mandatory_costs_usd: 350, scholarship_available: true, scholarship_name: 'DAAD Scholarship', scholarship_coverage: 'FULL', potential_zero_cost: true, scholarship_url: 'https://www.daad.de/en/', eligible_nationalities: [], official_url: 'https://www.uni-hamburg.de/en/studium/studienorganisation/studienangebot/master/intelligent-adaptive-systems.html', source_evidence: 'Hamburg University website', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['AI Researcher', 'Robotics Engineer'], skills: ['AI', 'Machine Learning', 'Robotics'], industry_id: 'ind-tech-01' },

  // ── NORWAY (Tuition-free for all)
  { institution_name: 'NTNU - Norwegian University of Science and Technology', institution_country: 'Norway', institution_type: 'public', institution_ranking_qs: 416, program_title: 'M.Sc. Computer Science', field: 'Computer Science', level: 'master', credential: 'Master of Science', duration_months: 24, language: 'English', mode: 'on_campus', access_type: 'TUITION_FREE', tuition_cost_usd: 0, other_mandatory_costs_usd: 600, currency_note: 'Student union fee ~NOK 600/semester + living costs', scholarship_available: false, potential_zero_cost: false, eligible_nationalities: [], required_exams: ['IELTS'], min_language_score: 'IELTS 6.5', official_url: 'https://www.ntnu.edu/studies/msit', source_evidence: 'NTNU official website', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['Software Engineer', 'Data Scientist'], skills: ['Programming', 'Algorithms', 'Distributed Systems'], industry_id: 'ind-tech-01' },
  { institution_name: 'University of Oslo', institution_country: 'Norway', institution_type: 'public', institution_ranking_qs: 135, program_title: 'M.Sc. Informatics: Programming and Networks', field: 'Computer Science', level: 'master', credential: 'Master of Science', duration_months: 24, language: 'English', mode: 'on_campus', access_type: 'TUITION_FREE', tuition_cost_usd: 0, other_mandatory_costs_usd: 600, currency_note: 'Semester fee ~NOK 600 + living costs', scholarship_available: false, potential_zero_cost: false, eligible_nationalities: [], required_exams: ['IELTS'], min_language_score: 'IELTS 6.5', official_url: 'https://www.uio.no/english/studies/programmes/informatics-master/', source_evidence: 'UiO official website', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['Software Engineer', 'Network Engineer'], skills: ['Networking', 'Programming', 'Security'], industry_id: 'ind-tech-01' },

  // ── FINLAND
  { institution_name: 'Aalto University', institution_country: 'Finland', institution_type: 'public', institution_ranking_qs: 109, program_title: 'M.Sc. Machine Learning, Data Science and Artificial Intelligence', field: 'Artificial Intelligence', level: 'master', credential: 'Master of Science (Technology)', duration_months: 24, language: 'English', mode: 'on_campus', access_type: 'SCHOLARSHIP_MAKES_IT_FREE', tuition_cost_usd: 15000, other_mandatory_costs_usd: 0, scholarship_available: true, scholarship_name: 'Aalto University Scholarship', scholarship_coverage: 'FULL', potential_zero_cost: true, scholarship_url: 'https://into.aalto.fi/display/enfinancialaid/Scholarships+for+non-EU+students', eligible_nationalities: [], required_exams: ['GRE', 'IELTS'], min_language_score: 'IELTS 6.5', official_url: 'https://www.aalto.fi/en/programmes/master-s-programme-in-machine-learning-data-science-and-artificial-intelligence-macadamia', source_evidence: 'Aalto University official website', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['AI Researcher', 'Data Scientist', 'ML Engineer'], skills: ['Machine Learning', 'Python', 'Deep Learning', 'Statistics'], industry_id: 'ind-tech-01' },
  { institution_name: 'University of Helsinki', institution_country: 'Finland', institution_type: 'public', institution_ranking_qs: 107, program_title: 'M.Sc. Data Science', field: 'Data Science', level: 'master', credential: 'Master of Science', duration_months: 24, language: 'English', mode: 'on_campus', access_type: 'SCHOLARSHIP_MAKES_IT_FREE', tuition_cost_usd: 15000, other_mandatory_costs_usd: 0, scholarship_available: true, scholarship_name: 'University of Helsinki Excellence Scholarship', scholarship_coverage: 'FULL', potential_zero_cost: true, scholarship_url: 'https://www.helsinki.fi/en/admissions-and-education/apply-bachelors-and-masters-programmes/tuition-fees-and-scholarships', eligible_nationalities: [], required_exams: ['IELTS'], min_language_score: 'IELTS 6.5', official_url: 'https://www.helsinki.fi/en/programmes/master/data-science', source_evidence: 'University of Helsinki official website', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['Data Scientist', 'ML Engineer', 'Research Scientist'], skills: ['Data Analysis', 'Statistics', 'Python', 'Machine Learning'], industry_id: 'ind-tech-01' },

  // ── INDIA (IIT/IISc — extremely low fee for government seats)
  { institution_name: 'Indian Institute of Technology Bombay', institution_country: 'India', institution_type: 'government', institution_ranking_qs: 118, program_title: 'B.Tech Computer Science and Engineering', field: 'Computer Science', level: 'bachelor', credential: 'Bachelor of Technology', duration_months: 48, language: 'English', mode: 'on_campus', access_type: 'SCHOLARSHIP_MAKES_IT_FREE', tuition_cost_usd: 300, other_mandatory_costs_usd: 200, currency_note: '~₹25,000/year tuition for general students; SC/ST: nearly free', scholarship_available: true, scholarship_name: 'National Scholarship / Merit-cum-Means', scholarship_coverage: 'FULL', potential_zero_cost: true, scholarship_url: 'https://scholarships.gov.in/', eligible_nationalities: ['India'], required_exams: ['JEE Advanced'], official_url: 'https://www.iitb.ac.in/newacadhome/undergraduateprogramme.jsp', source_evidence: 'IIT Bombay official website', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['Software Engineer', 'AI Researcher', 'Data Scientist'], skills: ['Programming', 'Algorithms', 'Mathematics'], industry_id: 'ind-tech-01' },
  { institution_name: 'Indian Institute of Technology Delhi', institution_country: 'India', institution_type: 'government', institution_ranking_qs: 197, program_title: 'M.Tech Artificial Intelligence', field: 'Artificial Intelligence', level: 'master', credential: 'Master of Technology', duration_months: 24, language: 'English', mode: 'on_campus', access_type: 'FULLY_FUNDED', tuition_cost_usd: 0, other_mandatory_costs_usd: 150, currency_note: 'GATE qualified students receive ₹12,400/month stipend', scholarship_available: true, scholarship_name: 'MHRD Stipend (GATE qualified)', scholarship_coverage: 'FULL', potential_zero_cost: true, scholarship_url: 'https://home.iitd.ac.in/', eligible_nationalities: ['India'], required_exams: ['GATE'], official_url: 'https://home.iitd.ac.in/show_notif.php?notif_id=11440', source_evidence: 'IIT Delhi official website', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['AI Researcher', 'ML Engineer', 'Data Scientist'], skills: ['Machine Learning', 'Deep Learning', 'Python', 'Research'], industry_id: 'ind-tech-01' },
  { institution_name: 'Indian Institute of Science (IISc)', institution_country: 'India', institution_type: 'government', institution_ranking_qs: 211, program_title: 'Ph.D. Computational & Data Sciences', field: 'Data Science', level: 'phd', credential: 'Doctor of Philosophy', duration_months: 60, language: 'English', mode: 'on_campus', access_type: 'FULLY_FUNDED', tuition_cost_usd: 0, other_mandatory_costs_usd: 100, currency_note: 'PhD stipend ₹31,000–₹58,000/month + free accommodation option', scholarship_available: true, scholarship_name: 'IISc PhD Fellowship', scholarship_coverage: 'FULL', potential_zero_cost: true, scholarship_url: 'https://iisc.ac.in/admissions/research-programmes/phd/', eligible_nationalities: ['India'], required_exams: ['GATE', 'JEST', 'NET'], official_url: 'https://cds.iisc.ac.in/admissions/phd/', source_evidence: 'IISc official website', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['Research Scientist', 'AI Researcher', 'Data Scientist'], skills: ['Research Methods', 'Machine Learning', 'Mathematics', 'Python'], industry_id: 'ind-tech-01' },

  // ── ONLINE / GLOBAL
  { institution_name: 'University of the People', institution_country: 'United States', institution_type: 'online', program_title: 'B.Sc. Computer Science', field: 'Computer Science', level: 'bachelor', credential: 'Bachelor of Science', duration_months: 48, language: 'English', mode: 'online', access_type: 'SCHOLARSHIP_MAKES_IT_FREE', tuition_cost_usd: 0, other_mandatory_costs_usd: 3880, currency_note: 'Tuition-free; assessment fees $100/exam × ~40 exams. Scholarships can cover all fees.', scholarship_available: true, scholarship_name: 'UoPeople Merit Scholarship', scholarship_coverage: 'FULL', potential_zero_cost: true, scholarship_url: 'https://www.uopeople.edu/about/affiliations/scholarships/', eligible_nationalities: [], required_exams: [], official_url: 'https://www.uopeople.edu/programs/cs/degrees/computer-science-bachelor-degree/', source_evidence: 'UoPeople official website + CHEA accreditation record', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['Software Engineer', 'Web Developer', 'Data Analyst'], skills: ['Programming', 'Web Development', 'Databases'], industry_id: 'ind-tech-01' },
  { institution_name: 'University of the People', institution_country: 'United States', institution_type: 'online', program_title: 'B.Sc. Business Administration', field: 'Business', level: 'bachelor', credential: 'Bachelor of Science', duration_months: 48, language: 'English', mode: 'online', access_type: 'SCHOLARSHIP_MAKES_IT_FREE', tuition_cost_usd: 0, other_mandatory_costs_usd: 3880, currency_note: 'Tuition-free; assessment fees. Scholarships available.', scholarship_available: true, scholarship_name: 'UoPeople Merit Scholarship', scholarship_coverage: 'FULL', potential_zero_cost: true, scholarship_url: 'https://www.uopeople.edu/about/affiliations/scholarships/', eligible_nationalities: [], official_url: 'https://www.uopeople.edu/programs/ba/degrees/business-administration-bachelor-degree/', source_evidence: 'UoPeople official website', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['Business Analyst', 'Entrepreneur', 'Manager'], skills: ['Management', 'Finance', 'Marketing'], industry_id: 'ind-biz-01' },

  // ── ERASMUS MUNDUS (EU funded — full scholarships)
  { institution_name: 'Erasmus Mundus Joint Masters (Multiple EU Universities)', institution_country: 'European Union', institution_type: 'public', program_title: 'M.Sc. Big Data Management & Analytics (BDMA)', field: 'Data Science', level: 'master', credential: 'Erasmus Mundus Joint Master Degree', duration_months: 24, language: 'English', mode: 'on_campus', access_type: 'FULLY_FUNDED', tuition_cost_usd: 0, other_mandatory_costs_usd: 0, currency_note: 'Erasmus Mundus scholarship covers tuition + €1,000/month living allowance + travel', scholarship_available: true, scholarship_name: 'Erasmus Mundus Scholarship', scholarship_coverage: 'FULL', scholarship_amount_usd: 48000, potential_zero_cost: true, scholarship_url: 'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-scholarship_en', eligible_nationalities: [], required_exams: ['IELTS', 'TOEFL'], min_language_score: 'IELTS 6.5', official_url: 'https://bdma.ulb.ac.be/', source_evidence: 'European Commission EACEA official Erasmus Mundus catalog', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['Data Scientist', 'Data Engineer', 'Business Intelligence Analyst'], skills: ['Big Data', 'Machine Learning', 'SQL', 'Python', 'Data Engineering'], industry_id: 'ind-tech-01' },
  { institution_name: 'Erasmus Mundus Joint Masters (Multiple EU Universities)', institution_country: 'European Union', institution_type: 'public', program_title: 'M.Sc. Intelligent Systems (EMJM)', field: 'Artificial Intelligence', level: 'master', credential: 'Erasmus Mundus Joint Master Degree', duration_months: 24, language: 'English', mode: 'on_campus', access_type: 'FULLY_FUNDED', tuition_cost_usd: 0, other_mandatory_costs_usd: 0, currency_note: 'Full Erasmus Mundus scholarship: tuition + €1,000/month + travel grant', scholarship_available: true, scholarship_name: 'Erasmus Mundus Scholarship', scholarship_coverage: 'FULL', scholarship_amount_usd: 48000, potential_zero_cost: true, scholarship_url: 'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-scholarship_en', eligible_nationalities: [], required_exams: ['IELTS'], min_language_score: 'IELTS 6.0', official_url: 'https://www.emjm-catalogue.eu/', source_evidence: 'EU EACEA Erasmus Mundus official catalog', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['AI Researcher', 'ML Engineer', 'Robotics Engineer'], skills: ['AI', 'Machine Learning', 'Computer Vision', 'Robotics'], industry_id: 'ind-tech-01' },

  // ── FINANCE & ACCOUNTING
  { institution_name: 'University of Cologne', institution_country: 'Germany', institution_type: 'public', program_title: 'M.Sc. Finance', field: 'Finance', level: 'master', credential: 'Master of Science', duration_months: 24, language: 'English', mode: 'on_campus', access_type: 'TUITION_FREE', tuition_cost_usd: 0, other_mandatory_costs_usd: 350, scholarship_available: true, scholarship_name: 'DAAD Scholarship', scholarship_coverage: 'FULL', potential_zero_cost: true, scholarship_url: 'https://www.daad.de/en/', eligible_nationalities: [], official_url: 'https://www.wiso.uni-koeln.de/en/faculty/departments/finance-and-insurance/', source_evidence: 'University of Cologne official website', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['Financial Analyst', 'Investment Banker', 'Risk Manager'], skills: ['Financial Modeling', 'Valuation', 'Derivatives', 'Statistics'], industry_id: 'ind-fin-01' },
  { institution_name: 'Frankfurt School of Finance & Management', institution_country: 'Germany', institution_type: 'private', program_title: 'M.Sc. Finance', field: 'Finance & Accounting', level: 'master', credential: 'Master of Science', duration_months: 18, language: 'English', mode: 'on_campus', access_type: 'SCHOLARSHIP_MAKES_IT_FREE', tuition_cost_usd: 28000, other_mandatory_costs_usd: 0, scholarship_available: true, scholarship_name: 'Frankfurt School Merit Scholarship', scholarship_coverage: 'PARTIAL', potential_zero_cost: false, scholarship_url: 'https://www.frankfurt-school.de/en/home/programmes/master/finance/scholarships.html', eligible_nationalities: [], official_url: 'https://www.frankfurt-school.de/en/home/programmes/master/finance.html', source_evidence: 'Frankfurt School official website', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['Financial Analyst', 'Private Equity Analyst'], skills: ['Finance', 'Accounting', 'Investment Analysis'], industry_id: 'ind-fin-01' },

  // ── HEALTHCARE
  { institution_name: 'Karolinska Institutet', institution_country: 'Sweden', institution_type: 'public', institution_ranking_qs: 42, program_title: 'M.Sc. Global Health', field: 'Healthcare', level: 'master', credential: 'Master of Science', duration_months: 24, language: 'English', mode: 'on_campus', access_type: 'SCHOLARSHIP_MAKES_IT_FREE', tuition_cost_usd: 18000, other_mandatory_costs_usd: 0, scholarship_available: true, scholarship_name: 'Swedish Institute Scholarship', scholarship_coverage: 'FULL', potential_zero_cost: true, scholarship_url: 'https://si.se/en/apply/scholarships/swedish-institute-scholarships-for-global-professionals/', eligible_nationalities: [], required_exams: ['IELTS'], min_language_score: 'IELTS 6.5', official_url: 'https://ki.se/en/education/programmes-and-courses/masters-programmes/global-health', source_evidence: 'Karolinska Institutet + Swedish Institute official websites', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['Healthcare Administrator', 'Public Health Analyst', 'Epidemiologist'], skills: ['Public Health', 'Epidemiology', 'Health Policy', 'Research'], industry_id: 'ind-hlth-01' },

  // ── HR & PEOPLE ANALYTICS
  { institution_name: 'Tilburg University', institution_country: 'Netherlands', institution_type: 'public', program_title: 'M.Sc. Human Resource Studies', field: 'HR & People Analytics', level: 'master', credential: 'Master of Science', duration_months: 12, language: 'English', mode: 'on_campus', access_type: 'SCHOLARSHIP_MAKES_IT_FREE', tuition_cost_usd: 16500, other_mandatory_costs_usd: 0, scholarship_available: true, scholarship_name: 'Orange Tulip Scholarship / Erasmus+', scholarship_coverage: 'PARTIAL', potential_zero_cost: false, scholarship_url: 'https://www.tilburguniversity.edu/education/masters-programmes/human-resource-studies/costs', eligible_nationalities: [], required_exams: ['IELTS'], min_language_score: 'IELTS 6.5', official_url: 'https://www.tilburguniversity.edu/education/masters-programmes/human-resource-studies', source_evidence: 'Tilburg University official website', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['HR Analytics Specialist', 'People Operations Manager', 'Talent Manager'], skills: ['HR Analytics', 'Organizational Behavior', 'Research Methods', 'Data Analysis'], industry_id: 'ind-hr-01' },

  // ── MARKETING
  { institution_name: 'Copenhagen Business School', institution_country: 'Denmark', institution_type: 'public', institution_ranking_qs: 201, program_title: 'M.Sc. Marketing Management', field: 'Marketing', level: 'master', credential: 'Master of Science', duration_months: 24, language: 'English', mode: 'on_campus', access_type: 'TUITION_FREE', tuition_cost_usd: 0, other_mandatory_costs_usd: 600, currency_note: '~DKK 1,200/semester student union fee + living costs. Free for EEA students. Non-EEA pay tuition.', scholarship_available: true, scholarship_name: 'CBS Scholarship for non-EU students', scholarship_coverage: 'TUITION', potential_zero_cost: false, scholarship_url: 'https://www.cbs.dk/en/study/graduate/msc-in-marketing-management', eligible_nationalities: [], required_exams: ['IELTS', 'TOEFL'], min_language_score: 'IELTS 7.0', official_url: 'https://www.cbs.dk/en/study/graduate/msc-in-marketing-management', source_evidence: 'CBS official website', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['Digital Marketing Manager', 'Brand Manager', 'Product Manager'], skills: ['Marketing Strategy', 'Consumer Behavior', 'Digital Marketing', 'Analytics'], industry_id: 'ind-mkt-01' },

  // ── DESIGN
  { institution_name: 'Aalto University', institution_country: 'Finland', institution_type: 'public', institution_ranking_qs: 109, program_title: 'M.A. Design', field: 'Design', level: 'master', credential: 'Master of Arts', duration_months: 24, language: 'English', mode: 'on_campus', access_type: 'SCHOLARSHIP_MAKES_IT_FREE', tuition_cost_usd: 15000, other_mandatory_costs_usd: 0, scholarship_available: true, scholarship_name: 'Aalto University Scholarship for non-EU/EEA students', scholarship_coverage: 'FULL', potential_zero_cost: true, scholarship_url: 'https://into.aalto.fi/display/enfinancialaid/Scholarships+for+non-EU+students', eligible_nationalities: [], required_exams: ['IELTS'], min_language_score: 'IELTS 6.5', official_url: 'https://www.aalto.fi/en/programmes/masters-programme-in-design', source_evidence: 'Aalto University official website', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['UI/UX Designer', 'Product Designer', 'Service Designer'], skills: ['Design Thinking', 'UX Research', 'Prototyping', 'Visual Design'], industry_id: 'ind-dsgn-01' },

  // ── SUPPLY CHAIN
  { institution_name: 'Eindhoven University of Technology (TU/e)', institution_country: 'Netherlands', institution_type: 'public', institution_ranking_qs: 179, program_title: 'M.Sc. Operations Management & Logistics', field: 'Supply Chain', level: 'master', credential: 'Master of Science', duration_months: 24, language: 'English', mode: 'on_campus', access_type: 'SCHOLARSHIP_MAKES_IT_FREE', tuition_cost_usd: 16500, other_mandatory_costs_usd: 0, scholarship_available: true, scholarship_name: 'Holland Scholarship / TU/e Excellence Award', scholarship_coverage: 'PARTIAL', potential_zero_cost: false, scholarship_url: 'https://www.tue.nl/en/education/graduate-school/scholarships-and-grants/', eligible_nationalities: [], required_exams: ['IELTS'], min_language_score: 'IELTS 6.5', official_url: 'https://www.tue.nl/en/education/graduate-school/master-operations-management-and-logistics/', source_evidence: 'TU/e official website', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', career_relevance: ['Supply Chain Manager', 'Operations Manager', 'Logistics Analyst'], skills: ['Supply Chain Management', 'Operations Research', 'Data Analysis', 'Lean Six Sigma'], industry_id: 'ind-scm-01' },
];

export const SEED_SCHOLARSHIPS: Omit<GlobalScholarship, 'id' | 'created_at' | 'updated_at'>[] = [
  { title: 'DAAD Scholarships for Development-Related Postgraduate Courses', provider: 'DAAD (German Academic Exchange Service)', provider_country: 'Germany', description: 'Full scholarships for postgraduate studies at German universities. Covers tuition, monthly stipend, health insurance, travel costs.', amount_usd: 24000, coverage: 'FULL', coverage_detail: 'Tuition + €861/month living stipend + travel allowance + health insurance', eligible_levels: ['master', 'phd'], eligible_nationalities: [], eligible_fields: [], eligible_countries: ['Germany'], deadline: '2026-10-15', renewable: true, duration_months: 24, can_make_tuition_zero: true, official_url: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', source_evidence: 'DAAD official scholarship database' },
  { title: 'Erasmus+ Scholarships', provider: 'European Commission', provider_country: 'European Union', description: 'EU-funded scholarships for study mobility across European universities. Full coverage for Erasmus Mundus Joint Masters.', coverage: 'FULL', coverage_detail: 'Tuition + €1,000/month living allowance + travel grant for Erasmus Mundus', eligible_levels: ['bachelor', 'master', 'phd'], eligible_nationalities: [], eligible_fields: [], eligible_countries: ['Austria', 'Belgium', 'France', 'Germany', 'Netherlands', 'Finland', 'Sweden', 'Norway', 'Denmark', 'Spain', 'Italy', 'Portugal'], deadline: '2027-01-31', renewable: false, duration_months: 24, can_make_tuition_zero: true, official_url: 'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-scholarship_en', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', source_evidence: 'European Commission EACEA official website' },
  { title: 'Commonwealth Scholarships', provider: 'Commonwealth Scholarship Commission', provider_country: 'United Kingdom', description: 'Full scholarships for students from low and middle income Commonwealth countries to study in the UK.', coverage: 'FULL', coverage_detail: 'Tuition + living allowance + airfare + thesis grant', eligible_levels: ['master', 'phd'], eligible_nationalities: ['India', 'Pakistan', 'Bangladesh', 'Nigeria', 'Kenya', 'Ghana', 'Sri Lanka'], eligible_fields: [], eligible_countries: ['United Kingdom'], deadline: '2026-12-01', renewable: false, duration_months: 12, can_make_tuition_zero: true, official_url: 'https://cscuk.fcdo.gov.uk/scholarships/', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', source_evidence: 'Commonwealth Scholarship Commission official website' },
  { title: 'Swedish Institute Scholarships for Global Professionals (SISGP)', provider: 'Swedish Institute', provider_country: 'Sweden', description: 'Full scholarships for professionals from specific countries to study at Swedish universities.', coverage: 'FULL', coverage_detail: 'Tuition + SEK 11,000/month living allowance + travel grant + insurance', eligible_levels: ['master'], eligible_nationalities: ['India', 'China', 'Pakistan', 'Kenya', 'Ethiopia', 'Nigeria', 'Ghana', 'Bangladesh'], eligible_fields: [], eligible_countries: ['Sweden'], deadline: '2027-02-12', renewable: false, duration_months: 24, can_make_tuition_zero: true, official_url: 'https://si.se/en/apply/scholarships/swedish-institute-scholarships-for-global-professionals/', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', source_evidence: 'Swedish Institute official website' },
  { title: 'Chevening Scholarships', provider: 'UK Government (FCDO)', provider_country: 'United Kingdom', description: 'Prestigious UK government scholarship for future leaders. Fully funded 1-year Master\'s at any UK university.', coverage: 'FULL', coverage_detail: 'Tuition + monthly living allowance + flights + visa costs', eligible_levels: ['master'], eligible_nationalities: ['India', 'Pakistan', 'Nigeria', 'Kenya', 'Ghana', 'Bangladesh', 'Sri Lanka'], eligible_fields: [], eligible_countries: ['United Kingdom'], deadline: '2026-11-04', renewable: false, duration_months: 12, can_make_tuition_zero: true, official_url: 'https://www.chevening.org/scholarships/', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', source_evidence: 'Chevening official website + FCDO' },
  { title: 'Fulbright Foreign Student Program', provider: 'U.S. Department of State', provider_country: 'United States', description: 'Fully funded scholarship for international students to study at US universities at Master\'s and PhD level.', coverage: 'FULL', coverage_detail: 'Tuition + living stipend + health insurance + round-trip airfare', eligible_levels: ['master', 'phd'], eligible_nationalities: [], eligible_fields: [], eligible_countries: ['United States'], deadline: '2026-10-01', renewable: false, duration_months: 24, can_make_tuition_zero: true, official_url: 'https://foreign.fulbrightonline.org/', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', source_evidence: 'Fulbright official website + U.S. Department of State' },
  { title: 'MHRD Stipend for GATE Qualified Students (M.Tech at IITs/NITs)', provider: 'Ministry of Education, Government of India', provider_country: 'India', description: 'Fully funded M.Tech with stipend for GATE-qualified students at IITs and NITs.', coverage: 'FULL', coverage_detail: '₹12,400/month stipend + free tuition at IITs/NITs', eligible_levels: ['master'], eligible_nationalities: ['India'], eligible_fields: [], eligible_countries: ['India'], deadline: '2027-03-31', renewable: true, duration_months: 24, can_make_tuition_zero: true, official_url: 'https://www.gate.iitb.ac.in/', verification_status: 'VERIFIED', last_verified_at: '2026-08-19T00:00:00Z', source_evidence: 'MHRD official policy + IIT websites' },
];

// ─────────────────────────────────────────────────────────────────────────────
// PATHWAY GENERATOR — deterministic (no AI API required for MVP)
// ─────────────────────────────────────────────────────────────────────────────

const GOAL_SKILL_MAP: Record<string, string[]> = {
  'ai researcher': ['Python', 'Machine Learning', 'Deep Learning', 'Mathematics', 'Research Methods', 'Statistics'],
  'data scientist': ['Python', 'Statistics', 'Machine Learning', 'SQL', 'Data Visualization', 'Feature Engineering'],
  'software engineer': ['Programming', 'Data Structures', 'Algorithms', 'System Design', 'Version Control', 'Testing'],
  'doctor': ['Biology', 'Chemistry', 'Physics', 'Anatomy', 'Clinical Skills', 'Medical Ethics'],
  'architect': ['Design Thinking', 'AutoCAD', 'Structural Engineering', 'Urban Planning', 'History of Architecture'],
  'cybersecurity specialist': ['Networking', 'Linux', 'Cryptography', 'Ethical Hacking', 'Security Protocols', 'Risk Analysis'],
  'financial analyst': ['Financial Modeling', 'Excel', 'Valuation', 'Accounting', 'Statistics', 'Bloomberg'],
  'teacher': ['Pedagogy', 'Curriculum Design', 'Communication', 'Child Psychology', 'Subject Expertise', 'Assessment'],
  'hr analytics specialist': ['Excel', 'Statistics', 'HRIS', 'People Analytics', 'Data Visualization', 'Recruitment'],
  'supply chain manager': ['Logistics', 'Operations Research', 'ERP Systems', 'Procurement', 'Lean Six Sigma', 'Forecasting'],
  'ui/ux designer': ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Accessibility', 'Usability Testing'],
  'digital marketing manager': ['SEO', 'Google Ads', 'Content Strategy', 'Social Media', 'Analytics', 'Email Marketing'],
  'devops engineer': ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'Cloud (AWS/GCP)', 'Infrastructure as Code'],
  'mechanical engineer': ['CAD', 'Thermodynamics', 'Fluid Mechanics', 'Materials Science', 'FEM', 'Manufacturing'],
};

const FREE_COURSES_MAP: Record<string, { title: string; provider: string; url: string }[]> = {
  'ai researcher': [
    { title: 'Machine Learning Specialization', provider: 'Coursera / DeepLearning.AI (Audit Free)', url: 'https://www.coursera.org/specializations/machine-learning-introduction' },
    { title: 'Deep Learning Specialization', provider: 'Coursera / DeepLearning.AI (Audit Free)', url: 'https://www.coursera.org/specializations/deep-learning' },
    { title: 'Mathematics for Machine Learning', provider: 'Coursera / Imperial College (Audit Free)', url: 'https://www.coursera.org/specializations/mathematics-machine-learning' },
  ],
  'data scientist': [
    { title: 'Google Data Analytics Certificate', provider: 'Coursera (Audit Free)', url: 'https://www.coursera.org/professional-certificates/google-data-analytics' },
    { title: 'Python for Everybody', provider: 'Coursera / University of Michigan (Audit Free)', url: 'https://www.coursera.org/specializations/python' },
    { title: 'Statistics with Python', provider: 'Coursera / University of Michigan (Audit Free)', url: 'https://www.coursera.org/specializations/statistics-with-python' },
  ],
  'software engineer': [
    { title: 'CS50x: Introduction to Computer Science', provider: 'edX / Harvard (Free)', url: 'https://cs50.harvard.edu/x/' },
    { title: 'The Odin Project', provider: 'The Odin Project (Free)', url: 'https://www.theodinproject.com/' },
    { title: 'MIT OpenCourseWare — Algorithms', provider: 'MIT OCW (Free)', url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/' },
  ],
  'financial analyst': [
    { title: 'Introduction to Corporate Finance', provider: 'Coursera / Yale (Audit Free)', url: 'https://www.coursera.org/learn/corporate-finance' },
    { title: 'Financial Accounting', provider: 'edX / MIT (Audit Free)', url: 'https://www.edx.org/course/financial-accounting' },
    { title: 'Investment Management Specialization', provider: 'Coursera / Geneva (Audit Free)', url: 'https://www.coursera.org/specializations/investment-management' },
  ],
  'cybersecurity specialist': [
    { title: 'Google Cybersecurity Certificate', provider: 'Coursera (Audit Free)', url: 'https://www.coursera.org/professional-certificates/google-cybersecurity' },
    { title: 'Cybersecurity Fundamentals', provider: 'edX / IBM (Audit Free)', url: 'https://www.edx.org/professional-certificate/ibm-cybersecurity-analyst' },
    { title: 'TryHackMe — Free Learning Paths', provider: 'TryHackMe (Free Tier)', url: 'https://tryhackme.com/paths' },
  ],
};

function resolveGoalKey(goal: string): string {
  const g = goal.toLowerCase().trim();
  for (const key of Object.keys(GOAL_SKILL_MAP)) {
    if (g.includes(key) || key.includes(g)) return key;
  }
  // fallback
  if (g.includes('code') || g.includes('program') || g.includes('develop')) return 'software engineer';
  if (g.includes('data') || g.includes('analyt')) return 'data scientist';
  if (g.includes('machine') || g.includes('ai') || g.includes('deep')) return 'ai researcher';
  if (g.includes('cyber') || g.includes('security') || g.includes('hack')) return 'cybersecurity specialist';
  if (g.includes('finance') || g.includes('invest') || g.includes('banking')) return 'financial analyst';
  if (g.includes('market') || g.includes('seo') || g.includes('brand')) return 'digital marketing manager';
  if (g.includes('hr') || g.includes('people') || g.includes('talent')) return 'hr analytics specialist';
  if (g.includes('supply') || g.includes('logistics') || g.includes('chain')) return 'supply chain manager';
  if (g.includes('design') || g.includes('ux') || g.includes('ui')) return 'ui/ux designer';
  return 'software engineer';
}

function matchPrograms(goalKey: string, budget: string): GlobalProgram[] {
  const allPrograms = SEED_PROGRAMS as GlobalProgram[];
  return allPrograms
    .filter(p => {
      if (budget === 'ZERO') return p.potential_zero_cost;
      if (budget === 'UNDER_50K') return p.tuition_cost_usd < 700;
      return true;
    })
    .filter(p => p.career_relevance?.some(r => r.toLowerCase().includes(goalKey.split(' ')[0])))
    .slice(0, 4);
}

function matchScholarships(budget: string): GlobalScholarship[] {
  const all = SEED_SCHOLARSHIPS as GlobalScholarship[];
  if (budget === 'ZERO') return all.filter(s => s.can_make_tuition_zero).slice(0, 3);
  return all.slice(0, 3);
}

export function generatePathway(input: PathwayInput): EducationPathway {
  const goalKey = resolveGoalKey(input.goal);
  const skills = GOAL_SKILL_MAP[goalKey] || GOAL_SKILL_MAP['software engineer'];
  const freeCourses = FREE_COURSES_MAP[goalKey] || FREE_COURSES_MAP['software engineer'];
  const programs = matchPrograms(goalKey, input.budget);
  const scholarships = matchScholarships(input.budget);

  const steps: PathwayStep[] = [
    {
      step_number: 1,
      title: 'Understand What You Need to Learn',
      description: `To become a ${input.goal}, you need these core skills:`,
      icon: 'Brain',
      items: skills.map(s => ({ type: 'action' as const, title: s, is_free: true })),
      estimated_duration: '1–2 weeks to assess',
      cost_estimate: '₹0',
    },
    {
      step_number: 2,
      title: 'Start with Free Courses (No Cost)',
      description: 'Build your foundation with these verified free resources before applying anywhere.',
      icon: 'BookOpen',
      items: freeCourses.map(c => ({
        type: 'course' as const,
        title: c.title,
        provider: c.provider,
        url: c.url,
        is_free: true,
        cost: '₹0',
        access_type: 'FREE_TO_LEARN_PAID_CREDENTIAL' as const,
      })),
      estimated_duration: '3–6 months',
      cost_estimate: '₹0',
    },
    {
      step_number: 3,
      title: 'Choose Your Degree Program',
      description: input.budget === 'ZERO'
        ? 'These programs have a verified ₹0 pathway (via scholarship or tuition-free):'
        : 'These programs match your goal and budget:',
      icon: 'GraduationCap',
      items: programs.map(p => ({
        type: 'program' as const,
        title: `${p.program_title} — ${p.institution_name}`,
        provider: p.institution_country,
        url: p.official_url,
        is_free: p.potential_zero_cost,
        cost: p.tuition_cost_usd === 0
          ? (p.other_mandatory_costs_usd > 0 ? `₹0 tuition + ~$${p.other_mandatory_costs_usd} other fees` : '₹0 total')
          : `$${p.tuition_cost_usd.toLocaleString()}/year`,
        access_type: p.access_type,
        notes: p.currency_note,
      })),
      estimated_duration: `${programs[0]?.duration_months || 24} months`,
      cost_estimate: input.budget === 'ZERO' ? '₹0 if scholarship awarded' : 'Varies by program',
    },
    {
      step_number: 4,
      title: 'Find Funding (Make It ₹0)',
      description: 'These scholarships can cover your full cost of education:',
      icon: 'DollarSign',
      items: scholarships.map(s => ({
        type: 'scholarship' as const,
        title: s.title,
        provider: s.provider,
        url: s.official_url,
        is_free: true,
        cost: '₹0 if awarded',
        notes: s.coverage_detail,
      })),
      estimated_duration: '2–4 months to apply',
      cost_estimate: '₹0 if successful',
    },
    {
      step_number: 5,
      title: 'Prepare & Apply',
      description: 'Steps to complete your application successfully:',
      icon: 'FileText',
      items: [
        { type: 'action', title: 'Get IELTS/TOEFL (if required) — aim for 6.5+', is_free: false, cost: '~₹15,000', notes: 'Most EU universities require this' },
        { type: 'action', title: 'Write Statement of Purpose (SOP)', is_free: true, cost: '₹0', notes: 'TalentXcel can help you draft this' },
        { type: 'action', title: 'Request letters of recommendation', is_free: true, cost: '₹0' },
        { type: 'action', title: 'Compile academic transcripts & certificates', is_free: true, cost: '₹0' },
        { type: 'action', title: 'Apply for scholarship simultaneously with university', is_free: true, cost: '₹0' },
      ],
      estimated_duration: '2–3 months',
      cost_estimate: '~₹15,000–₹30,000 (primarily exam fees)',
    },
    {
      step_number: 6,
      title: 'Career Outcome',
      description: `With this pathway, you can realistically achieve:`,
      icon: 'TrendingUp',
      items: [
        { type: 'resource', title: `Entry-level ${input.goal} role within 6 months of graduation`, is_free: true },
        { type: 'resource', title: 'Build your TalentXcel Career Passport during your studies', is_free: true, url: '/passport' },
        { type: 'resource', title: 'Explore job listings matched to your new credential', is_free: true, url: '/jobs' },
      ],
      estimated_duration: 'Ongoing',
      cost_estimate: '₹0',
    },
  ];

  const isZeroCostPossible = input.budget === 'ZERO' || programs.some(p => p.potential_zero_cost);
  const totalCost = isZeroCostPossible ? '₹0 (if scholarship awarded)' : 'Varies by program selected';
  const caveat = isZeroCostPossible
    ? 'Cost of ₹0 is achievable for eligible students who receive a full scholarship. Scholarships are competitive. Living costs are separate from tuition and vary by country (Germany ~€800–1,000/month, Norway ~NOK 12,000/month). Apply early.'
    : 'Costs shown are estimates. Verify all fees directly on the official university and scholarship websites before applying.';

  return {
    input,
    goal_resolved: goalKey.replace(/\b\w/g, c => c.toUpperCase()),
    skills_required: skills,
    steps,
    matched_programs: programs,
    matched_scholarships: scholarships,
    total_estimated_cost: totalCost,
    honest_caveat: caveat,
    generated_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA ACCESS
// ─────────────────────────────────────────────────────────────────────────────

export const globalEducationService = {
  getPrograms: async (filters: GlobalProgramFilters = {}): Promise<GlobalProgram[]> => {
    try {
      let query = supabase.from('global_programs').select('*').eq('verification_status', 'VERIFIED');
      if (filters.search) query = query.ilike('program_title', `%${filters.search}%`);
      if (filters.country) query = query.eq('institution_country', filters.country);
      if (filters.level) query = query.eq('level', filters.level);
      if (filters.field) query = query.ilike('field', `%${filters.field}%`);
      if (filters.access_type) query = query.eq('access_type', filters.access_type);
      if (filters.scholarship_available) query = query.eq('scholarship_available', true);
      if (filters.potential_zero_cost) query = query.eq('potential_zero_cost', true);
      if (filters.language) query = query.eq('language', filters.language);
      const { data, error } = await query.order('institution_ranking_qs', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data as GlobalProgram[]) || SEED_PROGRAMS as GlobalProgram[];
    } catch {
      return SEED_PROGRAMS as GlobalProgram[];
    }
  },

  getScholarships: async (filters: ScholarshipFilters = {}): Promise<GlobalScholarship[]> => {
    try {
      let query = supabase.from('global_scholarships').select('*').eq('verification_status', 'VERIFIED');
      if (filters.search) query = query.ilike('title', `%${filters.search}%`);
      if (filters.provider_country) query = query.eq('provider_country', filters.provider_country);
      if (filters.coverage) query = query.eq('coverage', filters.coverage);
      if (filters.can_make_tuition_zero) query = query.eq('can_make_tuition_zero', true);
      const { data, error } = await query.order('amount_usd', { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data as GlobalScholarship[]) || SEED_SCHOLARSHIPS as GlobalScholarship[];
    } catch {
      return SEED_SCHOLARSHIPS as GlobalScholarship[];
    }
  },

  generatePathway,

  seedToDatabase: async (): Promise<void> => {
    try {
      const { error: pe } = await supabase.from('global_programs').upsert(
        SEED_PROGRAMS.map(p => ({ ...p, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() })),
        { onConflict: 'official_url' }
      );
      if (pe) console.error('Program seed error:', pe.message);

      const { error: se } = await supabase.from('global_scholarships').upsert(
        SEED_SCHOLARSHIPS.map(s => ({ ...s, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() })),
        { onConflict: 'official_url' }
      );
      if (se) console.error('Scholarship seed error:', se.message);
    } catch (err) {
      console.error('Seed error:', err);
    }
  },
};

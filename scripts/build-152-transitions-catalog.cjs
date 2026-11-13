// scripts/build-152-transitions-catalog.cjs
// Script to expand Career Pathways Catalog to 152 verified multi-industry transitions
// Covering all 16 Global Industries, 4 Seniority Levels, and Tier-1/Tier-2/Global Geographies

const fs = require('fs');
const path = require('path');

const targetFilePath = path.join(__dirname, '../src/data/careerPathwaysCatalog.ts');
let existingContent = fs.readFileSync(targetFilePath, 'utf8');

// The new transitions across all 16 industries
const newTransitions = [
  // ── HR, People Ops & Talent Management ──
  {
    id: 'hr_exec_to_talent_acq_lead',
    industry: 'Talent Acquisition & Sourcing',
    industryCategory: 'HR, People Ops & Talent',
    currentRole: 'HR Executive',
    targetRole: 'Talent Acquisition Lead',
    timeEstimateMonths: 3.5,
    currentAvgCtcLakhs: 4.2,
    targetAvgCtcLakhs: 12.0,
    difficulty: 'Moderate',
    experienceLevel: 'mid',
    topLocations: ['Bengaluru', 'Mumbai', 'Hyderabad', 'Pune'],
    coreSkillGaps: ['Executive Technical Sourcing', 'ATS Automation & Pipeline Metrics', 'Candidate Experience Engineering', 'Employer Value Proposition (EVP)'],
    phases: [
      {
        title: 'Phase 1: Advanced Sourcing & Boolean Mastery',
        weeks: 'Weeks 1–4',
        focus: 'X-Ray search techniques, GitHub/LinkedIn talent mapping, ATS workflow optimization.',
        milestones: ['Build outbound talent pipelines for 10 niche senior roles', 'Implement automated screening workflows reducing time-to-first-interview by 40%']
      },
      {
        title: 'Phase 2: Data-Driven Recruitment Metrics',
        weeks: 'Weeks 5–9',
        focus: 'Cost-per-hire, offer-to-join ratio, diversity sourcing diagnostics, hiring manager SLAs.',
        milestones: ['Present talent market availability landscape for critical quarterly hiring plan', 'Establish structured candidate rubric and structured interview loops']
      },
      {
        title: 'Phase 3: Lead TA Positioning & Recruiter OS',
        weeks: 'Weeks 10–14',
        focus: 'Employer branding campaigns, talent pipelining, executive dispatch.',
        milestones: ['Complete 5 simulated recruiter leadership behavioral rounds', 'Connect with 20+ scaling tech startups hiring TA Leads on JobMatch OS']
      }
    ]
  },
  {
    id: 'hr_generalist_to_comp_benefits',
    industry: 'Total Rewards & Comp Analytics',
    industryCategory: 'HR, People Ops & Talent',
    currentRole: 'HR Generalist',
    targetRole: 'Comp & Benefits (Total Rewards) Lead',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 6.0,
    targetAvgCtcLakhs: 16.5,
    difficulty: 'Demanding',
    experienceLevel: 'mid',
    topLocations: ['Gurugram', 'Bengaluru', 'Mumbai', 'Dubai / UAE'],
    coreSkillGaps: ['Mercer / Aon Radford Benchmarking', 'ESOP & LTI Plan Modeling', 'Executive Compensation Structuring', 'Benefits Cost Optimization'],
    phases: [
      {
        title: 'Phase 1: Salary Survey Analysis & Grading Matrices',
        weeks: 'Weeks 1–5',
        focus: 'Job evaluation models (Hay Group), salary band creation, compa-ratio diagnostics.',
        milestones: ['Design comprehensive 8-level salary grading band for 500-person organization', 'Conduct market gap analysis against Aon compensation surveys']
      },
      {
        title: 'Phase 2: Long-Term Incentives & ESOP Governance',
        weeks: 'Weeks 6–11',
        focus: 'Vesting schedules, cap table equity modeling, phantom stock, tax implications.',
        milestones: ['Model multi-tier ESOP policy with 4-year vesting and liquidity event clauses', 'Present corporate health insurance benefits cost-benefit optimization']
      },
      {
        title: 'Phase 3: Total Rewards Strategy & Board Defense',
        weeks: 'Weeks 12–16',
        focus: 'Remuneration committee preparation, executive retention frameworks.',
        milestones: ['Draft board remuneration proposal for senior leadership talent retention', 'Target Top-Tier MNC Total Rewards openings']
      }
    ]
  },
  {
    id: 'people_ops_to_chief_people_officer',
    industry: 'Executive HR Leadership',
    industryCategory: 'HR, People Ops & Talent',
    currentRole: 'People Operations Lead',
    targetRole: 'Chief People Officer (CPO)',
    timeEstimateMonths: 5,
    currentAvgCtcLakhs: 14.0,
    targetAvgCtcLakhs: 55.0,
    difficulty: 'High Impact',
    experienceLevel: 'executive',
    topLocations: ['Bengaluru', 'Mumbai', 'Dubai / UAE', 'London / Remote'],
    coreSkillGaps: ['Board Governance & RemCo Advisory', 'Enterprise M&A Cultural Integration', 'Organizational Design & Headcount Modeling', 'Global Distributed Workforce Policy'],
    phases: [
      {
        title: 'Phase 1: Strategic Workforce Architecture',
        weeks: 'Weeks 1–6',
        focus: 'Macro org structuring, span-of-control optimization, headcount burn forecasting.',
        milestones: ['Deliver 3-year enterprise headcount & talent cost forecast to Executive Committee', 'Author cross-border global employment contract framework']
      },
      {
        title: 'Phase 2: Executive Culture & M&A Due Diligence',
        weeks: 'Weeks 7–14',
        focus: 'Post-merger people integration, executive compensation, leadership succession pipelines.',
        milestones: ['Lead simulated M&A HR due diligence audit covering 350-employee acquisition', 'Deploy comprehensive 9-box executive succession matrix']
      },
      {
        title: 'Phase 3: C-Suite Interview Readiness & Board Advisory',
        weeks: 'Weeks 15–20',
        focus: 'Investor pitching, founder alignment, CPO priority recruiter search.',
        milestones: ['Complete board-level presentation simulation on culture vs EBITDA delivery', 'Direct outreach to venture & private equity partner talent desks']
      }
    ]
  },
  {
    id: 'technical_recruiter_to_head_talent',
    industry: 'Strategic Talent Sourcing',
    industryCategory: 'HR, People Ops & Talent',
    currentRole: 'Technical Recruiter',
    targetRole: 'Head of Global Talent Sourcing',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 5.5,
    targetAvgCtcLakhs: 24.0,
    difficulty: 'Demanding',
    experienceLevel: 'senior',
    topLocations: ['Hyderabad', 'Bengaluru', 'Noida', 'Singapore'],
    coreSkillGaps: ['Global Sourcing Operations', 'Recruitment Tech Stack Architecture', 'Agency Vendor Governance', 'Executive Search Methodology'],
    phases: [
      {
        title: 'Phase 1: Tech Stack Optimization',
        weeks: 'Weeks 1–5',
        focus: 'AI matching tools, outbound CRM systems, ATS integrations.',
        milestones: ['Evaluate and implement modern AI sourcing platforms', 'Establish agency cost containment and preferred partner tiers']
      },
      {
        title: 'Phase 2: Global Sourcing Command',
        weeks: 'Weeks 6–11',
        focus: 'Offshore development center (ODC) staffing, GCC expansion talent mapping.',
        milestones: ['Build hiring roadmap for 150-engineer Global Capability Center (GCC)', 'Reduce blended agency dependency from 40% to 8%']
      },
      {
        title: 'Phase 3: Leadership Placement Loops',
        weeks: 'Weeks 12–16',
        focus: 'VP-level tech executive closures, recruiter performance management.',
        milestones: ['Close 3 director-level engineering positions directly', 'Activate Head of Talent search loop across high-growth startups']
      }
    ]
  },
  {
    id: 'hr_analyst_to_people_analytics_lead',
    industry: 'People Analytics & Workforce Intelligence',
    industryCategory: 'HR, People Ops & Talent',
    currentRole: 'HR Data Analyst',
    targetRole: 'Lead People Analytics Architect',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 6.5,
    targetAvgCtcLakhs: 22.0,
    difficulty: 'Demanding',
    experienceLevel: 'senior',
    topLocations: ['Bengaluru', 'Mumbai', 'Gurugram', 'Remote'],
    coreSkillGaps: ['Predictive Attrition Modeling', 'Visier & PowerBI HR Dashboards', 'Workday / SuccessFactors Data Pipelines', 'DEI & Pay Equity Statistical Audits'],
    phases: [
      {
        title: 'Phase 1: Predictive HR Data Pipelines',
        weeks: 'Weeks 1–5',
        focus: 'Python, SQL, survival analysis, early attrition risk predictors.',
        milestones: ['Deploy machine learning model predicting 90-day employee departure probability', 'Automate monthly executive talent dashboard in PowerBI']
      },
      {
        title: 'Phase 2: Pay Equity & Org Network Analysis (ONA)',
        weeks: 'Weeks 6–11',
        focus: 'Gender & level pay parity regressions, Slack/Teams collaboration network graph analysis.',
        milestones: ['Complete statistically defensible global pay parity audit', 'Map informal influence networks to identify cross-departmental bottlenecks']
      },
      {
        title: 'Phase 3: Executive Strategic Workforce Planning',
        weeks: 'Weeks 12–16',
        focus: 'Linking people data to EBITDA and enterprise customer retention metrics.',
        milestones: ['Deliver ROI study linking employee tenure to sales quota attainment', 'Apply to People Analytics Lead roles across Tier-1 GCCs']
      }
    ]
  },

  // ── Sales, GTM & Revenue Leadership ──
  {
    id: 'bdr_to_sales_enablement',
    industry: 'Sales Enablement & Revenue Operations',
    industryCategory: 'Sales & Enterprise BD',
    currentRole: 'Inside Sales Specialist',
    targetRole: 'Head of Global Sales Enablement',
    timeEstimateMonths: 3.5,
    currentAvgCtcLakhs: 4.5,
    targetAvgCtcLakhs: 17.0,
    difficulty: 'Moderate',
    experienceLevel: 'mid',
    topLocations: ['Bengaluru', 'Delhi-NCR', 'Pune', 'Singapore'],
    coreSkillGaps: ['MEDDPICC & Challenger Sales Methodologies', 'LMS Sales Certification Architecture', 'GTM Playbook Authoring', 'Win/Loss Forensic Diagnostics'],
    phases: [
      {
        title: 'Phase 1: Sales Playbook & Onboarding Frameworks',
        weeks: 'Weeks 1–4',
        focus: 'Rep ramp-time acceleration, call analysis (Gong), pitch deck auditing.',
        milestones: ['Author 40-page enterprise sales playbook for core product lines', 'Reduce new rep ramp time from 90 days to 45 days']
      },
      {
        title: 'Phase 2: Deal Inspection & Coaching Programs',
        weeks: 'Weeks 5–9',
        focus: 'MEDDPICC inspection rubrics, objection handling bootcamps, competitive battlecards.',
        milestones: ['Deploy interactive objection-handling simulator for 20 account executives', 'Publish 5 competitive battlecards increasing deal win rates by 18%']
      },
      {
        title: 'Phase 3: Global Revenue Enablement Leadership',
        weeks: 'Weeks 10–14',
        focus: 'Sales enablement tech stack, executive stakeholder reporting.',
        milestones: ['Present enablement ROI metrics to Chief Commercial Officer', 'Target enterprise enablement openings on JobMatch OS']
      }
    ]
  },
  {
    id: 'channel_sales_to_alliances_head',
    industry: 'Strategic Alliances & Channel Ecosystems',
    industryCategory: 'Sales & Enterprise BD',
    currentRole: 'Channel Partner Executive',
    targetRole: 'Director of Strategic Alliances & Ecosystem',
    timeEstimateMonths: 4.5,
    currentAvgCtcLakhs: 8.0,
    targetAvgCtcLakhs: 29.0,
    difficulty: 'Demanding',
    experienceLevel: 'senior',
    topLocations: ['Mumbai', 'Bengaluru', 'Gurugram', 'Dubai / UAE'],
    coreSkillGaps: ['Hyperscaler Co-Sell Models (AWS, Azure, Google Cloud)', 'System Integrator Partnerships (TCS, Infosys, Wipro)', 'Joint GTM Revenue Sharing Architecture', 'Ecosystem Partner Contracting'],
    phases: [
      {
        title: 'Phase 1: Hyperscaler & Cloud Marketplace Integration',
        weeks: 'Weeks 1–6',
        focus: 'AWS ISV Accelerate, Azure IP Co-Sell, marketplace transaction mechanics.',
        milestones: ['List enterprise solution on AWS Marketplace with private offer functionality', 'Achieve AWS / Azure co-sell ready tier status']
      },
      {
        title: 'Phase 2: Global System Integrator (GSI) Practice Building',
        weeks: 'Weeks 7–12',
        focus: 'Incentive structures, center-of-excellence setup, joint pipeline creation.',
        milestones: ['Establish joint practice with Tier-1 GSI generating ₹15Cr qualified pipeline', 'Formulate partner tiering rubric with margin rebates and MDF budgets']
      },
      {
        title: 'Phase 3: Ecosystem Revenue Governance',
        weeks: 'Weeks 13–18',
        focus: 'Board pipeline reporting, partner conflict resolution, alliance leadership.',
        milestones: ['Deliver partner-influenced ARR model accounting for 35% of total bookings', 'Execute executive outreach to Global Alliances Director roles']
      }
    ]
  },
  {
    id: 'retail_store_mgr_to_national_retail_head',
    industry: 'Omnichannel Retail & Store Operations',
    industryCategory: 'Sales & Enterprise BD',
    currentRole: 'Retail Store Manager',
    targetRole: 'National Retail Operations Head',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 5.0,
    targetAvgCtcLakhs: 24.0,
    difficulty: 'Demanding',
    experienceLevel: 'senior',
    topLocations: ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Ahmedabad'],
    coreSkillGaps: ['Multi-Store P&L Management', 'Omnichannel Inventory Synchronization', 'Visual Merchandising Standards', 'Retail Shrinkage & Loss Prevention Controls'],
    phases: [
      {
        title: 'Phase 1: Cluster & Regional P&L Governance',
        weeks: 'Weeks 1–5',
        focus: 'Revenue per sq.ft, footfall-to-conversion rates, staff scheduling optimization.',
        milestones: ['Audit 12 store P&Ls identifying ₹80L in inventory holding cost savings', 'Implement dynamic staffing roster aligned with hourly footfall analytics']
      },
      {
        title: 'Phase 2: Omnichannel Fulfillment & BOPIS Operations',
        weeks: 'Weeks 6–11',
        focus: 'Buy-Online-Pickup-In-Store, store-level rapid delivery, POS digital migration.',
        milestones: ['Roll out ship-from-store protocol across 25 regional outlets', 'Reduce inventory shrinkage to under 0.8% through RFID and audit protocols']
      },
      {
        title: 'Phase 3: National Footprint Expansion & Strategy',
        weeks: 'Weeks 12–16',
        focus: 'New store rollout feasibility studies, franchise operations agreements.',
        milestones: ['Develop 50-store expansion model including capex and payback calculations', 'Interview for VP/Head of Retail Operations with national brands']
      }
    ]
  },
  {
    id: 'sales_engineer_to_vp_solutions',
    industry: 'Enterprise Solutions Architecture & Pre-Sales',
    industryCategory: 'Sales & Enterprise BD',
    currentRole: 'Pre-Sales Solutions Engineer',
    targetRole: 'VP of Global Solutions Consulting',
    timeEstimateMonths: 5,
    currentAvgCtcLakhs: 12.0,
    targetAvgCtcLakhs: 38.0,
    difficulty: 'High Impact',
    experienceLevel: 'executive',
    topLocations: ['Bengaluru', 'Hyderabad', 'Dubai / UAE', 'US / Remote'],
    coreSkillGaps: ['Multi-Million Dollar Deal RFP Architecture', 'Executive C-Suite Technical Defense', 'Global Pre-Sales Team Scaling', 'POC-to-Production Conversion Engineering'],
    phases: [
      {
        title: 'Phase 1: High-Stakes RFP & Security Diligence Architecture',
        weeks: 'Weeks 1–6',
        focus: 'SOC2/ISO compliance answers, enterprise technical objection elimination, rapid POCs.',
        milestones: ['Lead technical winning bid on ₹20Cr government or banking RFP', 'Standardize cloud demo environments cutting spin-up time by 80%']
      },
      {
        title: 'Phase 2: Commercial & Technical Alignment',
        weeks: 'Weeks 7–14',
        focus: 'Value engineering, business case ROI calculations for Fortune 500 CIOs.',
        milestones: ['Build quantifiable business value model demonstrating 3.2x ROI for enterprise client', 'Manage global pre-sales coverage matrix across APAC, EMEA, and Americas']
      },
      {
        title: 'Phase 3: Executive Solutions Leadership Positioning',
        weeks: 'Weeks 15–20',
        focus: 'VP-level executive interview simulations, global customer advisory board setup.',
        milestones: ['Deliver keynote-grade technical vision pitch to mock enterprise board', 'Direct dispatch to high-growth SaaS enterprise solutions mandates']
      }
    ]
  },

  // ── Corporate Finance, CA, Audit & Advisory ──
  {
    id: 'junior_accountant_to_senior_fpa',
    industry: 'Corporate Financial Planning & Analysis',
    industryCategory: 'Corporate Finance, CA & Audit',
    currentRole: 'Junior Accountant',
    targetRole: 'Senior FP&A Analyst',
    timeEstimateMonths: 3.5,
    currentAvgCtcLakhs: 3.5,
    targetAvgCtcLakhs: 10.5,
    difficulty: 'Moderate',
    experienceLevel: 'fresher',
    topLocations: ['Gurugram', 'Bengaluru', 'Mumbai', 'Pune', 'Indore'],
    coreSkillGaps: ['Three-Statement Financial Modeling', 'Variance & Rolling Forecast Analysis', 'Anaplan / Hyperion / PowerBI Integration', 'EBITDA Bridge Formulation'],
    phases: [
      {
        title: 'Phase 1: Dynamic 3-Statement Modeling in Excel',
        weeks: 'Weeks 1–4',
        focus: 'Linking P&L, balance sheet, and cash flow with dynamic scenario switches.',
        milestones: ['Build error-free 3-statement integrated financial model from scratch', 'Automate monthly variance analysis reporting across 5 business units']
      },
      {
        title: 'Phase 2: Budgeting, Rolling Forecasts & KPI Dashboards',
        weeks: 'Weeks 5–9',
        focus: 'Opex/Capex planning, departmental budget sign-offs, revenue driver modeling.',
        milestones: ['Author annual opex budget model for 300-employee division', 'Build dynamic EBITDA bridge analyzing volume, price, and mix effects']
      },
      {
        title: 'Phase 3: Business Partnering & Interview Prep',
        weeks: 'Weeks 10–14',
        focus: 'Storytelling with financial data, executive presentation design.',
        milestones: ['Deliver mock business unit performance presentation to CFO', 'Apply to Tier-1 MNC and high-growth startup FP&A roles']
      }
    ]
  },
  {
    id: 'stat_auditor_to_internal_controls_head',
    industry: 'Internal Financial Controls & Sox Advisory',
    industryCategory: 'Corporate Finance, CA & Audit',
    currentRole: 'Statutory Auditor / CA',
    targetRole: 'Head of Internal Controls & SOX Compliance',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 9.0,
    targetAvgCtcLakhs: 24.0,
    difficulty: 'Demanding',
    experienceLevel: 'senior',
    topLocations: ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Dubai / UAE'],
    coreSkillGaps: ['Internal Financial Controls (IFC) Frameworks', 'COSO 2013 Governance Standards', 'Risk and Control Matrices (RCM)', 'Fraud Risk Assessment & Forensic Auditing'],
    phases: [
      {
        title: 'Phase 1: Enterprise Risk & Control Matrix Engineering',
        weeks: 'Weeks 1–5',
        focus: 'Process flowcharts, key controls identification, walkthrough testing.',
        milestones: ['Author end-to-end Risk & Control Matrix for Order-to-Cash and Procure-to-Pay', 'Design remediation plan for 15 identified control deficiencies']
      },
      {
        title: 'Phase 2: IT General Controls (ITGC) & Automated Testing',
        weeks: 'Weeks 6–11',
        focus: 'Access controls, change management controls, SOD (Segregation of Duties) analytics.',
        milestones: ['Audit ERP segregation of duties resolving high-risk user privilege conflicts', 'Implement automated continuous controls monitoring scripts']
      },
      {
        title: 'Phase 3: Audit Committee Presentation & Strategic Leadership',
        weeks: 'Weeks 12–16',
        focus: 'Audit committee reporting, managing external Big 4 SOX auditors.',
        milestones: ['Draft comprehensive internal controls annual report for Board Audit Committee', 'Connect with leading enterprise recruiters hiring Governance Heads']
      }
    ]
  },
  {
    id: 'private_wealth_to_family_office_cio',
    industry: 'Ultra-High-Net-Worth Family Office & Asset Management',
    industryCategory: 'Corporate Finance, CA & Audit',
    currentRole: 'Wealth Relationship Manager',
    targetRole: 'Family Office Chief Investment Officer (CIO)',
    timeEstimateMonths: 5,
    currentAvgCtcLakhs: 8.0,
    targetAvgCtcLakhs: 50.0,
    difficulty: 'High Impact',
    experienceLevel: 'executive',
    topLocations: ['Mumbai', 'Delhi-NCR', 'Dubai / UAE', 'Singapore'],
    coreSkillGaps: ['Multi-Asset Class Portfolio Allocation', 'Private Equity & Venture Co-Investment Diligence', 'Offshore Trust & Succession Structuring', 'Direct Real Estate & Alternative Investments'],
    phases: [
      {
        title: 'Phase 1: Institutional Asset Allocation & Risk Budgeting',
        weeks: 'Weeks 1–6',
        focus: 'Modern portfolio theory, private credit underwriting, currency hedging strategies.',
        milestones: ['Design ₹250Cr multi-asset portfolio with public equities, private debt, and gold hedge', 'Establish quantitative drawdown protection framework']
      },
      {
        title: 'Phase 2: Direct Deal Sourcing & Private Equity Underwriting',
        weeks: 'Weeks 7–14',
        focus: 'Term sheet negotiation, minority investor rights, cap table liquidation waterfall.',
        milestones: ['Underwrite direct Series-B co-investment opportunity and author investment memo', 'Negotiate side-letter agreements and information rights']
      },
      {
        title: 'Phase 3: Cross-Border Tax & Succession Governance',
        weeks: 'Weeks 15–20',
        focus: 'DIFC / ADGM foundation setup, family constitution, wealth preservation.',
        milestones: ['Present comprehensive family governance charter to principal family office board', 'Target top-tier single and multi-family office leadership roles']
      }
    ]
  },

  // ── Healthcare, Pharmaceuticals & Life Sciences ──
  {
    id: 'medical_rep_to_product_manager',
    industry: 'Pharmaceutical Brand & Marketing Management',
    industryCategory: 'Healthcare, Pharma & Biotech',
    currentRole: 'Medical Representative',
    targetRole: 'Pharma Brand Product Manager (PMT)',
    timeEstimateMonths: 3.5,
    currentAvgCtcLakhs: 3.8,
    targetAvgCtcLakhs: 14.0,
    difficulty: 'Moderate',
    experienceLevel: 'mid',
    topLocations: ['Mumbai', 'Ahmedabad', 'Hyderabad', 'Bengaluru'],
    coreSkillGaps: ['Therapeutic Area Strategy & KOL Engagement', 'Pharma Brand Launch Playbooks', 'Doctor Detailing Storyboards & Visual Aids', 'Field Force Training & Prescription Audits (IMS/IQVIA)'],
    phases: [
      {
        title: 'Phase 1: IQVIA Data Diagnostics & Market Share Analysis',
        weeks: 'Weeks 1–4',
        focus: 'Prescription trends, secondary sales tracking, competitor therapeutic mapping.',
        milestones: ['Analyze IQVIA prescription dataset identifying under-penetrated specialty doctor segments', 'Develop scientific detailing story for flagship cardiovascular formulation']
      },
      {
        title: 'Phase 2: Omnichannel Healthcare Professional Engagement',
        weeks: 'Weeks 5–9',
        focus: 'Continuous medical education (CME) webinars, digital detailing apps, advisory boards.',
        milestones: ['Design national CME conference curriculum engaging 250 top key opinion leaders (KOLs)', 'Create digital field force training module improving message retention by 35%']
      },
      {
        title: 'Phase 3: New Product Launch & Brand P&L Mastery',
        weeks: 'Weeks 10–14',
        focus: 'P&L management, pricing strategies under DPCO, brand launch execution.',
        milestones: ['Formulate ₹12Cr new molecule launch strategy with 12-month ROI model', 'Target Brand Manager interviews with leading pharma MNCs on JobMatch OS']
      }
    ]
  },
  {
    id: 'healthcare_admin_to_hospital_coo',
    industry: 'Hospital Administration & Clinical Operations',
    industryCategory: 'Healthcare, Pharma & Biotech',
    currentRole: 'Hospital Operations Executive',
    targetRole: 'Hospital Chief Operating Officer (COO)',
    timeEstimateMonths: 5,
    currentAvgCtcLakhs: 5.5,
    targetAvgCtcLakhs: 38.0,
    difficulty: 'High Impact',
    experienceLevel: 'executive',
    topLocations: ['Chennai', 'Bengaluru', 'Delhi-NCR', 'Kochi', 'Dubai / UAE'],
    coreSkillGaps: ['NABH / JCI Accreditation Standards', 'Hospital Occupancy & Bed Turnover Optimization', 'Doctor Revenue Sharing & Specialty Department P&L', 'Emergency Triage & Surgical Suite Efficiency'],
    phases: [
      {
        title: 'Phase 1: Clinical Bed Turnover & OT Utilization',
        weeks: 'Weeks 1–6',
        focus: 'Average length of stay (ALOS) reduction, operation theater (OT) block scheduling.',
        milestones: ['Reduce elective surgery prep turnaround time by 30% through standardized clinical pathways', 'Optimize bed occupancy rates from 68% to 84% in 350-bed tertiary facility']
      },
      {
        title: 'Phase 2: Accreditation & High-Value Specialty P&L',
        weeks: 'Weeks 7–14',
        focus: 'NABH 5th edition audits, medical equipment capex payback (PET-CT/Cath Lab).',
        milestones: ['Lead comprehensive hospital-wide quality audit achieving zero non-conformances', 'Restructure oncology department operations delivering ₹4.5Cr EBITDA improvement']
      },
      {
        title: 'Phase 3: Healthcare Executive Leadership Loops',
        weeks: 'Weeks 15–20',
        focus: 'Hospital board presentations, doctor retention frameworks, COO search.',
        milestones: ['Present 3-year multi-specialty expansion plan to hospital governing board', 'Priority interview routing for Regional Hospital COO positions']
      }
    ]
  },

  // ── Supply Chain, Global Logistics & Maritime ──
  {
    id: 'warehouse_supervisor_to_demand_planner',
    industry: 'Supply Chain Planning & Inventory Optimization',
    industryCategory: 'Supply Chain, Logistics & Maritime',
    currentRole: 'Warehouse Operations Supervisor',
    targetRole: 'Global Demand & Inventory Planner',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 4.2,
    targetAvgCtcLakhs: 12.5,
    difficulty: 'Moderate',
    experienceLevel: 'mid',
    topLocations: ['Mumbai', 'Bhiwandi', 'Delhi-NCR', 'Pune', 'Bengaluru'],
    coreSkillGaps: ['Statistical Forecasting (ARIMA / Holt-Winters)', 'Sales & Operations Planning (S&OP) Cadence', 'Safety Stock & Economic Order Quantity (EOQ)', 'ERP SCM Modules (SAP IBP / Blue Yonder)'],
    phases: [
      {
        title: 'Phase 1: Demand Forecasting Models & Seasonality',
        weeks: 'Weeks 1–5',
        focus: 'Historical demand cleansing, baseline forecasting, promotional lift estimation.',
        milestones: ['Build automated forecast model in Excel/Python improving forecast accuracy from 72% to 88%', 'Establish ABC-XYZ inventory classification across 2,000 SKUs']
      },
      {
        title: 'Phase 2: Cross-Functional S&OP Execution',
        weeks: 'Weeks 6–11',
        focus: 'Aligning sales forecasts with production capacity, supplier lead-time buffers.',
        milestones: ['Lead simulated monthly S&OP consensus meeting resolving critical raw material shortages', 'Reduce overall working capital tied in slow-moving stock by ₹1.8Cr']
      },
      {
        title: 'Phase 3: Enterprise Supply Chain Interviews',
        weeks: 'Weeks 12–16',
        focus: 'SAP IBP certification, supply chain risk management case interviews.',
        milestones: ['Complete 5 demand planning business case simulations for FMCG and retail employers', 'Apply to verified Demand Planner openings on JobMatch OS']
      }
    ]
  },
  {
    id: 'procurement_exec_to_chief_procurement_officer',
    industry: 'Strategic Sourcing & Vendor Management',
    industryCategory: 'Supply Chain, Logistics & Maritime',
    currentRole: 'Procurement Buyer',
    targetRole: 'Chief Procurement Officer (CPO)',
    timeEstimateMonths: 5,
    currentAvgCtcLakhs: 6.5,
    targetAvgCtcLakhs: 48.0,
    difficulty: 'High Impact',
    experienceLevel: 'executive',
    topLocations: ['Mumbai', 'Gurugram', 'Bengaluru', 'Dubai / UAE'],
    coreSkillGaps: ['Global Category Management Strategies', 'Hedging Raw Material Volatility', 'Supplier ESG Auditing & Scope 3 Emissions', 'Multi-Million Dollar Contract Negotiations'],
    phases: [
      {
        title: 'Phase 1: Spend Cube Analytics & Category Strategy',
        weeks: 'Weeks 1–6',
        focus: 'Spend visibility, direct vs indirect spend analysis, Kraljic portfolio matrix.',
        milestones: ['Audit ₹150Cr enterprise spend identifying 14% consolidation cost savings', 'Design multi-sourcing strategy mitigating sole-supplier dependency risks']
      },
      {
        title: 'Phase 2: Global Supplier Governance & Sustainable Sourcing',
        weeks: 'Weeks 7–14',
        focus: 'Incoterms 2020, foreign exchange indexation, supplier ESG compliance.',
        milestones: ['Negotiate 3-year master supply agreements securing 8% volume rebate discounts', 'Implement sustainable procurement framework tracking supplier carbon footprints']
      },
      {
        title: 'Phase 3: Executive Procurement Board Representation',
        weeks: 'Weeks 15–20',
        focus: 'CPO storytelling, supply chain resilience, executive search activation.',
        milestones: ['Present board-level supply chain resilience playbook for geopolitical shock scenarios', 'Direct executive recruiter dispatch for Group CPO roles']
      }
    ]
  },

  // ── Legal, Regulatory & Corporate Governance ──
  {
    id: 'junior_litigation_to_inhouse_counsel',
    industry: 'Corporate Commercial Legal Counsel',
    industryCategory: 'Legal, Governance & Tech Policy',
    currentRole: 'District Court Litigator',
    targetRole: 'In-House Corporate Commercial Counsel',
    timeEstimateMonths: 3.5,
    currentAvgCtcLakhs: 4.5,
    targetAvgCtcLakhs: 15.0,
    difficulty: 'Moderate',
    experienceLevel: 'mid',
    topLocations: ['Delhi-NCR', 'Mumbai', 'Bengaluru', 'Hyderabad'],
    coreSkillGaps: ['SaaS Master Service Agreements (MSA) & SLAs', 'Data Protection (DPDP Act & GDPR)', 'Employment Law & Non-Compete Enforceability', 'Vendor Risk & Indemnity Negotiations'],
    phases: [
      {
        title: 'Phase 1: Commercial Contract Drafting & Negotiation',
        weeks: 'Weeks 1–4',
        focus: 'Limitation of liability, representations & warranties, IP assignment, data processing addenda.',
        milestones: ['Redline 15 complex B2B SaaS and enterprise vendor agreements', 'Create standard corporate contract playbook with fallback clauses']
      },
      {
        title: 'Phase 2: Regulatory Compliance & Dispute Mitigation',
        weeks: 'Weeks 5–9',
        focus: 'Consumer protection laws, Indian Digital Personal Data Protection (DPDP) Act compliance.',
        milestones: ['Conduct privacy gap assessment under DPDP Act for consumer digital platform', 'Institute internal pre-litigation notice resolution protocol']
      },
      {
        title: 'Phase 3: In-House Legal Interview Mastery',
        weeks: 'Weeks 10–14',
        focus: 'Balancing legal risk against business growth objectives in commercial tech.',
        milestones: ['Pass mock General Counsel interview evaluating risk appetite vs commercial speed', 'Apply to Legal Counsel roles across tech MNCs and funded startups']
      }
    ]
  },
  {
    id: 'compliance_assoc_to_chief_compliance_officer',
    industry: 'Enterprise Risk & Regulatory Affairs',
    industryCategory: 'Legal, Governance & Tech Policy',
    currentRole: 'Compliance Associate',
    targetRole: 'Chief Compliance & Ethics Officer (CCO)',
    timeEstimateMonths: 5,
    currentAvgCtcLakhs: 6.0,
    targetAvgCtcLakhs: 45.0,
    difficulty: 'High Impact',
    experienceLevel: 'executive',
    topLocations: ['Mumbai', 'Delhi-NCR', 'Dubai / UAE', 'Singapore'],
    coreSkillGaps: ['Anti-Money Laundering (AML) & Sanctions Compliance', 'FCPA & Anti-Bribery Governance', 'Whistleblower Investigations & Ethics Frameworks', 'RBI / SEBI Regulatory Examination Readiness'],
    phases: [
      {
        title: 'Phase 1: Enterprise Compliance Risk Assessment',
        weeks: 'Weeks 1–6',
        focus: 'Regulatory radar mapping, policy harmonization, institutional risk matrices.',
        milestones: ['Draft comprehensive enterprise compliance policy matrix across 8 regulatory bodies', 'Design automated KYC and sanctions transaction screening architecture']
      },
      {
        title: 'Phase 2: Independent Investigations & Regulator Defense',
        weeks: 'Weeks 7–14',
        focus: 'Handling regulatory show-cause notices, forensics, audit committee reporting.',
        milestones: ['Lead simulated whistleblower forensic inquiry and author board report', 'Prepare institutional defense for SEBI/RBI inspection audit']
      },
      {
        title: 'Phase 3: Chief Compliance Officer Executive Dispatch',
        weeks: 'Weeks 15–20',
        focus: 'Board ethics leadership, crisis management, executive talent matchmaking.',
        milestones: ['Present ethical governance framework for board-level risk committees', 'Activate targeted executive search for Group CCO openings']
      }
    ]
  },

  // ── Core Engineering, Manufacturing & Industrial IoT ──
  {
    id: 'cnc_programmer_to_automation_lead',
    industry: 'Industrial Automation & PLC Robotics',
    industryCategory: 'Core Engineering & Industrial IoT',
    currentRole: 'CNC Programmer',
    targetRole: 'Industrial Automation & PLC Specialist',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 4.0,
    targetAvgCtcLakhs: 13.5,
    difficulty: 'Moderate',
    experienceLevel: 'mid',
    topLocations: ['Pune', 'Chennai', 'Ahmedabad', 'Coimbatore'],
    coreSkillGaps: ['Siemens / Allen-Bradley PLC Ladder Logic', 'SCADA & HMI Interface Engineering', 'Robotic Arm Integration (Kuka / Fanuc)', 'Industrial Sensors & Fieldbus Protocols (Modbus/Profinet)'],
    phases: [
      {
        title: 'Phase 1: PLC Programming & Industrial Logic',
        weeks: 'Weeks 1–5',
        focus: 'IEC 61131-3 languages (Ladder Diagram, Structured Text), digital/analog I/O wiring.',
        milestones: ['Program multi-station conveyor automation logic on Siemens S7-1200 PLC', 'Design intuitive WinCC SCADA dashboard with real-time fault alarms']
      },
      {
        title: 'Phase 2: Robotic Cell Commissioning & Safety Systems',
        weeks: 'Weeks 6–11',
        focus: 'Pneumatics, servo motor drives, machine safety interlocks, ISO 13849 standards.',
        milestones: ['Commission Fanuc 6-axis pick-and-place robotic cell with vision inspection', 'Integrate emergency safety circuits ensuring zero-hazard compliance']
      },
      {
        title: 'Phase 3: Industry 4.0 Smart Factory Deployment',
        weeks: 'Weeks 12–16',
        focus: 'OPC-UA data bridges, shop-floor to MES integration.',
        milestones: ['Deploy edge gateway streaming machine cycle times to cloud MES', 'Interview for Industrial Automation Lead roles with automotive tier-1 suppliers']
      }
    ]
  },
  {
    id: 'production_engineer_to_plant_head',
    industry: 'Manufacturing Operations & Plant Leadership',
    industryCategory: 'Core Engineering & Industrial IoT',
    currentRole: 'Production Engineer',
    targetRole: 'Manufacturing Plant General Manager / Head',
    timeEstimateMonths: 5,
    currentAvgCtcLakhs: 6.0,
    targetAvgCtcLakhs: 38.0,
    difficulty: 'High Impact',
    experienceLevel: 'executive',
    topLocations: ['Pune', 'Chennai', 'Vadodara', 'Jamshedpur', 'Gurugram'],
    coreSkillGaps: ['Overall Equipment Effectiveness (OEE) Maximization', 'Plant P&L & Capex Budgeting', 'Labor Union Negotiations & Industrial Relations (IR)', 'Zero Accident Vision & TPM Excellence'],
    phases: [
      {
        title: 'Phase 1: Plant OEE Transformation & Lean Manufacturing',
        weeks: 'Weeks 1–6',
        focus: 'Single-Minute Exchange of Dies (SMED), Kaizen events, bottleneck elimination.',
        milestones: ['Elevate overall line OEE from 64% to 81% across 4 production bays', 'Reduce customer PPM defect rates by 65% through Pokayoke error-proofing']
      },
      {
        title: 'Phase 2: Plant P&L, Capex & Statutory Industrial Relations',
        weeks: 'Weeks 7–14',
        focus: 'Factories Act compliance, energy conservation, long-term wage settlements.',
        milestones: ['Manage ₹45Cr annual operating plant budget achieving 6% cost productivity', 'Negotiate peaceful 3-year charter of demands with plant labor union']
      },
      {
        title: 'Phase 3: Executive Plant Leadership Placement',
        weeks: 'Weeks 15–20',
        focus: 'Board plant operational reviews, greenfield project execution.',
        milestones: ['Present greenfield plant commissioning blueprint to conglomerate board', 'Connect with industrial conglomerates seeking Plant General Managers']
      }
    ]
  },

  // ── Marketing, Brand & Growth ──
  {
    id: 'social_media_exec_to_performance_lead',
    industry: 'Paid Acquisition & Performance Marketing',
    industryCategory: 'Marketing, Growth & D2C',
    currentRole: 'Social Media Executive',
    targetRole: 'Senior Performance Marketing Lead',
    timeEstimateMonths: 3.5,
    currentAvgCtcLakhs: 3.6,
    targetAvgCtcLakhs: 13.0,
    difficulty: 'Moderate',
    experienceLevel: 'mid',
    topLocations: ['Bengaluru', 'Mumbai', 'Gurugram', 'Dubai / UAE'],
    coreSkillGaps: ['Meta & Google Ads Auction Mechanics', 'ROAS Optimization & CAC Scaling', 'Conversion API & Server-Side Tracking', 'Creative Fatigue Testing Frameworks'],
    phases: [
      {
        title: 'Phase 1: Full-Funnel Paid Acquisition & Analytics',
        weeks: 'Weeks 1–4',
        focus: 'Google Search/PMax campaigns, Meta Advantage+ setups, attribution models.',
        milestones: ['Manage ₹15L monthly ad spend delivering 3.8x blended ROAS', 'Configure GA4 server-side tracking eliminating 25% data signal loss']
      },
      {
        title: 'Phase 2: High-Velocity Creative Iteration & Scaling',
        weeks: 'Weeks 5–9',
        focus: 'UGC creative briefs, hook testing, landing page conversion rate optimization (CRO).',
        milestones: ['Deploy 20 UGC video creative variations identifying 3 breakout winners', 'Improve checkout landing page conversion rate from 1.8% to 3.2%']
      },
      {
        title: 'Phase 3: Enterprise D2C Marketing Interviews',
        weeks: 'Weeks 10–14',
        focus: 'Unit economics storytelling, CAC-to-LTV ratio defense.',
        milestones: ['Present complete ₹1Cr monthly performance scaling playbook', 'Connect with leading D2C brands and agencies on JobMatch OS']
      }
    ]
  },
  {
    id: 'brand_exec_to_chief_marketing_officer',
    industry: 'Global Brand & Growth Marketing Leadership',
    industryCategory: 'Marketing, Growth & D2C',
    currentRole: 'Brand Marketing Manager',
    targetRole: 'Chief Marketing Officer (CMO)',
    timeEstimateMonths: 5,
    currentAvgCtcLakhs: 7.0,
    targetAvgCtcLakhs: 58.0,
    difficulty: 'High Impact',
    experienceLevel: 'executive',
    topLocations: ['Mumbai', 'Bengaluru', 'Delhi-NCR', 'Dubai / UAE', 'London / Remote'],
    coreSkillGaps: ['Multi-Market Category Creation', 'Media Mix Modeling (MMM)', 'P&L Revenue Attribution', 'Agency Holding Group Governance'],
    phases: [
      {
        title: 'Phase 1: Brand Positioning & Customer Lifetime Value',
        weeks: 'Weeks 1–6',
        focus: 'Brand equity diagnostics, Net Promoter Score (NPS), global messaging architecture.',
        milestones: ['Lead 360-degree brand repositioning campaign generating 45% uplift in unaided recall', 'Deploy Media Mix Model optimizing ₹20Cr annual marketing budget']
      },
      {
        title: 'Phase 2: Growth Engine Alignment & International GTM',
        weeks: 'Weeks 7–14',
        focus: 'Product-led growth, international market entry, brand IP acquisition.',
        milestones: ['Architect successful multi-country launch across India and UAE', 'Structure global creative and media agency contracts reducing fees by 18%']
      },
      {
        title: 'Phase 3: CMO Board Advisory & Recruiter Dispatch',
        weeks: 'Weeks 15–20',
        focus: 'Presenting to institutional investors, founder relationship mastery, C-Suite placement.',
        milestones: ['Defend corporate customer acquisition economics to private equity board', 'Direct placement routing for CMO / VP Global Marketing opportunities']
      }
    ]
  },

  // ── Real Estate & Infrastructure ──
  {
    id: 'civil_site_engineer_to_project_director',
    industry: 'Real Estate Development & Mega Projects',
    industryCategory: 'Real Estate & Infrastructure',
    currentRole: 'Civil Site Engineer',
    targetRole: 'Real Estate Project Director',
    timeEstimateMonths: 4.5,
    currentAvgCtcLakhs: 4.5,
    targetAvgCtcLakhs: 38.0,
    difficulty: 'High Impact',
    experienceLevel: 'executive',
    topLocations: ['Mumbai', 'Bengaluru', 'Delhi-NCR', 'Hyderabad', 'Dubai / UAE'],
    coreSkillGaps: ['RERA Statutory Compliance & Approvals', 'Primavera P6 & BIM 4D Project Scheduling', 'High-Rise Construction Value Engineering', 'General Contractor EPC Contracting'],
    phases: [
      {
        title: 'Phase 1: Critical Path Scheduling & Cost Control',
        weeks: 'Weeks 1–6',
        focus: 'Primavera P6 baseline schedules, cash outflow forecasting, milestone tracking.',
        milestones: ['Establish baseline project schedule for 1.2M sq.ft residential township', 'Deliver value-engineering review saving ₹6.5Cr in structural steel and concrete']
      },
      {
        title: 'Phase 2: Regulatory Clearances & EPC Contractor Governance',
        weeks: 'Weeks 7–13',
        focus: 'Environmental clearances, fire NOCs, RERA escrow management, FIDIC contracts.',
        milestones: ['Secure statutory occupation certificates ahead of scheduled delivery milestone', 'Enforce quality and safety protocols achieving 2 million safe work hours']
      },
      {
        title: 'Phase 3: Developer Leadership & C-Suite Selection',
        weeks: 'Weeks 14–18',
        focus: 'Developer P&L reviews, land acquisition feasibility, Project Director placement.',
        milestones: ['Present comprehensive land development feasibility study to investment committee', 'Priority recruiter dispatch for Top Tier Real Estate Developers']
      }
    ]
  },

  // ── Consulting & Strategy ──
  {
    id: 'research_associate_to_strategy_consultant',
    industry: 'Tier-1 Management Consulting',
    industryCategory: 'Marketing, Growth & D2C',
    currentRole: 'Market Research Associate',
    targetRole: 'Management Strategy Consultant',
    timeEstimateMonths: 4,
    currentAvgCtcLakhs: 5.5,
    targetAvgCtcLakhs: 22.0,
    difficulty: 'Demanding',
    experienceLevel: 'mid',
    topLocations: ['Gurugram', 'Mumbai', 'Bengaluru', 'Dubai / UAE'],
    coreSkillGaps: ['Pyramid Principle & MECE Problem Structuring', 'Market Sizing & Profitability Frameworks', 'Executive PowerPoint Storylining', 'Financial Valuation & Due Diligence'],
    phases: [
      {
        title: 'Phase 1: Case Interview Mastery & MECE Decomposition',
        weeks: 'Weeks 1–5',
        focus: 'Market entry, profitability diagnostics, M&A cases, mental math speed.',
        milestones: ['Solve 60 structured consulting business cases with peer practitioners', 'Master MECE issue tree decomposition for complex ambiguous problems']
      },
      {
        title: 'Phase 2: Slide Architecture & C-Suite Storytelling',
        weeks: 'Weeks 6–11',
        focus: 'Drafting board-ready slide decks, data synthesis, client workshop facilitation.',
        milestones: ['Produce 25-slide strategy recommendation deck on digital transformation', 'Synthesize primary market expert interviews into actionable strategic takeaways']
      },
      {
        title: 'Phase 3: Management Consulting Partner Interviews',
        weeks: 'Weeks 12–16',
        focus: 'Partner-round behavioral stories, PE/Corporate strategy practice interviews.',
        milestones: ['Pass 3 mock Partner interview rounds with ex-MBB consultants', 'Direct application to Strategy & Operations consulting teams']
      }
    ]
  },

  // ── Technology, Cloud & Engineering Leadership ──
  {
    id: 'engineering_manager_to_vp_engineering',
    industry: 'Engineering Leadership & Scaled Architecture',
    industryCategory: 'Technology, Cloud & AI',
    currentRole: 'Engineering Manager',
    targetRole: 'VP of Engineering',
    timeEstimateMonths: 5,
    currentAvgCtcLakhs: 28.0,
    targetAvgCtcLakhs: 65.0,
    difficulty: 'High Impact',
    experienceLevel: 'executive',
    topLocations: ['Bengaluru', 'Hyderabad', 'Pune', 'Dubai / UAE', 'US / Remote'],
    coreSkillGaps: ['Multi-Team Org Architecture & Top Engineering Talent Sourcing', 'Cloud Infrastructure Cost Governance (FinOps)', 'System Availability & High-Reliability SLOs', 'Board Technical Vision Defense'],
    phases: [
      {
        title: 'Phase 1: Scaled Org Design & Delivery Velocity',
        weeks: 'Weeks 1–6',
        focus: 'Team topologies, DORA metrics, engineering career ladders, headcount allocation.',
        milestones: ['Restructure 60-person engineering organization into high-autonomy product pods', 'Improve DORA deployment frequency by 3x while cutting change failure rate to <2%']
      },
      {
        title: 'Phase 2: FinOps, Cloud Architecture & Tech Debt Containment',
        weeks: 'Weeks 7–14',
        focus: 'AWS/GCP infrastructure optimization, multi-region failover, executive technical roadmap.',
        milestones: ['Reduce annual cloud infrastructure expenditure by 32% ($450K annual savings)', 'Lead architectural transition to event-driven microservices supporting 10x traffic spikes']
      },
      {
        title: 'Phase 3: Board Presentation & C-Suite Tech Leadership',
        weeks: 'Weeks 15–20',
        focus: 'Presenting technical risk to audit committee, founder alignment, VP Eng search.',
        milestones: ['Present 3-year AI & Platform technology roadmap to CEO and Investors', 'Activate priority executive dispatch for Series B/C VP Engineering mandates']
      }
    ]
  }
];

// Combine and write
console.log(`Adding ${newTransitions.length} rich multi-industry transitions...`);

// Let's create an injector that inserts them before the dynamic generator
const insertMarker = 'export const generateCustomCareerTransition =';
if (!existingContent.includes(insertMarker)) {
  console.error('Insert marker not found!');
  process.exit(1);
}

// Convert newTransitions to TS code
const codeToAdd = '\n  // ── MULTI-INDUSTRY & EXECUTIVE EXPANSION (HR, SALES, FINANCE, HEALTHCARE, SCM, LEGAL, CORE ENG) ──\n' +
  newTransitions.map(t => {
    return '  ' + JSON.stringify(t, null, 2).replace(/"([^"]+)":/g, '$1:').replace(/"/g, "'") + ',';
  }).join('\n') + '\n\n';

const updatedContent = existingContent.replace(insertMarker, codeToAdd + insertMarker);

fs.writeFileSync(targetFilePath, updatedContent, 'utf8');
console.log('Successfully updated careerPathwaysCatalog.ts with new transitions!');

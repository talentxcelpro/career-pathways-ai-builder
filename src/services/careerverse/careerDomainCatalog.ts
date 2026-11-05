// src/services/careerverse/careerDomainCatalog.ts
// Multi-Industry CareerVerse Domain Engine: Students, Business, Marketing, Finance, HR & Tech

export type CareerDomainId = 
  | 'student_early_career'
  | 'business_operations'
  | 'marketing_growth'
  | 'finance_accounting'
  | 'human_resources'
  | 'technology';

export interface CombatActionDefinition {
  id: string;
  name: string;
  type: 'attack' | 'defense' | 'ultimate';
  damage: number;
  description: string;
  taskPrompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DomainBossDefinition {
  id: string;
  title: string;
  companyName: string;
  roleType: string;
  badge: string;
  xpReward: number;
  combatActions: CombatActionDefinition[];
}

export interface DomainSkillNode {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  levelRange: string;
  category: string;
  status: 'mastered' | 'unlocked' | 'locked';
}

export interface DomainDailyQuest {
  id: string;
  title: string;
  category: 'daily' | 'special';
  xpReward: number;
  description: string;
}

export interface CareerDomainConfig {
  id: CareerDomainId;
  label: string;
  shortLabel: string;
  iconName: string;
  tagline: string;
  accentColor: string;
  badge: string;
  boss: DomainBossDefinition;
  skillNodes: DomainSkillNode[];
  dailyQuests: DomainDailyQuest[];
}

export const CAREER_DOMAINS: Record<CareerDomainId, CareerDomainConfig> = {
  student_early_career: {
    id: 'student_early_career',
    label: 'Student & Campus Readiness',
    shortLabel: 'Student / Fresher',
    iconName: 'GraduationCap',
    tagline: 'Campus-to-Corporate, Aptitude, Soft Skills & Placement Readiness',
    accentColor: '#36D9F5',
    badge: 'Campus Rising Star',
    boss: {
      id: 'boss_student_placement',
      title: 'Campus-to-Corporate Placement Challenge',
      companyName: 'Global Employer Placement Alliance',
      roleType: 'Graduate Trainee & Campus Placement',
      badge: 'Placement Ready Star',
      xpReward: 500,
      combatActions: [
        {
          id: 'action_aptitude',
          name: 'Quantitative Aptitude Strike',
          type: 'attack',
          damage: 3500,
          description: 'Solve real-world time-work and proportional problem solving.',
          taskPrompt: 'A team of 4 campus trainees completes a client onboarding sprint in 6 days. If 2 additional trainees join at identical velocity, how many days will the sprint take?',
          options: ['4 days', '3 days', '5 days', '2 days'],
          correctIndex: 0,
          explanation: 'Total work = 4 * 6 = 24 person-days. With 6 trainees working together, 24 / 6 = 4 days.',
        },
        {
          id: 'action_comm_shield',
          name: 'Professional Communication Shield',
          type: 'defense',
          damage: 2500,
          description: 'Defend team alignment with proactive corporate email and stakeholder etiquette.',
          taskPrompt: 'When escalating an unexpected project blocker that impacts a client milestone, what is the most professional initial communication?',
          options: [
            'Wait until the client brings it up in the quarterly review',
            'Send a concise update detailing the root cause, business impact, and 2 viable mitigation proposals',
            'Privately point fingers at absent colleagues in an informal group chat',
            'Silently alter the deliverable deadline in the tracking sheet'
          ],
          correctIndex: 1,
          explanation: 'Proactive communication that outlines root cause, impact, and actionable solutions demonstrates authentic corporate ownership and maturity.',
        },
        {
          id: 'action_case_surge',
          name: 'Critical Problem-Solving & Case Duel (Ultimate)',
          type: 'ultimate',
          damage: 4500,
          description: 'Diagnose a business case breakdown using structured root-cause analysis.',
          taskPrompt: 'In a campus placement interview case study, a retail store reports a 20% drop in sales while footfall actually increased. Which metric should you inspect first?',
          options: [
            'Increase television advertising spend by 50%',
            'Analyze in-store inventory stockouts, pricing friction, and checkout conversion rate',
            'Immediately replace the regional store managers',
            'Shut down physical locations without consulting customer receipt data'
          ],
          correctIndex: 1,
          explanation: 'High footfall paired with falling revenue isolates the issue to store conversion, stockouts, or checkout friction—not lack of foot traffic.',
        },
      ],
    },
    skillNodes: [
      { id: 'node_aptitude', name: 'Campus Aptitude', tier: 1, levelRange: 'Lv. 1–5', category: 'Foundation', status: 'mastered' },
      { id: 'node_comm', name: 'Corporate Comms', tier: 2, levelRange: 'Lv. 6–10', category: 'Workplace', status: 'unlocked' },
      { id: 'node_reasoning', name: 'Logical Reasoning', tier: 2, levelRange: 'Lv. 6–10', category: 'Analytical', status: 'unlocked' },
      { id: 'node_case', name: 'Case Interviews', tier: 3, levelRange: 'Lv. 11–15', category: 'Advanced', status: 'locked' },
      { id: 'node_leadership', name: 'Youth Leadership', tier: 3, levelRange: 'Lv. 11–15', category: 'Executive', status: 'locked' },
    ],
    dailyQuests: [
      { id: 'dq_stu_01', title: 'Complete Placement Aptitude Sprint', category: 'daily', xpReward: 50, description: 'Practice time-distance and logical reasoning puzzles' },
      { id: 'dq_stu_02', title: 'Review Workplace Etiquette Protocol', category: 'daily', xpReward: 50, description: 'Master professional communication and stakeholder ownership' },
      { id: 'dq_stu_03', title: 'Campus-to-Corporate Case Duel', category: 'daily', xpReward: 75, description: 'Solve structured problem-solving business diagnostics' },
    ],
  },

  business_operations: {
    id: 'business_operations',
    label: 'Business, Operations & Strategy',
    shortLabel: 'Business & Ops',
    iconName: 'Briefcase',
    tagline: 'Process Optimization, Lean Six Sigma, Agile Delivery & Strategic Scaling',
    accentColor: '#FFCA55',
    badge: 'Operations Master',
    boss: {
      id: 'boss_ops_turnaround',
      title: 'Enterprise Operational Turnaround Arena',
      companyName: 'McKinsey / BCG Scale Ecosystem',
      roleType: 'Operations Lead & Management Consultant',
      badge: 'Operational Excellence Badge',
      xpReward: 650,
      combatActions: [
        {
          id: 'action_toc',
          name: 'Lean Bottleneck Elimination Strike',
          type: 'attack',
          damage: 3500,
          description: 'Apply Goldratt’s Theory of Constraints to elevate plant and service throughput.',
          taskPrompt: 'Under the Theory of Constraints (TOC), how should an operations leader maximize total system output?',
          options: [
            'Accelerate non-bottleneck workstations to produce surplus inventory',
            'Subordinate all operating schedules to maximize the throughput of the primary constraint',
            'Hire duplicate staff across every single department simultaneously',
            'Eliminate all buffer inventory across the entire supply chain'
          ],
          correctIndex: 1,
          explanation: 'TOC dictates that an hour lost on the bottleneck constraint is an hour lost for the entire system; non-constraints must be synchronized to it.',
        },
        {
          id: 'action_pnl_shield',
          name: 'P&L Variance & Risk Mitigation Shield',
          type: 'defense',
          damage: 2500,
          description: 'Harden operational budgets against inflation and vendor price volatility.',
          taskPrompt: 'A monthly operational report shows operating expenses 15% over budget due to supplier price increases. What is the standard governance action?',
          options: [
            'Halt customer fulfillment operations immediately',
            'Perform cost-driver sensitivity analysis and renegotiate tiered volume contracts or engage secondary suppliers',
            'Ignore the variance until the fiscal year-end audit',
            'Alter revenue recognition timing to conceal the expense increase'
          ],
          correctIndex: 1,
          explanation: 'Sensitivity analysis isolates cost drivers and enables targeted supplier renegotiation or dual-sourcing without disrupting service delivery.',
        },
        {
          id: 'action_okr_surge',
          name: 'Strategic Execution & OKR Surge (Ultimate)',
          type: 'ultimate',
          damage: 4500,
          description: 'Align cross-functional execution directly to quarterly executive outcomes.',
          taskPrompt: 'In high-performance OKR governance, how should departmental Key Results be defined?',
          options: [
            'As open-ended qualitative aspirations with no numerical baselines',
            'As measurable, outcome-based indicators with clear baselines and target completion dates',
            'Strictly as laundry lists of daily tasks and meetings attended',
            'As private targets hidden from cross-functional partner teams'
          ],
          correctIndex: 1,
          explanation: 'Effective Key Results are quantitative outcomes, not activities, providing unambiguous clarity on whether the objective was met.',
        },
      ],
    },
    skillNodes: [
      { id: 'node_lean', name: 'Lean Operations', tier: 1, levelRange: 'Lv. 1–5', category: 'Foundation', status: 'mastered' },
      { id: 'node_agile_ops', name: 'Agile Delivery', tier: 2, levelRange: 'Lv. 6–10', category: 'Execution', status: 'unlocked' },
      { id: 'node_pnl', name: 'P&L Variance', tier: 2, levelRange: 'Lv. 6–10', category: 'Finance', status: 'unlocked' },
      { id: 'node_scale', name: 'Strategic Scaling', tier: 3, levelRange: 'Lv. 11–15', category: 'Strategy', status: 'locked' },
      { id: 'node_exec_ops', name: 'Exec Governance', tier: 3, levelRange: 'Lv. 11–15', category: 'Leadership', status: 'locked' },
    ],
    dailyQuests: [
      { id: 'dq_ops_01', title: 'Audit Supply Chain Bottlenecks', category: 'daily', xpReward: 50, description: 'Review cycle time and work-in-progress inventory' },
      { id: 'dq_ops_02', title: 'Calibrate Agile Team Velocity', category: 'daily', xpReward: 50, description: 'Analyze sprint burndown and deliverable predictability' },
      { id: 'dq_ops_03', title: 'Quarterly Operating Variance Review', category: 'daily', xpReward: 75, description: 'Reconcile budget forecasts against actual expenditure' },
    ],
  },

  marketing_growth: {
    id: 'marketing_growth',
    label: 'Digital Marketing & Growth',
    shortLabel: 'Marketing / Growth',
    iconName: 'TrendingUp',
    tagline: 'CAC/LTV Optimization, Viral Funnels, Social Content & Conversion Engineering',
    accentColor: '#A34EFF',
    badge: 'Growth Alchemist',
    boss: {
      id: 'boss_growth_unicorn',
      title: 'Hyper-Growth Viral Acquisition Challenge',
      companyName: 'Consumer Unicorn Growth Lab',
      roleType: 'Head of Growth & Performance Marketing',
      badge: 'Growth Engine Master',
      xpReward: 700,
      combatActions: [
        {
          id: 'action_cro',
          name: 'Conversion Rate Optimization Strike',
          type: 'attack',
          damage: 3500,
          description: 'A/B test landing page value propositions to slash drop-off rates.',
          taskPrompt: 'A marketing campaign attracts 25,000 visitors to a landing page, generating 1,000 signups and 250 paying subscribers. What is the visitor-to-paid conversion rate?',
          options: ['4.0%', '1.0%', '10.0%', '2.5%'],
          correctIndex: 1,
          explanation: 'Visitor-to-paid conversion rate = 250 / 25,000 = 0.01 = 1.0%. (Signup rate is 4%, and signup-to-paid is 25%).',
        },
        {
          id: 'action_unit_econ',
          name: 'LTV / CAC Unit Economics Shield',
          type: 'defense',
          damage: 2500,
          description: 'Protect capital efficiency by preserving positive margin contribution.',
          taskPrompt: 'To sustain venture-grade product-led growth, what is the benchmark minimum ratio of Customer Lifetime Value (LTV) to Customer Acquisition Cost (CAC)?',
          options: [
            '0.5x (CAC exceeds LTV)',
            '1.0x (Break-even with zero margin for operational overhead)',
            '3.0x or higher',
            '0.2x'
          ],
          correctIndex: 2,
          explanation: 'An LTV:CAC ratio of 3:1 or higher ensures adequate gross margin to cover cost of service, customer support, and research & development.',
        },
        {
          id: 'action_viral_k',
          name: 'Viral Referral Engine Surge (Ultimate)',
          type: 'ultimate',
          damage: 4500,
          description: 'Ignite self-sustaining viral loops through peer referral incentives.',
          taskPrompt: 'In growth loop modeling, what condition guarantees that an organic peer referral engine is exponentially self-sustaining without additional ad spend?',
          options: [
            'Viral Coefficient (K-factor) > 1.0',
            'User retention rate is exactly 50%',
            'Cost Per Click is under ₹15',
            'Email newsletter open rate is 20%'
          ],
          correctIndex: 0,
          explanation: 'A K-factor greater than 1.0 means each existing user brings in more than one new user, producing compounding viral growth.',
        },
      ],
    },
    skillNodes: [
      { id: 'node_growth_funnel', name: 'Funnel Optimization', tier: 1, levelRange: 'Lv. 1–5', category: 'Foundation', status: 'mastered' },
      { id: 'node_perf_ads', name: 'Performance Ads', tier: 2, levelRange: 'Lv. 6–10', category: 'Acquisition', status: 'unlocked' },
      { id: 'node_cro_ab', name: 'CRO & A/B Testing', tier: 2, levelRange: 'Lv. 6–10', category: 'Analytics', status: 'unlocked' },
      { id: 'node_viral_loops', name: 'Viral Loops', tier: 3, levelRange: 'Lv. 11–15', category: 'Growth', status: 'locked' },
      { id: 'node_omnichannel', name: 'Brand Omnichannel', tier: 3, levelRange: 'Lv. 11–15', category: 'Executive', status: 'locked' },
    ],
    dailyQuests: [
      { id: 'dq_mkt_01', title: 'Diagnose Landing Page Drop-off', category: 'daily', xpReward: 50, description: 'Analyze heatmaps and scroll depth to reduce bounce rate' },
      { id: 'dq_mkt_02', title: 'Audit Ad Campaign CAC & ROAS', category: 'daily', xpReward: 50, description: 'Evaluate multi-touch attribution across acquisition channels' },
      { id: 'dq_mkt_03', title: 'Architect Peer Referral Incentive Loop', category: 'daily', xpReward: 75, description: 'Optimize dual-sided invite mechanics to boost K-factor' },
    ],
  },

  finance_accounting: {
    id: 'finance_accounting',
    label: 'Finance, Banking & Accounting',
    shortLabel: 'Finance / Accounting',
    iconName: 'Coins',
    tagline: 'DCF Valuation, Liquidity Risk, Working Capital, Ratio Analysis & Capital Allocation',
    accentColor: '#20D994',
    badge: 'Capital Strategist',
    boss: {
      id: 'boss_wall_street',
      title: 'Corporate Valuation & Liquidity Audit Boss',
      companyName: 'Big 4 Financial Advisory Syndicate',
      roleType: 'Financial Analyst & Investment Associate',
      badge: 'Chartered Valuation Shield',
      xpReward: 700,
      combatActions: [
        {
          id: 'action_dcf',
          name: 'Discounted Cash Flow Valuation Strike',
          type: 'attack',
          damage: 3500,
          description: 'Model future cash flow yields using rigorous cost of capital discounting.',
          taskPrompt: 'In a Discounted Cash Flow (DCF) valuation model, if the company’s Weighted Average Cost of Capital (WACC) increases, what happens to Enterprise Value?',
          options: [
            'Enterprise Value increases',
            'Enterprise Value decreases because future free cash flows are discounted at a higher hurdle rate',
            'Enterprise Value remains unchanged',
            'EBITDA doubles automatically'
          ],
          correctIndex: 1,
          explanation: 'Because WACC is in the denominator of the present value formula, a higher discount rate yields a lower present value for future cash flows.',
        },
        {
          id: 'action_liquidity_ratio',
          name: 'Quick Ratio & Solvency Shield',
          type: 'defense',
          damage: 2500,
          description: 'Shield liquidity reserves against unexpected short-term liability drawdowns.',
          taskPrompt: 'Which balance sheet metric measures a company’s ability to cover short-term liabilities immediately without relying on selling inventory?',
          options: [
            'Debt-to-Equity Ratio',
            'Quick Ratio (Acid-Test: [Cash + Marketable Securities + Receivables] / Current Liabilities)',
            'Gross Margin Percentage',
            'Inventory Turnover Period'
          ],
          correctIndex: 1,
          explanation: 'The Quick Ratio strips out illiquid inventory, evaluating whether immediate cash and receivables suffice to cover near-term obligations.',
        },
        {
          id: 'action_npv_surge',
          name: 'Capital Allocation & NPV Surge (Ultimate)',
          type: 'ultimate',
          damage: 4500,
          description: 'Allocate corporate treasury to positive Net Present Value initiatives.',
          taskPrompt: 'When evaluating mutually exclusive capital investment projects, why is Net Present Value (NPV) preferred over simple Payback Period?',
          options: [
            'NPV considers the time value of money and all net cash flows across the entire investment lifecycle',
            'NPV ignores interest rates and inflation completely',
            'Payback period requires advanced calculus',
            'NPV always produces a negative dollar valuation'
          ],
          correctIndex: 0,
          explanation: 'Simple payback period ignores cash flows arriving after the payback threshold and fails to discount cash flows for the cost of capital.',
        },
      ],
    },
    skillNodes: [
      { id: 'node_fin_stmts', name: 'Financial Statements', tier: 1, levelRange: 'Lv. 1–5', category: 'Foundation', status: 'mastered' },
      { id: 'node_dcf_model', name: 'Valuation & DCF', tier: 2, levelRange: 'Lv. 6–10', category: 'Modeling', status: 'unlocked' },
      { id: 'node_working_cap', name: 'Working Capital', tier: 2, levelRange: 'Lv. 6–10', category: 'Corporate', status: 'unlocked' },
      { id: 'node_risk_hedge', name: 'Risk & Hedging', tier: 3, levelRange: 'Lv. 11–15', category: 'Treasury', status: 'locked' },
      { id: 'node_m_and_a', name: 'M&A Strategy', tier: 3, levelRange: 'Lv. 11–15', category: 'Executive', status: 'locked' },
    ],
    dailyQuests: [
      { id: 'dq_fin_01', title: 'Analyze Balance Sheet Liquidity Ratios', category: 'daily', xpReward: 50, description: 'Calculate Acid-Test and current liquidity safety buffers' },
      { id: 'dq_fin_02', title: 'Audit Working Capital Cash Conversion Cycle', category: 'daily', xpReward: 50, description: 'Reconcile Days Sales Outstanding (DSO) and payables' },
      { id: 'dq_fin_03', title: 'Perform DCF Sensitivity Stress Test', category: 'daily', xpReward: 75, description: 'Model terminal value variations against shifting interest rates' },
    ],
  },

  human_resources: {
    id: 'human_resources',
    label: 'Human Resources & Talent',
    shortLabel: 'HR / Talent',
    iconName: 'Users',
    tagline: 'Talent Acquisition, Culture & Retention, Compliance & Organizational Leadership',
    accentColor: '#FF6492',
    badge: 'People Champion',
    boss: {
      id: 'boss_talent_search',
      title: 'Global Talent Acquisition & Culture Arena',
      companyName: 'Fortune 500 Executive People Syndicate',
      roleType: 'Head of Talent & HR Business Partner',
      badge: 'People Leader Laureate',
      xpReward: 650,
      combatActions: [
        {
          id: 'action_pipeline',
          name: 'Talent Sourcing & Velocity Strike',
          type: 'attack',
          damage: 3500,
          description: 'Deploy proactive sourcing pipelines to slash time-to-hire by 40%.',
          taskPrompt: 'An enterprise is scaling rapidly and needs to reduce agency recruitment fees while maintaining high candidate quality. Which initiative delivers the best outcome?',
          options: [
            'Send unpersonalized cold messages to thousands of random profiles',
            'Launch an employee referral program with transparent milestone rewards and active recruiter candidate tracking',
            'Lower interview technical passing bars to accelerate offers',
            'Outsource all key leadership hiring to unvetted third parties'
          ],
          correctIndex: 1,
          explanation: 'Employee referral programs consistently demonstrate lower acquisition cost, faster time-to-fill, and significantly higher 1-year retention rates.',
        },
        {
          id: 'action_posh_shield',
          name: 'Compliance & Workplace Safety Shield',
          type: 'defense',
          damage: 2500,
          description: 'Uphold strict statutory compliance and psychological safety in organizational culture.',
          taskPrompt: 'Under workplace statutory compliance frameworks (such as POSH or anti-harassment regulations), what is the mandatory immediate step upon receiving a formal employee grievance?',
          options: [
            'Address the accusation openly in the company-wide town hall',
            'Acknowledge receipt in writing, initiate a confidential inquiry through the designated committee, and guarantee non-retaliation protections',
            'Suggest the parties resolve the grievance informally over coffee',
            'Wait until the annual performance review cycle to address it'
          ],
          correctIndex: 1,
          explanation: 'Immediate formal acknowledgement, strict confidentiality, designated committee review, and non-retaliation protocols are legally mandatory.',
        },
        {
          id: 'action_retention_surge',
          name: 'Culture & Retention Surge (Ultimate)',
          type: 'ultimate',
          damage: 4500,
          description: 'Foster employee engagement through transparent growth roadmaps and mentorship.',
          taskPrompt: 'According to empirical workplace analytics, which organizational factor contributes most reliably to reducing voluntary talent attrition?',
          options: [
            'Office arcade machines and catered gourmet lunches',
            'Transparent career progression pathways, regular recognition, and empathetic, psychologically safe leadership',
            'Mandatory daily overtime check-ins',
            'Strict webcam monitoring during remote work'
          ],
          correctIndex: 1,
          explanation: 'Clear career pathways, psychological safety, and meaningful growth mentorship are the strongest drivers of long-term employee retention.',
        },
      ],
    },
    skillNodes: [
      { id: 'node_hr_sourcing', name: 'Talent Sourcing', tier: 1, levelRange: 'Lv. 1–5', category: 'Foundation', status: 'mastered' },
      { id: 'node_people_ops', name: 'People Analytics', tier: 2, levelRange: 'Lv. 6–10', category: 'Operations', status: 'unlocked' },
      { id: 'node_comp_ben', name: 'Comp & Benefits', tier: 2, levelRange: 'Lv. 6–10', category: 'Strategy', status: 'unlocked' },
      { id: 'node_org_design', name: 'Org Development', tier: 3, levelRange: 'Lv. 11–15', category: 'Leadership', status: 'locked' },
      { id: 'node_exec_hr', name: 'Executive People Partner', tier: 3, levelRange: 'Lv. 11–15', category: 'Executive', status: 'locked' },
    ],
    dailyQuests: [
      { id: 'dq_hr_01', title: 'Calibrate Talent Acquisition Pipeline', category: 'daily', xpReward: 50, description: 'Analyze applicant drop-off stages between screening and offer' },
      { id: 'dq_hr_02', title: 'Audit Employee Engagement & Retention', category: 'daily', xpReward: 50, description: 'Review eNPS scores and design stay-interview rubrics' },
      { id: 'dq_hr_03', title: 'Statutory Workplace Compliance Case', category: 'daily', xpReward: 75, description: 'Simulate confidential workplace grievance resolution protocols' },
    ],
  },

  technology: {
    id: 'technology',
    label: 'Technology & Software Engineering',
    shortLabel: 'Tech / Engineering',
    iconName: 'Code2',
    tagline: 'Distributed Systems, Algorithmic Optimization, Cloud Architecture & AI/ML',
    accentColor: '#278DFF',
    badge: 'Code Architect',
    boss: {
      id: 'boss_ai_engineer',
      title: 'TalentXcel Core AI Lab Megastructure',
      companyName: 'TalentXcel Core AI Lab',
      roleType: 'AI Systems Engineer & Full-Stack Architect',
      badge: 'AI Pioneer Badge',
      xpReward: 750,
      combatActions: [
        {
          id: 'action_optimize',
          name: 'Algorithmic Optimization Strike',
          type: 'attack',
          damage: 3500,
          description: 'Refactor an O(N^2) nested loop into an O(N) hash map lookup.',
          taskPrompt: 'A backend service executes nested lookups across 50,000 records. Which data structure optimizes lookup to O(1) average time?',
          options: ['Linked List', 'Hash Map (Key-Value Index)', 'Unsorted Array', 'Binary Search Tree'],
          correctIndex: 1,
          explanation: 'A Hash Map provides O(1) average time key lookups, dropping loop complexity from O(N^2) to linear O(N).',
        },
        {
          id: 'action_harden',
          name: 'Security Shield & Defend',
          type: 'defense',
          damage: 2500,
          description: 'Defend against an unauthorized data injection attack by implementing strict RLS.',
          taskPrompt: 'In Supabase PostgreSQL, which security primitive enforces tenant isolation at the database layer rather than the application layer?',
          options: ['Client-side if() checks', 'Row Level Security (RLS) Policies', 'CORS origin headers', 'JWT token expiration'],
          correctIndex: 1,
          explanation: 'Row Level Security (RLS) ensures that even if application logic is breached, PostgreSQL rejects unauthorized row reads at the query engine level.',
        },
        {
          id: 'action_ultimate',
          name: 'Distributed Architectural Surge (Ultimate)',
          type: 'ultimate',
          damage: 4500,
          description: 'Deploy idempotency-protected event sourcing with Redis distributed locks.',
          taskPrompt: 'To prevent duplicate payments and race conditions under peak traffic, what must every transactional event carry?',
          options: ['Random Math.random() seed', 'Unique Idempotency Key', 'Client screen resolution', 'Browser user-agent'],
          correctIndex: 1,
          explanation: 'An Idempotency Key guarantees that duplicate or retried requests produce the identical result without re-executing credit mutations.',
        },
      ],
    },
    skillNodes: [
      { id: 'tech_frontend', name: 'Frontend', tier: 1, levelRange: 'Lv. 1–5', category: 'Core Web', status: 'mastered' },
      { id: 'tech_react', name: 'React', tier: 2, levelRange: 'Lv. 6–10', category: 'Frameworks', status: 'unlocked' },
      { id: 'tech_backend', name: 'Backend', tier: 2, levelRange: 'Lv. 6–10', category: 'Architecture', status: 'unlocked' },
      { id: 'tech_fullstack', name: 'Full Stack', tier: 3, levelRange: 'Lv. 11–15', category: 'Enterprise', status: 'locked' },
      { id: 'tech_ai_ml', name: 'AI/ML Systems', tier: 3, levelRange: 'Lv. 11–15', category: 'Intelligence', status: 'locked' },
    ],
    dailyQuests: [
      { id: 'dq_tech_01', title: 'React Windowing Performance Challenge', category: 'daily', xpReward: 50, description: 'Implement memory-safe virtualized viewport indexing' },
      { id: 'dq_tech_02', title: 'PostgreSQL Connection Pool Sizing', category: 'daily', xpReward: 50, description: 'Calculate optimal pool configuration for high concurrency' },
      { id: 'dq_tech_03', title: 'Vector Cosine Similarity Kernel', category: 'daily', xpReward: 75, description: 'Evaluate vector embedding dot products for semantic search' },
    ],
  },
};

/**
 * Automatically detects the most fitting CareerDomainId from profile headline, role, and skills.
 */
export function detectDomainFromProfile(headline?: string, skills?: string[]): CareerDomainId {
  const text = `${headline || ''} ${(skills || []).join(' ')}`.toLowerCase();

  if (text.includes('student') || text.includes('fresher') || text.includes('college') || text.includes('intern') || text.includes('btech') || text.includes('graduate')) {
    return 'student_early_career';
  }
  if (text.includes('market') || text.includes('growth') || text.includes('seo') || text.includes('content') || text.includes('social media') || text.includes('ad ')) {
    return 'marketing_growth';
  }
  if (text.includes('financ') || text.includes('account') || text.includes('audit') || text.includes('tax') || text.includes('bank') || text.includes('ca ') || text.includes('cpa')) {
    return 'finance_accounting';
  }
  if (text.includes('hr') || text.includes('recruiter') || text.includes('talent') || text.includes('people') || text.includes('hiring') || text.includes('staffing')) {
    return 'human_resources';
  }
  if (text.includes('business') || text.includes('operations') || text.includes('consultant') || text.includes('product manager') || text.includes('project manager') || text.includes('agile') || text.includes('scrum')) {
    return 'business_operations';
  }
  // Default to technology if code/engineering keywords exist, or fall back to student if completely blank
  if (text.includes('developer') || text.includes('engineer') || text.includes('react') || text.includes('node') || text.includes('python') || text.includes('java') || text.includes('software')) {
    return 'technology';
  }

  return 'student_early_career';
}

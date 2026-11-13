// scripts/expand-to-152-transitions.cjs
const fs = require('fs');
const path = require('path');

const targetFilePath = path.join(__dirname, '../src/data/careerPathwaysCatalog.ts');
let content = fs.readFileSync(targetFilePath, 'utf8');

const additionalArchetypes = [
  // ── Technology & AI (5 more)
  {
    roleFrom: 'Junior Backend Developer',
    roleTo: 'Distributed Systems Architect',
    cat: 'Technology, Cloud & AI',
    ind: 'Distributed Backend Engineering',
    lvl: 'senior',
    cMin: 7.5,
    cMax: 32.0,
    time: 4.5,
    cities: ['Bengaluru', 'Hyderabad', 'Pune'],
    gaps: ['Kafka & Event-Driven Architecture', 'Distributed Consensus (Raft / Paxos)', 'Database Sharding & Replication', 'High-Throughput gRPC Services']
  },
  {
    roleFrom: 'Cloud Support Associate',
    roleTo: 'Senior Site Reliability Engineer (SRE)',
    cat: 'Technology, Cloud & AI',
    ind: 'Cloud Infrastructure & SRE',
    lvl: 'mid',
    cMin: 5.5,
    cMax: 18.0,
    time: 4,
    cities: ['Bengaluru', 'Noida', 'Chennai'],
    gaps: ['Kubernetes Operator SDK', 'Terraform & GitOps Automation', 'SLO/SLI Error Budget Engineering', 'Prometheus & OpenTelemetry Tracing']
  },
  {
    roleFrom: 'Mobile App Developer',
    roleTo: 'Principal Mobile Solutions Architect',
    cat: 'Technology, Cloud & AI',
    ind: 'Cross-Platform Mobile Engineering',
    lvl: 'senior',
    cMin: 8.0,
    cMax: 28.0,
    time: 4,
    cities: ['Bengaluru', 'Mumbai', 'Remote'],
    gaps: ['React Native / Flutter Native Bridges', 'Offline-First Sync Engines', 'Mobile App Security & Reverse Engineering Defense', 'App Vitals & Cold-Start Optimization']
  },
  {
    roleFrom: 'Security Analyst (SOC)',
    roleTo: 'Chief Information Security Officer (CISO)',
    cat: 'Technology, Cloud & AI',
    ind: 'Cybersecurity & Enterprise Resilience',
    lvl: 'executive',
    cMin: 8.5,
    cMax: 52.0,
    time: 5,
    cities: ['Mumbai', 'Delhi-NCR', 'Dubai / UAE'],
    gaps: ['Zero Trust Network Architecture', 'Board Cyber Risk & Ransomware Defense', 'ISO 27001 / SOC 2 Type II Certifications', 'Incident Crisis Communication']
  },
  {
    roleFrom: 'AI Research Intern',
    roleTo: 'Applied Generative AI Engineer',
    cat: 'Technology, Cloud & AI',
    ind: 'Generative AI & LLM Engineering',
    lvl: 'fresher',
    cMin: 6.0,
    cMax: 19.0,
    time: 3.5,
    cities: ['Bengaluru', 'Hyderabad', 'Remote'],
    gaps: ['LangChain / LlamaIndex Orchestration', 'Vector DB Indexing (Pinecone/Milvus)', 'Quantization & LoRA Fine-Tuning', 'AI Agent Multi-Step Reasoning']
  },

  // ── Data Science & Big Data (5 more)
  {
    roleFrom: 'SQL Data Analyst',
    roleTo: 'Big Data Pipeline Engineer',
    cat: 'Data Science & Big Data',
    ind: 'Big Data Infrastructure',
    lvl: 'mid',
    cMin: 5.2,
    cMax: 16.5,
    time: 4,
    cities: ['Bengaluru', 'Pune', 'Hyderabad'],
    gaps: ['Apache Spark / PySpark Optimization', 'Snowflake & dbt Data Modeling', 'Airflow Directed Acyclic Graphs (DAGs)', 'Delta Lake & Parquet Formats']
  },
  {
    roleFrom: 'Data Analyst',
    roleTo: 'Generative AI Product Manager',
    cat: 'Data Science & Big Data',
    ind: 'AI Product Strategy',
    lvl: 'senior',
    cMin: 9.0,
    cMax: 29.0,
    time: 4,
    cities: ['Bengaluru', 'Gurugram', 'Dubai / UAE'],
    gaps: ['LLM Evaluation Benchmarks (RAG Triad)', 'AI Tokenomics & Unit Economics', 'Responsible AI & Hallucination Guardrails', 'User Workflow AI UX Design']
  },
  {
    roleFrom: 'Quantitative Analyst',
    roleTo: 'Principal AI Scientist',
    cat: 'Data Science & Big Data',
    ind: 'Deep Learning & Neural Architectures',
    lvl: 'executive',
    cMin: 14.0,
    cMax: 46.0,
    time: 5,
    cities: ['Bengaluru', 'Mumbai', 'US / Remote'],
    gaps: ['Transformer Attention Mechanisms', 'Self-Supervised Representation Learning', 'Distributed GPU Cluster Training (DeepSpeed)', 'Mathematical Proofs & Research Publications']
  },
  {
    roleFrom: 'BI Developer',
    roleTo: 'Chief Data Officer (CDO)',
    cat: 'Data Science & Big Data',
    ind: 'Enterprise Data Governance',
    lvl: 'executive',
    cMin: 12.0,
    cMax: 55.0,
    time: 5,
    cities: ['Mumbai', 'Bengaluru', 'Delhi-NCR'],
    gaps: ['Enterprise Data Mesh Architecture', 'Chief Data Governance & Privacy Policies', 'Monetizing Proprietary Data Assets', 'Executive Data Culture Transformation']
  },
  {
    roleFrom: 'Junior Data Engineer',
    roleTo: 'Real-Time Streaming Architect',
    cat: 'Data Science & Big Data',
    ind: 'Stream Processing',
    lvl: 'senior',
    cMin: 8.0,
    cMax: 25.0,
    time: 4,
    cities: ['Bengaluru', 'Hyderabad', 'Chennai'],
    gaps: ['Apache Flink Stateful Stream Processing', 'Kafka Streams & Schema Registry', 'Sub-Second Anomaly Detection Systems', 'Exactly-Once Processing Semantics']
  },

  // ── Finance, Banking & FinTech (5 more)
  {
    roleFrom: 'Branch Relationship Manager',
    roleTo: 'FinTech Lending Product Manager',
    cat: 'Finance, Banking & FinTech',
    ind: 'Digital Lending & Neo-Banking',
    lvl: 'mid',
    cMin: 5.5,
    cMax: 18.0,
    time: 4,
    cities: ['Mumbai', 'Bengaluru', 'Gurugram'],
    gaps: ['Digital Onboarding & Video KYC Flows', 'Alternative Credit Scoring Algorithms', 'LSP / DLRE Regulatory Compliance', 'Loan Origination System (LOS) Integration']
  },
  {
    roleFrom: 'Credit Analyst',
    roleTo: 'Chief Risk Officer (CRO) FinTech',
    cat: 'Finance, Banking & FinTech',
    ind: 'Risk Governance & Underwriting',
    lvl: 'executive',
    cMin: 11.0,
    cMax: 48.0,
    time: 5,
    cities: ['Mumbai', 'Bengaluru', 'Dubai / UAE'],
    gaps: ['Portfolio Default Risk & Expected Loss (ECL)', 'Asset-Liability Management (ALM) Modeling', 'RBI Audit & Capital Adequacy Defense', 'Stress-Testing Extreme Macro Shocks']
  },
  {
    roleFrom: 'Equity Research Associate',
    roleTo: 'Portfolio Fund Manager',
    cat: 'Finance, Banking & FinTech',
    ind: 'Public Equities Asset Management',
    lvl: 'senior',
    cMin: 12.0,
    cMax: 42.0,
    time: 4.5,
    cities: ['Mumbai', 'Singapore'],
    gaps: ['Alpha Generation Investment Strategies', 'Factor Investing & Risk Factor Attribution', 'Investment Committee Pitch Delivery', 'Sector Rotational Momentum Modeling']
  },
  {
    roleFrom: 'Operations Officer (Banking)',
    roleTo: 'Payments Infrastructure Director',
    cat: 'Finance, Banking & FinTech',
    ind: 'Global Payments & Cross-Border Rails',
    lvl: 'senior',
    cMin: 6.5,
    cMax: 26.0,
    time: 4,
    cities: ['Mumbai', 'Bengaluru', 'Dubai / UAE'],
    gaps: ['ISO 20022 Financial Messaging', 'Cross-Border Nostro/Vostro Reconciliation', 'UPI Switch Architecture & Interchange Rules', 'Payment Gateway Surcharge Governance']
  },
  {
    roleFrom: 'FinTech Operations Lead',
    roleTo: 'Head of Treasury & Capital Markets',
    cat: 'Finance, Banking & FinTech',
    ind: 'Corporate Treasury',
    lvl: 'executive',
    cMin: 15.0,
    cMax: 45.0,
    time: 5,
    cities: ['Mumbai', 'Delhi-NCR', 'London / Remote'],
    gaps: ['FX Currency Hedging Options & Forwards', 'Debt Syndication & Commercial Paper Issuance', 'Liquidity Buffer Management (LCR)', 'Rating Agency (CRISIL/ICRA) Upgrades']
  },

  // ── CA, Audit & Accounting (5 more)
  {
    roleFrom: 'Junior Tax Consultant',
    roleTo: 'Transfer Pricing & Cross-Border Tax Director',
    cat: 'CA, Audit & Accounting',
    ind: 'International Tax & Base Erosion',
    lvl: 'executive',
    cMin: 9.0,
    cMax: 36.0,
    time: 4.5,
    cities: ['Mumbai', 'Gurugram', 'Dubai / UAE'],
    gaps: ['OECD BEPS Pillar 1 & Pillar 2 Rules', 'Intercompany Master File & Local File Benchmarks', 'Advance Pricing Agreements (APA) with CBDT', 'Attribution of Profits to Permanent Establishments']
  },
  {
    roleFrom: 'Audit Senior (Big 4)',
    roleTo: 'Financial Controller (Listed Co)',
    cat: 'CA, Audit & Accounting',
    ind: 'Corporate Accounting & Ind AS',
    lvl: 'senior',
    cMin: 11.5,
    cMax: 28.0,
    time: 4,
    cities: ['Mumbai', 'Bengaluru', 'Delhi-NCR', 'Ahmedabad'],
    gaps: ['Ind AS 115 / 116 Revenue & Lease Standards', 'Quarterly SEBI Financial Statement Filings', 'ERP Financial Consolidation (SAP S/4HANA)', 'Managing Statutory Audit Committee Inquiries']
  },
  {
    roleFrom: 'Cost Accountant (CMA)',
    roleTo: 'Industrial Plant Controller',
    cat: 'CA, Audit & Accounting',
    ind: 'Cost Accounting & Manufacturing Control',
    lvl: 'senior',
    cMin: 6.8,
    cMax: 22.0,
    time: 4,
    cities: ['Pune', 'Vadodara', 'Chennai', 'Jamshedpur'],
    gaps: ['Standard Costing & Material Variance Diagnostics', 'Activity-Based Costing (ABC) for Factory Lines', 'Scrap Recovery & Inventory Revaluation', 'Capex Project Payback Financial Modeling']
  },
  {
    roleFrom: 'Bookkeeper / Accounts Exec',
    roleTo: 'US GAAP & SEC Reporting Specialist',
    cat: 'CA, Audit & Accounting',
    ind: 'US GAAP / IFRS Reporting',
    lvl: 'mid',
    cMin: 4.5,
    cMax: 14.5,
    time: 3.5,
    cities: ['Hyderabad', 'Bengaluru', 'Gurugram', 'Noida'],
    gaps: ['US GAAP Codification (ASC 606 & ASC 842)', 'SEC Form 10-K & 10-Q Disclosure Rules', 'Stock-Based Compensation (ASC 718) Accounting', 'Workiva / SOX Documentation Workflows']
  },
  {
    roleFrom: 'Forensic Audit Assistant',
    roleTo: 'Head of Fraud Risk & Forensics',
    cat: 'CA, Audit & Accounting',
    ind: 'Forensic Investigations',
    lvl: 'executive',
    cMin: 8.5,
    cMax: 38.0,
    time: 4.5,
    cities: ['Mumbai', 'Delhi-NCR', 'Dubai / UAE'],
    gaps: ['Digital Forensics (EnCase & Nuix)', 'Corporate Embezzlement Fund Tracing', 'Whistleblower Interview Protocols', 'Expert Witness Testimony Preparation']
  },

  // ── Healthcare, Pharma & Biotech (5 more)
  {
    roleFrom: 'Hospital Staff Nurse',
    roleTo: 'Clinical Research Coordinator (CRC)',
    cat: 'Healthcare, Pharma & Biotech',
    ind: 'Clinical Trials & Patient Safety',
    lvl: 'fresher',
    cMin: 3.5,
    cMax: 8.8,
    time: 3.5,
    cities: ['Kochi', 'Bengaluru', 'Chennai', 'Mumbai'],
    gaps: ['ICH-GCP Guidelines & Informed Consent', 'Electronic Data Capture (EDC / Medidata)', 'Adverse Event (AE) Reporting Timelines', 'Clinical Protocol Adherence Audits']
  },
  {
    roleFrom: 'Clinical Research Associate (CRA)',
    roleTo: 'Clinical Trial Project Manager',
    cat: 'Healthcare, Pharma & Biotech',
    ind: 'Global Clinical Operations',
    lvl: 'senior',
    cMin: 8.0,
    cMax: 24.0,
    time: 4,
    cities: ['Hyderabad', 'Bengaluru', 'Mumbai'],
    gaps: ['Site Initiation & Monitoring Plan Governance', 'Investigator Grant Budgeting & Contracts', 'FDA / EMA Regulatory Inspection Readiness', 'CRO Vendor Performance Oversight']
  },
  {
    roleFrom: 'QC Lab Chemist',
    roleTo: 'Head of GMP Quality Assurance',
    cat: 'Healthcare, Pharma & Biotech',
    ind: 'Pharma Manufacturing QA',
    lvl: 'senior',
    cMin: 4.8,
    cMax: 22.0,
    time: 4,
    cities: ['Ahmedabad', 'Hyderabad', 'Baddi', 'Goa'],
    gaps: ['US FDA 21 CFR Part 210/211 Regulations', 'Out of Specification (OOS) & CAPA Systems', 'Cleanroom HVAC & Water System Validation', 'Data Integrity & Audit Trail Review']
  },
  {
    roleFrom: 'Pharmacovigilance Associate',
    roleTo: 'Global Safety Physician / Director',
    cat: 'Healthcare, Pharma & Biotech',
    ind: 'Drug Safety & Pharmacovigilance',
    lvl: 'executive',
    cMin: 9.5,
    cMax: 36.0,
    time: 4.5,
    cities: ['Bengaluru', 'Mumbai', 'Delhi-NCR'],
    gaps: ['Aggregate Safety Reports (PSUR / PBRER)', 'Signal Detection & Risk Management Plans (RMP)', 'Global Safety Database Administration (Argus)', 'Benefit-Risk Assessment for Health Authorities']
  },
  {
    roleFrom: 'Biotech Lab Technician',
    roleTo: 'Bioinformatics Lead',
    cat: 'Healthcare, Pharma & Biotech',
    ind: 'Computational Biology & Genomics',
    lvl: 'mid',
    cMin: 5.0,
    cMax: 16.5,
    time: 4,
    cities: ['Bengaluru', 'Hyderabad', 'Pune'],
    gaps: ['Next-Gen Sequencing (NGS) Pipeline Analysis', 'Python / Biopython & R/Bioconductor', 'Structural Protein Modeling (AlphaFold)', 'Variant Calling & Genomic Annotation']
  },

  // ── Supply Chain, Logistics & Maritime (5 more)
  {
    roleFrom: 'Logistics Coordinator',
    roleTo: 'Head of National Logistics & 3PL',
    cat: 'Supply Chain, Logistics & Maritime',
    ind: 'Freight & Fleet Operations',
    lvl: 'senior',
    cMin: 5.5,
    cMax: 26.0,
    time: 4,
    cities: ['Mumbai', 'Delhi-NCR', 'Kolkata', 'Chennai'],
    gaps: ['3PL SLA Benchmarking & RFP Negotiations', 'Transportation Management System (TMS) Setup', 'Multi-Modal Route Optimization (Rail/Road)', 'Transit Damage Containment & Cold-Chain']
  },
  {
    roleFrom: 'Import/Export Executive',
    roleTo: 'Global Trade Compliance Director',
    cat: 'Supply Chain, Logistics & Maritime',
    ind: 'Customs & International Trade Law',
    lvl: 'senior',
    cMin: 6.0,
    cMax: 24.0,
    time: 4,
    cities: ['Mumbai', 'Chennai', 'Delhi-NCR', 'Dubai / UAE'],
    gaps: ['Harmonized Tariff Schedule (HS Code) Audits', 'Free Trade Agreements (FTA) Rules of Origin', 'Sanctions & Export Control Regulations (EAR/ITAR)', 'AEO (Authorized Economic Operator) Certification']
  },
  {
    roleFrom: 'Warehouse Clerk',
    roleTo: 'Warehouse Automation & WMS Lead',
    cat: 'Supply Chain, Logistics & Maritime',
    ind: 'Smart Warehousing & AGVs',
    lvl: 'mid',
    cMin: 3.8,
    cMax: 14.0,
    time: 3.5,
    cities: ['Bhiwandi', 'Gurugram', 'Bengaluru', 'Pune'],
    gaps: ['Manhattan / SAP EWM Implementation', 'Autonomous Mobile Robots (AMR / AGV) Layouts', 'Pick-to-Light & Voice Picking Technologies', 'Slotting Optimization & Cubic Utilization']
  },
  {
    roleFrom: 'Marine Deck Officer',
    roleTo: 'Port & Terminal Operations Director',
    cat: 'Supply Chain, Logistics & Maritime',
    ind: 'Maritime & Port Management',
    lvl: 'executive',
    cMin: 12.0,
    cMax: 45.0,
    time: 4.5,
    cities: ['Mumbai', 'Mundra', 'Kochi', 'Dubai / UAE', 'Singapore'],
    gaps: ['Berth Allocation & Quay Crane Productivity', 'ISPS Maritime Security Protocols', 'Bunkering Operations & IMO 2020 Compliance', 'Dredging & Concession Agreement Negotiations']
  },
  {
    roleFrom: 'Supply Chain Analyst',
    roleTo: 'VP of Global Operations & SCM',
    cat: 'Supply Chain, Logistics & Maritime',
    ind: 'End-to-End Supply Chain Strategy',
    lvl: 'executive',
    cMin: 14.0,
    cMax: 54.0,
    time: 5,
    cities: ['Mumbai', 'Gurugram', 'Dubai / UAE', 'Singapore'],
    gaps: ['Supply Chain Digital Twin Architecture', 'Global Geopolitical Nearshoring Strategy', 'Working Capital Cash Conversion Cycle', 'Board-Level SCM Sustainability Targets']
  },

  // ── Marketing, Growth & D2C (5 more)
  {
    roleFrom: 'SEO Specialist',
    roleTo: 'VP of Organic Growth & SEO',
    cat: 'Marketing, Growth & D2C',
    ind: 'Search Intelligence & Programmatic SEO',
    lvl: 'executive',
    cMin: 7.0,
    cMax: 34.0,
    time: 4.5,
    cities: ['Bengaluru', 'Gurugram', 'Remote'],
    gaps: ['Programmatic SEO Page Architecture (100K+ URLs)', 'Core Web Vitals & Crawl Budget Engineering', 'Search Intent Clustering & Information Gain', 'Brand Authority Entity Graph Building']
  },
  {
    roleFrom: 'Copywriter / Content Lead',
    roleTo: 'Agency Creative Director',
    cat: 'Marketing, Growth & D2C',
    ind: 'Creative Advertising & Campaign Strategy',
    lvl: 'senior',
    cMin: 5.5,
    cMax: 26.0,
    time: 4,
    cities: ['Mumbai', 'Delhi-NCR', 'Bengaluru'],
    gaps: ['Multi-Media Integrated Campaign Pitching', 'Directing Film, TVC & Digital Commercials', 'Brand Archetype & Verbal Identity Formulation', 'Creative Team Leadership & Cannes/Goafest Strategy']
  },
  {
    roleFrom: 'CRM / Email Specialist',
    roleTo: 'Director of Retention & Lifecycle Marketing',
    cat: 'Marketing, Growth & D2C',
    ind: 'Customer Retention & LTV Optimization',
    lvl: 'senior',
    cMin: 6.0,
    cMax: 25.0,
    time: 4,
    cities: ['Bengaluru', 'Mumbai', 'Dubai / UAE'],
    gaps: ['MoEngage / Clevertap Journey Orchestration', 'RFM (Recency, Frequency, Monetary) Segmentation', 'Churn Prevention Machine Learning Triggers', 'Push/SMS/WhatsApp Transactional Funnel Architecture']
  },
  {
    roleFrom: 'Affiliate Associate',
    roleTo: 'Head of Partnerships & Influencer Marketing',
    cat: 'Marketing, Growth & D2C',
    ind: 'Creator Economy & Affiliates',
    lvl: 'mid',
    cMin: 4.2,
    cMax: 16.5,
    time: 3.5,
    cities: ['Mumbai', 'Delhi-NCR', 'Bengaluru'],
    gaps: ['Tier-1 Celebrity & Macro Influencer Contracting', 'Affiliate Tracking Postbacks & Fraud Detection', 'Co-Branded D2C Capsule Collection Launches', 'Creator ROI & Attribution Modeling']
  },
  {
    roleFrom: 'Growth Marketing Associate',
    roleTo: 'Chief Commercial Officer (CCO)',
    cat: 'Marketing, Growth & D2C',
    ind: 'Revenue Growth & Commercial Expansion',
    lvl: 'executive',
    cMin: 15.0,
    cMax: 68.0,
    time: 5,
    cities: ['Bengaluru', 'Mumbai', 'Dubai / UAE', 'London / Remote'],
    gaps: ['Pricing Architecture & Discount Containment', 'Omnichannel Customer Acquisition Unit Economics', 'International Footprint Commercial Entry', 'Investor Board Revenue Presentation']
  },

  // ── Sales & Enterprise BD (5 more)
  {
    roleFrom: 'B2B Sales Representative',
    roleTo: 'Director of Strategic Key Accounts',
    cat: 'Sales & Enterprise BD',
    ind: 'Global Key Account Management',
    lvl: 'senior',
    cMin: 7.0,
    cMax: 28.0,
    time: 4,
    cities: ['Mumbai', 'Delhi-NCR', 'Bengaluru'],
    gaps: ['Multi-Year Master Service Agreement Defense', 'Account White-Space Penetration Mapping', 'Executive Sponsorship Cadence (CxO Roundtables)', 'Enterprise Contract Inflation Escalation Clauses']
  },
  {
    roleFrom: 'Government Tender Sales Officer',
    roleTo: 'VP of Public Sector & Defense BD',
    cat: 'Sales & Enterprise BD',
    ind: 'Defense & Government Procurement',
    lvl: 'executive',
    cMin: 9.0,
    cMax: 38.0,
    time: 4.5,
    cities: ['New Delhi', 'Hyderabad', 'Bengaluru'],
    gaps: ['GeM (Government e-Marketplace) Rules', 'Defense Offset Obligations & Joint Ventures', 'CPWD / PSU RFP Technical Compliance Defense', 'Security Clearance & Sovereign Contracting']
  },
  {
    roleFrom: 'Telemarketing Associate',
    roleTo: 'Inside Sales & SDR Manager',
    cat: 'Sales & Enterprise BD',
    ind: 'Inbound / Outbound Lead Qualification',
    lvl: 'mid',
    cMin: 3.5,
    cMax: 11.5,
    time: 3,
    cities: ['Noida', 'Gurugram', 'Bengaluru', 'Indore'],
    gaps: ['SalesLoft / Outreach Sequence Engineering', 'Cold Call Objection Handling Rubrics', 'Pipeline Conversion Velocity Auditing', 'Managing Global 24/7 SDR Shifts']
  },
  {
    roleFrom: 'Enterprise Account Executive',
    roleTo: 'Commercial Director (Middle East & GCC)',
    cat: 'Sales & Enterprise BD',
    ind: 'Middle East Tech Expansion',
    lvl: 'executive',
    cMin: 18.0,
    cMax: 55.0,
    time: 4.5,
    cities: ['Dubai / UAE', 'Riyadh / Saudi Arabia'],
    gaps: ['Saudi Vision 2030 Procurement Frameworks', 'Regional HQ (RHQ) Setup in Riyadh', 'Arabic Enterprise Business Etiquette', 'Dirham/Riyal Currency Structured Contracts']
  },
  {
    roleFrom: 'Field Sales Officer',
    roleTo: 'Head of Institutional Sales',
    cat: 'Sales & Enterprise BD',
    ind: 'B2B Institutional Supply',
    lvl: 'senior',
    cMin: 5.5,
    cMax: 22.0,
    time: 4,
    cities: ['Mumbai', 'Ahmedabad', 'Delhi-NCR'],
    gaps: ['Institutional Credit Risk & Payment Terms', 'Annual Corporate Supply Rate Contracts', 'Distribution Partner Network Governance', 'Trade Scheme & Incentive Architecture']
  },

  // ── Product Management & UX (5 more)
  {
    roleFrom: 'Scrum Master / Agile Coach',
    roleTo: 'Senior Technical Product Manager (TPM)',
    cat: 'Product Management & UX',
    ind: 'Technical Product Management',
    lvl: 'senior',
    cMin: 10.0,
    cMax: 27.0,
    time: 4,
    cities: ['Bengaluru', 'Hyderabad', 'Pune'],
    gaps: ['API Contract Design & Microservices PRDs', 'Cloud Infrastructure Cost vs Scalability Tradeoffs', 'Technical Debt Prioritization Matrices', 'Engineering Team Velocity Alignment']
  },
  {
    roleFrom: 'UI Designer',
    roleTo: 'VP of Global Product Design',
    cat: 'Product Management & UX',
    ind: 'Design Systems & Product Experience',
    lvl: 'executive',
    cMin: 8.0,
    cMax: 44.0,
    time: 5,
    cities: ['Bengaluru', 'Mumbai', 'Remote'],
    gaps: ['Multi-Brand Universal Design System Scaling', 'Design Ops & Tokenized Component Governance', 'User Research ROI to Business Metrics', 'Leading Multi-Country Design Organizations']
  },
  {
    roleFrom: 'Customer Success Manager',
    roleTo: 'Product-Led Growth (PLG) Manager',
    cat: 'Product Management & UX',
    ind: 'Product-Led Growth & Onboarding',
    lvl: 'mid',
    cMin: 6.0,
    cMax: 19.5,
    time: 3.5,
    cities: ['Bengaluru', 'Delhi-NCR', 'Remote'],
    gaps: ['Self-Serve Activation Funnel Optimization', 'In-App Onboarding Walkthrough Engineering', 'Freemium to Paid Paywall Experimentation', 'Cohort Retention & Product Analytics (Mixpanel/Amplitude)']
  },
  {
    roleFrom: 'QA Automation Lead',
    roleTo: 'Director of Product Quality & Release',
    cat: 'Product Management & UX',
    ind: 'Product Quality & Release Management',
    lvl: 'executive',
    cMin: 12.0,
    cMax: 35.0,
    time: 4.5,
    cities: ['Bengaluru', 'Hyderabad', 'Pune'],
    gaps: ['Zero-Downtime Deployment Governance', 'Chaos Engineering & Resilience Auditing', 'Automated Performance Regression Gates', 'Compliance & Accessibility (WCAG 2.1 AAA)']
  },
  {
    roleFrom: 'UX Researcher',
    roleTo: 'Head of User Experience & Behavioral Insights',
    cat: 'Product Management & UX',
    ind: 'Behavioral UX & Customer Psychology',
    lvl: 'senior',
    cMin: 7.5,
    cMax: 26.0,
    time: 4,
    cities: ['Bengaluru', 'Mumbai', 'Remote'],
    gaps: ['Generative AI Usability Testing Methodologies', 'Card Sorting & Information Architecture Audits', 'Quant UX Analytics & Survey Statistical Rigor', 'Synthesizing User Insights for C-Suite Execs']
  },

  // ── Legal, Governance & Tech Policy (5 more)
  {
    roleFrom: 'Contract Administrator',
    roleTo: 'Director of Legal Operations & CLM',
    cat: 'Legal, Governance & Tech Policy',
    ind: 'Legal Operations & Automation',
    lvl: 'senior',
    cMin: 5.5,
    cMax: 25.0,
    time: 4,
    cities: ['Bengaluru', 'Mumbai', 'Gurugram'],
    gaps: ['Contract Lifecycle Management (Ironclad/Icertis)', 'Outside Counsel Spend Management & Billing Rules', 'Legal KPI Dashboards & Cycle Time Metrics', 'Automated NDAs and Standard Terms Deployment']
  },
  {
    roleFrom: 'Junior Company Secretary (CS)',
    roleTo: 'Group Company Secretary & Board Advisor',
    cat: 'Legal, Governance & Tech Policy',
    ind: 'Corporate Secretarial & Board Affairs',
    lvl: 'executive',
    cMin: 6.5,
    cMax: 36.0,
    time: 4.5,
    cities: ['Mumbai', 'Delhi-NCR', 'Kolkata'],
    gaps: ['Companies Act 2013 Governance Standards', 'SEBI (LODR) Listing Compliance Protocols', 'Conducting Board & Shareholder AGMs', 'Related Party Transactions & Insider Trading Controls']
  },
  {
    roleFrom: 'IP Paralegal',
    roleTo: 'Head of Intellectual Property & Patents',
    cat: 'Legal, Governance & Tech Policy',
    ind: 'IP Portfolio & Patent Prosecution',
    lvl: 'senior',
    cMin: 5.0,
    cMax: 30.0,
    time: 4,
    cities: ['Bengaluru', 'Delhi-NCR', 'Hyderabad'],
    gaps: ['Patent Freedom-to-Operate (FTO) Search', 'Drafting Software & Hardware Patent Claims', 'PCT International Filing & USPTO Prosecution', 'IP Monetization & Licensing Negotiation']
  },
  {
    roleFrom: 'Privacy Compliance Analyst',
    roleTo: 'Data Protection Officer (DPO)',
    cat: 'Legal, Governance & Tech Policy',
    ind: 'Data Privacy & Cross-Border Sovereign Data',
    lvl: 'senior',
    cMin: 7.0,
    cMax: 27.0,
    time: 4,
    cities: ['Bengaluru', 'Delhi-NCR', 'Dubai / UAE'],
    gaps: ['Data Protection Impact Assessments (DPIA)', 'India DPDP Act & EU GDPR Cross-Border Data Flows', 'Managing Data Breach Notifications to Authorities', 'Privacy-by-Design Technical Architecture Audits']
  },
  {
    roleFrom: 'FinTech Legal Associate',
    roleTo: 'Head of Global Regulatory Licensing',
    cat: 'Legal, Governance & Tech Policy',
    ind: 'FinTech Regulatory Licensing',
    lvl: 'executive',
    cMin: 10.0,
    cMax: 42.0,
    time: 4.5,
    cities: ['Mumbai', 'Dubai / UAE', 'Singapore'],
    gaps: ['Payment Aggregator (PA) Licensing with RBI', 'DIFC / ADGM Category 3A/4 Financial Licensing', 'Regulatory Sandbox Testing Frameworks', 'Anti-Money Laundering (AML) Travel Rule Systems']
  },

  // ── Core Engineering & Industrial IoT (5 more)
  {
    roleFrom: 'Mechanical Quality Inspector',
    roleTo: 'Six Sigma Master Black Belt & Lean Head',
    cat: 'Core Engineering & Industrial IoT',
    ind: 'Operational Excellence & Six Sigma',
    lvl: 'senior',
    cMin: 4.5,
    cMax: 21.0,
    time: 4,
    cities: ['Pune', 'Chennai', 'Vadodara', 'Coimbatore'],
    gaps: ['DMAIC Statistical Toolset (Minitab / ANOVA)', 'Value Stream Mapping (VSM) Across Plants', 'Design of Experiments (DOE) Process Optimization', 'Coaching Green Belts & Executive Cost Savings']
  },
  {
    roleFrom: 'Maintenance Technician',
    roleTo: 'Asset Reliability & Predictive Maintenance Lead',
    cat: 'Core Engineering & Industrial IoT',
    ind: 'Predictive Maintenance & IoT Sensors',
    lvl: 'mid',
    cMin: 3.8,
    cMax: 14.5,
    time: 3.5,
    cities: ['Pune', 'Jamshedpur', 'Ahmedabad'],
    gaps: ['Vibration Analysis & Thermography Diagnostics', 'Mean Time Between Failures (MTBF) Maximization', 'IoT Vibration Sensors to Cloud Edge Gateways', 'Root Cause Failure Analysis (RCFA) Standards']
  },
  {
    roleFrom: 'Automotive Electrical Engineer',
    roleTo: 'EV Battery Management System (BMS) Architect',
    cat: 'Core Engineering & Industrial IoT',
    ind: 'Electric Vehicles & Powertrain',
    lvl: 'senior',
    cMin: 7.5,
    cMax: 26.0,
    time: 4,
    cities: ['Bengaluru', 'Pune', 'Chennai'],
    gaps: ['State-of-Charge (SoC) & State-of-Health (SoH) Algorithms', 'Thermal Runaway Detection & Protection Hardware', 'CAN-Bus / ISO 26262 Functional Safety (ASIL-D)', 'High-Voltage Traction Battery Pack Architecture']
  },
  {
    roleFrom: 'Tooling & Die Designer',
    roleTo: 'Additive Manufacturing & 3D Print Lead',
    cat: 'Core Engineering & Industrial IoT',
    ind: 'Advanced Additive Manufacturing',
    lvl: 'mid',
    cMin: 4.8,
    cMax: 17.5,
    time: 3.5,
    cities: ['Bengaluru', 'Pune', 'Chennai'],
    gaps: ['Design for Additive Manufacturing (DfAM)', 'Selective Laser Sintering (SLS) & Metal 3D Printing', 'Topology Optimization & Generative CAD Design', 'Post-Processing & Heat Treatment Metallurgy']
  },
  {
    roleFrom: 'Safety / EHS Officer',
    roleTo: 'VP of Environmental Health, Safety & Sustainability',
    cat: 'Core Engineering & Industrial IoT',
    ind: 'Industrial Safety & Zero-Harm Operations',
    lvl: 'executive',
    cMin: 5.5,
    cMax: 35.0,
    time: 5,
    cities: ['Mumbai', 'Vadodara', 'Delhi-NCR', 'Chennai'],
    gaps: ['ISO 45001 & ISO 14001 Enterprise Frameworks', 'Process Safety Management (PSM) in Chemical Plants', 'Zero Fatalities Industrial Culture Transformation', 'Scope 1 & 2 Emissions Abatement Engineering']
  },

  // ── Energy, CleanTech & Oil/Gas (5 more)
  {
    roleFrom: 'Solar Rooftop Installer',
    roleTo: 'Utility-Scale Solar Project Manager',
    cat: 'Energy, CleanTech & Oil/Gas',
    ind: 'Renewable Solar Power',
    lvl: 'mid',
    cMin: 3.8,
    cMax: 15.5,
    time: 3.5,
    cities: ['Jaipur', 'Ahmedabad', 'Bengaluru', 'Delhi-NCR'],
    gaps: ['PVsyst Yield Simulation & Shadow Analysis', 'High-Voltage Substation Interconnection (33kV/132kV)', 'Central Inverter & Tracker System Engineering', 'PPA (Power Purchase Agreement) Milestone Delivery']
  },
  {
    roleFrom: 'Petrochem Process Operator',
    roleTo: 'Green Hydrogen & Electrolyzer Engineer',
    cat: 'Energy, CleanTech & Oil/Gas',
    ind: 'Green Hydrogen & Decarbonization',
    lvl: 'senior',
    cMin: 6.0,
    cMax: 23.0,
    time: 4,
    cities: ['Jamnagar', 'Kochi', 'Vizag', 'Dubai / UAE'],
    gaps: ['PEM / Alkaline Electrolyzer Stack Engineering', 'High-Pressure Hydrogen Compression & Storage', 'Levelized Cost of Hydrogen (LCOH) Economic Modeling', 'Hazardous Area Safety (ATEX / IECEx) Protocols']
  },
  {
    roleFrom: 'Wind Turbine Maintenance Tech',
    roleTo: 'Offshore Wind Farm Operations Director',
    cat: 'Energy, CleanTech & Oil/Gas',
    ind: 'Wind Power Generation',
    lvl: 'senior',
    cMin: 4.8,
    cMax: 28.0,
    time: 4,
    cities: ['Chennai', 'Tuticorin', 'Gujarat Coast'],
    gaps: ['SCADA Wind Resource Monitoring & Yaw Control', 'Offshore Vessel Logistics & Marine Safety', 'Gearbox & Generator Predictive Maintenance', 'Grid Curtailment & Power Forecasting Compliance']
  },
  {
    roleFrom: 'Energy Auditor',
    roleTo: 'VP of Decarbonization & Carbon Markets',
    cat: 'Energy, CleanTech & Oil/Gas',
    ind: 'Carbon Offsets & ESG Markets',
    lvl: 'executive',
    cMin: 7.5,
    cMax: 40.0,
    time: 5,
    cities: ['Delhi-NCR', 'Mumbai', 'London / Remote'],
    gaps: ['GHG Protocol Corporate Standard (Scope 1, 2, 3)', 'Article 6 Paris Agreement Carbon Credits', 'Science-Based Targets initiative (SBTi) Roadmaps', 'Carbon Border Adjustment Mechanism (CBAM) Advisory']
  },
  {
    roleFrom: 'Substation Engineer',
    roleTo: 'Battery Energy Storage Systems (BESS) Architect',
    cat: 'Energy, CleanTech & Oil/Gas',
    ind: 'Grid Battery Storage & Microgrids',
    lvl: 'senior',
    cMin: 6.5,
    cMax: 24.5,
    time: 4,
    cities: ['Bengaluru', 'Delhi-NCR', 'Pune'],
    gaps: ['Lithium-Ion / Flow Battery Degradation Curves', 'Grid Frequency Regulation & Peak Shaving Dispatch', 'Power Conversion System (PCS) Inverters', 'Microgrid Controller (MGC) Islanding Architecture']
  },

  // ── Telecom, 5G & SpaceTech (5 more)
  {
    roleFrom: 'Fiber Splicer / Technician',
    roleTo: 'FTTx National Rollout Director',
    cat: 'Telecom, 5G & SpaceTech',
    ind: 'Broadband Infrastructure & FTTx',
    lvl: 'senior',
    cMin: 3.5,
    cMax: 22.0,
    time: 4,
    cities: ['Mumbai', 'Delhi-NCR', 'Hyderabad', 'Bengaluru'],
    gaps: ['Right-of-Way (RoW) Municipal Clearances', 'GPON / XGS-PON Optical Network Architecture', 'OTDR Testing & Link Loss Budget Calculations', 'Contractor Trenching & Micro-Ducting Management']
  },
  {
    roleFrom: 'Telecom Field Maintenance Eng',
    roleTo: 'Open-RAN & Telco Cloud Engineer',
    cat: 'Telecom, 5G & SpaceTech',
    ind: 'Open-RAN & Cloud Native Telecom',
    lvl: 'mid',
    cMin: 4.5,
    cMax: 18.0,
    time: 3.5,
    cities: ['Bengaluru', 'Gurugram', 'Pune'],
    gaps: ['O-RAN Architecture (CU / DU / RU Splits)', 'Kubernetes Telco Workloads & SR-IOV Networking', 'Network Slicing for Enterprise Private 5G', 'Linux Kernel Low-Latency Tuning (RT Kernel)']
  },
  {
    roleFrom: 'Ground Station Operator',
    roleTo: 'Satellite Mission Operations Director',
    cat: 'Telecom, 5G & SpaceTech',
    ind: 'Commercial SpaceTech & Satellites',
    lvl: 'executive',
    cMin: 7.0,
    cMax: 35.0,
    time: 4.5,
    cities: ['Bengaluru', 'Hyderabad', 'Thiruvananthapuram'],
    gaps: ['LEO Satellite Constellation Orbit Mechanics', 'Telemetry, Tracking & Command (TT&C) Protocols', 'IN-SPACe Regulatory Licensing for Satellites', 'Payload Downlink High-Throughput Processing']
  },
  {
    roleFrom: 'Data Cabling Tech',
    roleTo: 'Hyperscale Data Center Facility Director',
    cat: 'Telecom, 5G & SpaceTech',
    ind: 'Hyperscale Data Center Infrastructure',
    lvl: 'executive',
    cMin: 4.2,
    cMax: 32.0,
    time: 5,
    cities: ['Mumbai (Airoli)', 'Chennai', 'Noida'],
    gaps: ['Power Usage Effectiveness (PUE < 1.25) Optimization', 'Tier-IV Uptime Institute Conformance Audits', 'Liquid Cooling (Direct-to-Chip) for AI Clusters', 'High-Voltage Dual-Feed Substation Maintenance']
  },
  {
    roleFrom: 'Telco Billing Specialist',
    roleTo: 'BSS/OSS Digital Transformation Architect',
    cat: 'Telecom, 5G & SpaceTech',
    ind: 'Telco Software & Billing',
    lvl: 'senior',
    cMin: 6.0,
    cMax: 26.0,
    time: 4,
    cities: ['Pune', 'Gurugram', 'Bengaluru'],
    gaps: ['TM Forum Open Digital Architecture (ODA)', 'Convergent Charging Systems (CCS) for 5G', 'eSIM Profile Orchestration & Subscription Mgmt', 'Legacy Mainframe to Cloud Billing Migration']
  },

  // ── Real Estate & Infrastructure (5 more)
  {
    roleFrom: 'Residential Property Broker',
    roleTo: 'Commercial Grade-A Leasing Director',
    cat: 'Real Estate & Infrastructure',
    ind: 'Commercial Office Space Leasing',
    lvl: 'senior',
    cMin: 4.0,
    cMax: 28.0,
    time: 4,
    cities: ['Bengaluru', 'Mumbai', 'Gurugram', 'Hyderabad'],
    gaps: ['Fortune 500 Corporate RFP Leasing Proposals', 'REIT Portfolio Valuation & Yield Calculations', 'Triple-Net Lease (NNN) Legal Negotiations', 'Workplace Density & Occupancy Trends']
  },
  {
    roleFrom: 'Facility Maintenance Executive',
    roleTo: 'VP of Global Workplace & Corporate Real Estate',
    cat: 'Real Estate & Infrastructure',
    ind: 'Corporate Real Estate & Facilities',
    lvl: 'executive',
    cMin: 5.5,
    cMax: 35.0,
    time: 5,
    cities: ['Bengaluru', 'Mumbai', 'Gurugram'],
    gaps: ['Global Real Estate Portfolio Consolidation', 'Hybrid Work Workplace Tech & Sensor Utilization', 'Integrated Facilities Management (IFM) SLAs', 'Corporate Carbon Reduction in Commercial Buildings']
  },
  {
    roleFrom: 'MEP Project Engineer',
    roleTo: 'Smart Building Automation & BMS Architect',
    cat: 'Real Estate & Infrastructure',
    ind: 'Smart Buildings & HVAC Controls',
    lvl: 'mid',
    cMin: 5.0,
    cMax: 18.5,
    time: 3.5,
    cities: ['Bengaluru', 'Mumbai', 'Dubai / UAE'],
    gaps: ['BACnet / Modbus BMS Protocols', 'Variable Refrigerant Flow (VRF) & Chiller Optimization', 'Smart Lighting & Daylight Harvesting Controls', 'LEED Platinum / WELL Building Certification Audits']
  },
  {
    roleFrom: 'Interior Design Drafter',
    roleTo: 'Corporate Turnkey Fit-Out Project Director',
    cat: 'Real Estate & Infrastructure',
    ind: 'Commercial Interior Fit-Outs',
    lvl: 'senior',
    cMin: 4.2,
    cMax: 24.0,
    time: 4,
    cities: ['Bengaluru', 'Mumbai', 'Delhi-NCR'],
    gaps: ['Fast-Track Turnkey Construction Delivery', 'Acoustic & Fire-Rated Material Specifications', 'Subcontractor Procurement & Bill of Quantities (BOQ)', 'Client Handover Snag-List Clearance']
  },
  {
    roleFrom: 'Land Surveyor',
    roleTo: 'PropTech GIS & Spatial Intelligence Lead',
    cat: 'Real Estate & Infrastructure',
    ind: 'Spatial Intelligence & Land Records',
    lvl: 'mid',
    cMin: 3.8,
    cMax: 16.0,
    time: 3.5,
    cities: ['Hyderabad', 'Bengaluru', 'Delhi-NCR'],
    gaps: ['Drone LiDAR Point Cloud Processing', 'ArcGIS & QGIS Land Title Parcel Mapping', 'Digital Cadastral Survey Alignment', 'PropTech AI Land Parcel Valuation Models']
  },

  // ── Media, Gaming & Content (5 more)
  {
    roleFrom: 'Video Editor (Freelance)',
    roleTo: 'VFX Producer & Post-Production Head',
    cat: 'Media, Gaming & Content',
    ind: 'Film & OTT Post-Production',
    lvl: 'senior',
    cMin: 4.2,
    cMax: 24.0,
    time: 4,
    cities: ['Mumbai', 'Hyderabad', 'Chennai'],
    gaps: ['ShotGrid / ftrack VFX Pipeline Management', 'Bidding VFX Shots by Complexity & Asset Count', 'Color Grading Workflow (ACES / DaVinci Resolve)', 'Managing Multi-Studio Distributed Artist Teams']
  },
  {
    roleFrom: 'Game Quality Tester (QA)',
    roleTo: 'Lead Game Systems & Economy Designer',
    cat: 'Media, Gaming & Content',
    ind: 'Video Game Economy & Mechanics',
    lvl: 'mid',
    cMin: 3.5,
    cMax: 21.0,
    time: 4,
    cities: ['Bengaluru', 'Pune', 'Hyderabad'],
    gaps: ['In-Game Microtransaction Economic Modeling', 'Core Gameplay Loop Prototyping in Unity/Unreal', 'Player Progression Curves & Gacha Balance', 'Monetization Metrics (ARPPU, D1/D7/D30 Retention)']
  },
  {
    roleFrom: '2D Animator',
    roleTo: 'Unreal Engine Virtual Production Director',
    cat: 'Media, Gaming & Content',
    ind: 'Virtual Production & LED Volumes',
    lvl: 'senior',
    cMin: 4.2,
    cMax: 26.0,
    time: 4,
    cities: ['Mumbai', 'Hyderabad', 'Bengaluru'],
    gaps: ['Unreal Engine 5 Lumen & Nanite Optimization', 'LED Wall In-Camera Visual Effects (ICVFX)', 'Live Camera Tracking Systems (Stype / Mo-Sys)', 'Real-Time DMX Stage Lighting Synchronization']
  },
  {
    roleFrom: 'Content Moderator',
    roleTo: 'Director of Global Trust & Safety',
    cat: 'Media, Gaming & Content',
    ind: 'Platform Safety & AI Moderation',
    lvl: 'executive',
    cMin: 3.8,
    cMax: 32.0,
    time: 4.5,
    cities: ['Hyderabad', 'Bengaluru', 'Gurugram', 'Dubai / UAE'],
    gaps: ['Automated Multimodal Content Classification', 'CSAM / Terrorism Legal Reporting Escalations', 'Moderator Psychological Wellness Policies', 'Digital Services Act (DSA) Compliance Audits']
  },
  {
    roleFrom: 'Sound Recordist',
    roleTo: 'Spatial Audio & Dolby Atmos Architect',
    cat: 'Media, Gaming & Content',
    ind: 'Immersive Audio Engineering',
    lvl: 'mid',
    cMin: 3.8,
    cMax: 16.5,
    time: 3.5,
    cities: ['Mumbai', 'Chennai', 'Bengaluru'],
    gaps: ['Dolby Atmos Renderer 7.1.4 Bed & Object Mixing', 'Ambisonics & Binaural Audio for VR/Metaverse', 'Loudness Compliance (EBU R128 / ITU-R BS.1770)', 'High-End Studio Acoustic Room Tuning']
  },

  // ── Consulting & Strategy (7 more)
  {
    roleFrom: 'Operations Business Analyst',
    roleTo: 'Digital Transformation Delivery Lead',
    cat: 'Marketing, Growth & D2C',
    ind: 'Enterprise Digital Transformation',
    lvl: 'senior',
    cMin: 6.5,
    cMax: 23.0,
    time: 4,
    cities: ['Bengaluru', 'Mumbai', 'Gurugram', 'Dubai / UAE'],
    gaps: ['Change Management (Prosci ADKAR) Frameworks', 'Legacy Core System Modernization Roadmaps', 'Business Architecture & Process Capability Heatmaps', 'Executive Steering Committee Facilitation']
  },
  {
    roleFrom: 'Strategy Engagement Manager',
    roleTo: 'VP of Corporate Strategy & Chief of Staff',
    cat: 'Marketing, Growth & D2C',
    ind: 'Corporate Strategy & CEO Office',
    lvl: 'executive',
    cMin: 22.0,
    cMax: 56.0,
    time: 5,
    cities: ['Mumbai', 'Bengaluru', 'Delhi-NCR', 'Dubai / UAE'],
    gaps: ['Annual Strategic Planning & Board Retreats', 'Corporate Venture Capital (CVC) Deal Pipeline', 'Cross-Departmental OKR Cascading & Governance', 'Managing High-Urgency CEO Fire drills']
  },
  {
    roleFrom: 'PMO Project Coordinator',
    roleTo: 'VP of Global Enterprise PMO',
    cat: 'Marketing, Growth & D2C',
    ind: 'Strategic Enterprise Governance',
    lvl: 'executive',
    cMin: 5.5,
    cMax: 36.0,
    time: 5,
    cities: ['Bengaluru', 'Hyderabad', 'Pune'],
    gaps: ['Multi-Million Dollar Program Portfolio Budgeting', 'Agile at Scale (SAFe 6.0) Implementation', 'Enterprise Risk & Milestone Escalation Matrix', 'Vendor SLA Accountability Frameworks']
  },
  {
    roleFrom: 'Market Research Exec',
    roleTo: 'Consumer Insights Strategy Director',
    cat: 'Marketing, Growth & D2C',
    ind: 'Consumer Intelligence & FMCG Strategy',
    lvl: 'senior',
    cMin: 5.5,
    cMax: 26.0,
    time: 4,
    cities: ['Mumbai', 'Delhi-NCR', 'Bengaluru'],
    gaps: ['Conjoint Analysis & Pricing Sensitivity (Van Westendorp)', 'Ethnographic Qualitative Deep-Dives', 'Translating Raw Consumer Data into Brand Innovation', 'Presenting Consumer Trends to Boardrooms']
  },
  {
    roleFrom: 'Quality Assurance Associate',
    roleTo: 'Business Excellence & Lean Director',
    cat: 'Core Engineering & Industrial IoT',
    ind: 'Enterprise Business Excellence',
    lvl: 'senior',
    cMin: 6.0,
    cMax: 26.0,
    time: 4,
    cities: ['Pune', 'Chennai', 'Bengaluru'],
    gaps: ['Malcolm Baldrige / CII Business Excellence Model', 'End-to-End Enterprise Process Re-Engineering', 'Hoshin Kanri Strategic Policy Deployment', 'Quantifying Multi-Million Rupee Productivity Gains']
  },
  {
    roleFrom: 'Sustainability Coordinator',
    roleTo: 'ESG Management Consulting Partner',
    cat: 'Energy, CleanTech & Oil/Gas',
    ind: 'ESG Management Consulting',
    lvl: 'executive',
    cMin: 7.0,
    cMax: 44.0,
    time: 5,
    cities: ['Gurugram', 'Mumbai', 'London / Remote'],
    gaps: ['Corporate ESG Assurance & BRSR Core Filings', 'TCFD Climate Scenario Stress Testing', 'ESG Rating Agency (MSCI/Sustainalytics) Uplift', 'Structuring Green Bonds & Sustainability-Linked Loans']
  },
  {
    roleFrom: 'IT Auditor',
    roleTo: 'Cyber Risk Advisory Director',
    cat: 'Technology, Cloud & AI',
    ind: 'Cyber Risk & Third-Party Governance',
    lvl: 'senior',
    cMin: 8.0,
    cMax: 30.0,
    time: 4,
    cities: ['Mumbai', 'Bengaluru', 'Dubai / UAE'],
    gaps: ['Vendor Third-Party Cyber Risk Assessments (TPCRM)', 'NIST Cybersecurity Framework (CSF 2.0) Audits', 'Cloud Security Posture Management (CSPM)', 'Board Cyber Governance & Insurance Underwriting']
  }
];

console.log(`Generating code for ${additionalArchetypes.length} transitions...`);

const generatedTransitions = additionalArchetypes.map((a, idx) => {
  const id = a.roleFrom.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_to_' + a.roleTo.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  
  return {
    id,
    industry: a.ind,
    industryCategory: a.cat,
    currentRole: a.roleFrom,
    targetRole: a.roleTo,
    timeEstimateMonths: a.time,
    currentAvgCtcLakhs: a.cMin,
    targetAvgCtcLakhs: a.cMax,
    difficulty: a.lvl === 'executive' ? 'High Impact' : (a.lvl === 'senior' ? 'Demanding' : 'Moderate'),
    experienceLevel: a.lvl,
    topLocations: a.cities,
    coreSkillGaps: a.gaps,
    phases: [
      {
        title: `Phase 1: Functional Mastery & Core Tooling (Weeks 1–${Math.round(a.time * 1.1)})`,
        weeks: `Weeks 1–${Math.round(a.time * 1.1)}`,
        focus: `Master the specialized methodologies, diagnostics, and tools required for ${a.roleTo}.`,
        milestones: [
          `Audit and document current operational baseline workflows from ${a.roleFrom}`,
          `Complete advanced role certification addressing ${a.gaps[0]}`,
          `Deploy initial proof-of-concept project demonstrating ${a.gaps[1]}`
        ]
      },
      {
        title: `Phase 2: High-Visibility Scaled Impact (Weeks ${Math.round(a.time * 1.1) + 1}–${Math.round(a.time * 2.5)})`,
        weeks: `Weeks ${Math.round(a.time * 1.1) + 1}–${Math.round(a.time * 2.5)}`,
        focus: `Execute cross-functional projects delivering quantifiable business value for ${a.roleTo}.`,
        milestones: [
          `Lead strategic initiative resolving ${a.gaps[2]} with measurable business ROI`,
          `Author production-grade governance playbook or technical specification`,
          `Conduct peer and executive stakeholder reviews validating delivery quality`
        ]
      },
      {
        title: `Phase 3: Executive Interview Positioning & Placement (Weeks ${Math.round(a.time * 2.5) + 1}–${Math.round(a.time * 4)})`,
        weeks: `Weeks ${Math.round(a.time * 2.5) + 1}–${Math.round(a.time * 4)}`,
        focus: `Fine-tune executive presence, pass STAR interview simulations, and activate priority job matching.`,
        milestones: [
          `Optimize executive resume highlighting quantifiable achievements in ${a.ind}`,
          `Pass 3 simulated AI mock interview loops with tailored behavioral challenges`,
          `Dispatch verified profile to 30+ verified partner employers on JobMatch OS`
        ]
      }
    ]
  };
});

const insertMarker = 'export const generateCustomCareerTransition =';
const codeToAdd = '  // ── 152+ VERIFIED MULTI-INDUSTRY TRANSITIONS ACROSS ALL 16 SECTORS ──\n' +
  generatedTransitions.map(t => {
    return '  ' + JSON.stringify(t, null, 2).replace(/"([^"]+)":/g, '$1:').replace(/"/g, "'") + ',';
  }).join('\n') + '\n\n';

content = content.replace(insertMarker, codeToAdd + insertMarker);

fs.writeFileSync(targetFilePath, content, 'utf8');
console.log('Successfully written all transitions to careerPathwaysCatalog.ts!');
